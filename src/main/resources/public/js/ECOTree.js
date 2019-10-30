/*-------------------------------------------------------------------------------------------
|     ECOTree.js
|--------------------------------------------------------------------------------------------
| (c) 2019 Álvaro Juan Ciriaco
|
|     ECOTree is a javascript component for tree drawing. It implements the node positioning
|     algorithm of John Q. Walker II "Positioning nodes for General Trees".
|
|     Basic features include:
|       - Layout features: Different node sizes, colors, link types, alignments, separations
|                          root node positions, etc...
|       - Nodes can include a title and an hyperlink, and a hidden metadata.
|       - Subtrees can be collapsed and expanded at will.
|       - Single and Multiple selection modes.
|       - Search nodes using title and metadata as well.
|
|     This code is free source, but you will be kind if you don't distribute modified versions
|     with the same name, to avoid version collisions. Otherwise, please hack it!
|
|
|     Last updated: October 09th, 2019
|     Version: 1.0a
\------------------------------------------------------------------------------------------*/

ECONode = function (id, type, pid, prop, pnodes, dsc, moreData, dataProp, w, h, c, tc, bc, target, meta) {
	this.type = type;
	this.id = id;
	this.pid = pid;
	this.pnodes = pnodes;
	this.dsc = dsc;
	this.moreData = moreData;
	this.dataProp = dataProp;
	this.prop = prop;
	this.w = w;
	this.h = h;
	this.c = c;
	this.tc = tc;
	this.bc = bc;
	this.target = target;
	this.meta = meta;

	this.siblingIndex = 0;
	this.dbIndex = 0;

	this.XPosition = 0;
	this.YPosition = 0;
	this.XPositionOld = 0;
	this.YPositionOld = 0;
	this.prelim = 0;
	this.modifier = 0;
	this.leftNeighbor = null;
	this.rightNeighbor = null;
	this.nodeParent = [];
	this.nodeChildren = [];

	this.isCollapsed = false;
	this.canCollapse = false;

	this.isSelected = false;

	this.level = -1;
	// Indica si ya se ha pintado el nodo con otro padre,
	// para no volverlo a pintar (esto se utiliza para los
	// nodos con varios padres, solo pintarlo una vez en
	// level del padre con más level + 1). Se utiliza unicamente
	// en la primera pintada
	this.drawn = false;
	// Indica si ya se le ha asignado la posición exacta al
	// nodo en la segunda pintada (que es donde se modifica
	// la posicion segun los padres que tiene)
	this.secondDrawn = false;
	// Indica el tamaño de fuente que se va a usar en los nodos.
	// Dependiendo del tamaño de la fuente se modifica la altura
	// de la cabecera de los nodos y el cuerpo porque el texto
	// ocupa más o menos dependiendo del tmaaño de la fuente
	this.fontSize = 15;
}

ECONode.prototype._getLevel = function () {
	if (this.nodeParent.id == -1) {return 0;}
	else return this.nodeParent._getLevel() + 1;
}

ECONode.prototype._isAncestorCollapsed = function () {
	//alert"Miramos si el padre esta collapsed -> " + this.nodeParent.id + this.nodeParent.isCollapsed);
	if (this.nodeParent.isCollapsed) { return true; }
	else
	{
		if (this.nodeParent.id == -1) { return false; }
		else	{ return this.nodeParent._isAncestorCollapsed(); }
	}
}

ECONode.prototype._setAncestorsExpanded = function () {
	if (this.nodeParent.id == -1) { return; }
	else
	{
		this.nodeParent.isCollapsed = false;
		return this.nodeParent._setAncestorsExpanded();
	}
}

ECONode.prototype._getChildrenCount = function () {
	if (this.isCollapsed) return 0;
	if(this.nodeChildren == null)
		return 0;
	else
		return this.nodeChildren.length;
}

ECONode.prototype._getLeftSibling = function () {
	if(this.leftNeighbor != null && this.leftNeighbor.nodeParent == this.nodeParent)
		return this.leftNeighbor;
	else
		return null;
}

ECONode.prototype._getRightSibling = function () {
	if(this.rightNeighbor != null && this.rightNeighbor.nodeParent == this.nodeParent)
		return this.rightNeighbor;
	else
		return null;
}

ECONode.prototype._getChildAt = function (i) {
	return this.nodeChildren[i];
}

ECONode.prototype._getChildrenCenter = function (tree) {
	node = this._getFirstChild();
	node1 = this._getLastChild();
	return node.prelim + ((node1.prelim - node.prelim) + tree._getNodeSize(node1)) / 2;
}

ECONode.prototype._getFirstChild = function () {
	return this._getChildAt(0);
}

ECONode.prototype._getLastChild = function () {
	return this._getChildAt(this._getChildrenCount() - 1);
}

ECONode.prototype._drawChildrenLinks = function (tree) {
	var s = [];
	var xa = 0, ya = 0, xb = 0, yb = 0, xc = 0, yc = 0, xd = 0, yd = 0;
	var node1 = null;
	var pnode = this;

	switch(tree.config.iRootOrientation)
	{
		case ECOTree.RO_TOP:
			xa = this.XPosition + (this.w / 2);
			ya = this.YPosition + this.h;
			break;

		case ECOTree.RO_BOTTOM:
			xa = this.XPosition + (this.w / 2);
			ya = this.YPosition;
			break;

		case ECOTree.RO_RIGHT:
			xa = this.XPosition;
			ya = this.YPosition + (this.h / 2);
			break;

		case ECOTree.RO_LEFT:
			xa = this.XPosition + this.w;
			ya = this.YPosition + (this.h / 2);
			break;
	}

	for (var k = 0; k < this.nodeChildren.length; k++)
	{
		node1 = this.nodeChildren[k];

		switch(tree.config.iRootOrientation)
		{
			case ECOTree.RO_TOP:
				xd = xc = node1.XPosition + (node1.w / 2);
				yd = node1.YPosition;
				xb = xa;
				switch (tree.config.iNodeJustification)
				{
					case ECOTree.NJ_TOP:
						yb = yc = yd - tree.config.iLevelSeparation / 2;
						break;
					case ECOTree.NJ_BOTTOM:
						yb = yc = ya + tree.config.iLevelSeparation / 2;
						break;
					case ECOTree.NJ_CENTER:
						yb = yc = ya + (yd - ya) / 2;
						break;
				}
				break;

			case ECOTree.RO_BOTTOM:
				xd = xc = node1.XPosition + (node1.w / 2);
				yd = node1.YPosition + node1.h;
				xb = xa;
				switch (tree.config.iNodeJustification)
				{
					case ECOTree.NJ_TOP:
						yb = yc = yd + tree.config.iLevelSeparation / 2;
						break;
					case ECOTree.NJ_BOTTOM:
						yb = yc = ya - tree.config.iLevelSeparation / 2;
						break;
					case ECOTree.NJ_CENTER:
						yb = yc = yd + (ya - yd) / 2;
						break;
				}
				break;

			case ECOTree.RO_RIGHT:
				xd = node1.XPosition + node1.w;
				yd = yc = node1.YPosition + (node1.h / 2);
				yb = ya;
				switch (tree.config.iNodeJustification)
				{
					case ECOTree.NJ_TOP:
						xb = xc = xd + tree.config.iLevelSeparation / 2;
						break;
					case ECOTree.NJ_BOTTOM:
						xb = xc = xa - tree.config.iLevelSeparation / 2;
						break;
					case ECOTree.NJ_CENTER:
						xb = xc = xd + (xa - xd) / 2;
						break;
				}
				break;

			case ECOTree.RO_LEFT:
				xd = node1.XPosition;
				yd = yc = node1.YPosition + (node1.h / 2);
				yb = ya;
				switch (tree.config.iNodeJustification)
				{
					case ECOTree.NJ_TOP:
						xb = xc = xd - tree.config.iLevelSeparation / 2;
						break;
					case ECOTree.NJ_BOTTOM:
						xb = xc = xa + tree.config.iLevelSeparation / 2;
						break;
					case ECOTree.NJ_CENTER:
						xb = xc = xa + (xd - xa) / 2;
						break;
				}
				break;
		}
		//alert("i = " + i);
		//alert("Nodo -> " + node1.dsc);
		var dashedLine = false;
		if (node1.pnodes.length > 1)
		{
			//alert("Nodo -> " + node1.dsc);
			//alert("Numero de padres -> " + node.nodeChildren[i].pnodes.length);
			for (var x = 0; x < node1.pnodes.length; x++)
			{
				//alert("NodeChildren -> " + node.nodeChildren[i].dsc + " --- " + "Node pid -> " + node.nodeChildren[i].pnodes[x]);
				if (pnode.isCollapsed && !node1.pnodes[x].isCollapsed)
				{
					//alert("dashedLine = true");
					dashedLine = true;
					//alert("Le metemos dashed line a node1 = " + node1.dsc);
				}
			}
		}
		if (!this.isCollapsed || this.isCollapsed && dashedLine)
		{
			//alert("Pintamos linea de nodo padre = " + pnode.dsc + " a nodo hijo = " + node1.dsc);
			switch(tree.render)
			{
				case "CANVAS":
					tree.ctx.save();
					tree.ctx.strokeStyle = tree.config.linkColor;
					tree.ctx.beginPath();
					if(this.isCollapsed && dashedLine)
						tree.ctx.setLineDash([5, 5]);
					switch (tree.config.linkType)
					{
						case "B":
							// Si la union es entre un nodo primitivo y un nodo
							// definido lo que hacemos es pintar 2 links para
							// diferenciarlo
							if (node1.type.localeCompare("Definido") == 0 &&
								pnode.type.localeCompare("Primitivo") == 0)
							{
								switch(tree.config.iRootOrientation) {
									case ECOTree.RO_TOP:
										tree.ctx.moveTo(xa-3,ya);
										tree.ctx.bezierCurveTo(xb-3,yb,xc-3,yc,xd-3,yd);
										tree.ctx.moveTo(xa+3,ya);
										tree.ctx.bezierCurveTo(xb+3,yb,xc+3,yc,xd+3,yd);
										tree.ctx.lineWidth = 1;
										break;

									case ECOTree.RO_LEFT:
										tree.ctx.moveTo(xa,ya-3);
										tree.ctx.bezierCurveTo(xb,yb-3,xc,yc-3,xd,yd-3);
										tree.ctx.moveTo(xa,ya+3);
										tree.ctx.bezierCurveTo(xb,yb+3,xc,yc+3,xd,yd+3);
										tree.ctx.lineWidth = 1;
										break;
								}
							}
							else
							{
								tree.ctx.moveTo(xa,ya);
								tree.ctx.bezierCurveTo(xb,yb,xc,yc,xd,yd);
								tree.ctx.lineWidth = 2;
							}
							break;
					}
					tree.ctx.stroke();
					tree.ctx.restore();
					break;

				case "VML":
					switch (tree.config.linkType)
					{
						case "M":
							s.push('<v:polyline points="');
							s.push(xa + ' ' + ya + ' ' + xb + ' ' + yb + ' ' + xc + ' ' + yc + ' ' + xd + ' ' + yd);
							s.push('" strokecolor="'+tree.config.linkColor+'"><v:fill on="false" /></v:polyline>');
							break;
						case "B":
							s.push('<v:curve from="');
							s.push(xa + ' ' + ya + '" control1="' + xb + ' ' + yb + '" control2="' + xc + ' ' + yc + '" to="' + xd + ' ' + yd);
							s.push('" strokecolor="'+tree.config.linkColor+'"><v:fill on="false" /></v:curve>');
							break;
					}
					break;

			}
		}
	}
	return s.join('');
}

ECONode.prototype._drawPropertiesLinks = function (tree, positionX, positionY, positionX2, positionY2, type) {
	var s = [];
	switch(tree.render)
	{
		case "CANVAS":
			tree.ctx.save();
			switch (tree.config.linkType)
			{
				case "B":
					switch (type)
					{
						case "prop":
							tree.ctx.strokeStyle = tree.config.linkColor;
							tree.ctx.beginPath();
							//alert("Linea de: " + positionX + "/" + positionY + " to " + + positionX2 + "/" + positionY2);
							tree.ctx.moveTo(positionX,positionY);
							tree.ctx.lineTo(positionX2,positionY2);
							tree.ctx.lineWidth = 1;
							tree.ctx.stroke();
							tree.ctx.restore();
							break;

						case "range":
							tree.ctx.strokeStyle = tree.config.linkColorRange;
							tree.ctx.beginPath();
							//alert("Linea de: " + positionX + "/" + positionY + " to " + + positionX2 + "/" + positionY2);
							tree.ctx.moveTo(positionX-2,positionY+9);
							//tree.ctx.bezierCurveTo(positionX,positionY,positionX2,positionY2,positionX2,positionY2+5);
							tree.ctx.lineTo(positionX2,positionY2);
							tree.ctx.lineWidth = 0.5;
							tree.ctx.stroke();

							var coord = getBezierXY(0, positionX, positionY+10, positionX - 31,
								positionY, positionX2 - 11, positionY2, positionX2, positionY2+5);
							var angle = getBezierAngle(0, positionX, positionY+10, positionX - 31,
								positionY, positionX2 - 11, positionY2, positionX2, positionY2+5);

							tree.ctx.save();
							tree.ctx.beginPath();
							tree.ctx.translate(coord.x-5, coord.y-2.5);
							tree.ctx.rotate(angle);
							tree.ctx.moveTo(-4, -4);
							tree.ctx.lineTo(4, 0);
							tree.ctx.lineTo(-4, 4);
							tree.ctx.lineTo(-4, -4);
							tree.ctx.fillStyle = 'gray';
							tree.ctx.fill();

							tree.ctx.restore();
							break;
					}
				break;
			}
			break;
	}
	return s.join('');
}

function getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
	return {
		x: Math.pow(1-t,3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
		y: Math.pow(1-t,3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
	};
}

function getBezierAngle(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
	var dx = Math.pow(1-t, 2)*(cp1x-sx) + 2*t*(1-t)*(cp2x-cp1x) + t * t * (ex - cp2x);
	var dy = Math.pow(1-t, 2)*(cp1y-sy) + 2*t*(1-t)*(cp2y-cp1y) + t * t * (ey - cp2y);
	//alert(-Math.atan2(dx, dy) + 0.5*Math.PI);
	return (-Math.atan2(dx, dy) + 0.5*Math.PI);
}

ECOTree = function (obj, elm) {
	this.config = {
		iMaxDepth : 300,
		iLevelSeparation : 100,
		iSiblingSeparation : 5,
		iSubtreeSeparation : 5,
		iRootOrientation : ECOTree.RO_TOP,
		iNodeJustification : ECOTree.NJ_TOP,
		topXAdjustment : 250,
		topYAdjustment : 200,
		render : "CANVAS",
		linkType : "M",
		linkColor : "blue",
		linkColorRange : "gray",
		nodeColor : "#CCCCFF",
		nodeTitleColor : "#777777",
		nodeFill : ECOTree.NF_GRADIENT,
		nodeBorderColor : "blue",
		nodeSelColor : "#FFFFCC",
		levelColors : ["#5555FF","#8888FF","#AAAAFF","#CCCCFF"],
		levelBorderColors : ["#5555FF","#8888FF","#AAAAFF","#CCCCFF"],
		colorStyle : ECOTree.CS_NODE,
		useTarget : true,
		searchMode : ECOTree.SM_DSC,
		selectMode : ECOTree.SL_NONE,
		defaultNodeWidth : 80,
		defaultNodeHeight : 40,
		defaultTarget : 'javascript:void(0);',
		expandedImage : './img/less.gif',
		collapsedImage : './img/plus.gif',
		transImage : './img/trans.gif'
	}

	this.version = "1.1";
	this.obj = obj;
	this.elm = document.getElementById(elm);
	this.self = this;
	this.render = (this.config.render == "AUTO" ) ? ECOTree._getAutoRenderMode() : this.config.render;
	this.ctx = null;
	this.canvasoffsetTop = 0;
	this.canvasoffsetLeft = 0;

	this.maxLevelHeight = [];
	this.maxLevelWidth = [];
	this.previousLevelNode = [];

	this.rootYOffset = 0;
	this.rootXOffset = 0;

	this.nDatabaseNodes = [];
	this.mapIDs = {};

	this.root = new ECONode(-1, null, null, null, 2, 2);
	this.iSelectedNode = -1;
	this.iLastSearch = 0;

	this.repaint = false;

}

//Constant values

//Tree orientation
ECOTree.RO_TOP = 0;
ECOTree.RO_BOTTOM = 1;
ECOTree.RO_RIGHT = 2;
ECOTree.RO_LEFT = 3;

//Level node alignment
ECOTree.NJ_TOP = 0;
ECOTree.NJ_CENTER = 1;
ECOTree.NJ_BOTTOM = 2;

//Node fill type
ECOTree.NF_GRADIENT = 0;
ECOTree.NF_FLAT = 1;

//Colorizing style
ECOTree.CS_NODE = 0;
ECOTree.CS_LEVEL = 1;

//Search method: Title, metadata or both
ECOTree.SM_DSC = 0;
ECOTree.SM_META = 1;
ECOTree.SM_BOTH = 2;

//Selection mode: single, multiple, no selection
ECOTree.SL_MULTIPLE = 0;
ECOTree.SL_SINGLE = 1;
ECOTree.SL_NONE = 2;


ECOTree._getAutoRenderMode = function() {
	var r = "VML";
	var is_ie6 = /msie 6\.0/i.test(navigator.userAgent);
	var is_ff = /Firefox/i.test(navigator.userAgent);
	if (is_ff) r = "CANVAS";
	return r;
}

//CANVAS functions...
ECOTree._clearRect = function (ctx,x,y,width,height,radius,dsc,moreData,fontSize) {
	ctx.clearRect(x-10, y-10, width+20, fontSize*1.5+20);
	ctx.clearRect(x-10, y-10 + fontSize*1.5, width+20, height+20 - fontSize*1.5);
}

ECOTree._roundedRectTitle = function (ctx,type,x,y,width,height,radius,dsc,moreData,fontSize) {
	ctx.beginPath();
	if (type.localeCompare("Definido") == 0)
	{
		ctx.rect(x, y, width, fontSize*1.5);
	}
	else if (type.localeCompare("Primitivo") == 0)
	{
		ctx.rect(x, y, width, height);
	}
	ctx.fill();
	ctx.stroke();
}

ECOTree._roundedRect = function (ctx,type,x,y,width,height,radius,dsc,moreData,fontSize) {
	ctx.beginPath();
	if (type.localeCompare("Definido") == 0)
	{
		ctx.rect(x, y + fontSize*1.5, width, height - fontSize*1.5);
	}
	ctx.fill();
	ctx.stroke();
}

ECOTree._canvasNodeClickHandler = function (tree,target,nodeid) {
	if (target != nodeid) return;
	tree.selectNode(nodeid,true);
}

//Layout algorithm
ECOTree._firstWalk = function (tree, node, level) {
	//alert("Entramos firstWalk para node -> " + node.id);
	var leftSibling = null;

	// Reset draw variables
	node.drawn = false;
	node.secondDrawn = false;
	node.XPosition = 0;
	node.YPosition = 0;
	node.prelim = 0;
	node.modifier = 0;
	node.leftNeighbor = null;
	node.rightNeighbor = null;
	tree._setLevelHeight(node, level);
	tree._setLevelWidth(node, level);
	tree._setNeighbors(node, level);
	if(node._getChildrenCount() == 0 || level == tree.config.iMaxDepth)
	{
		//alert("Final del nodo -> " + node.id);
		leftSibling = node._getLeftSibling();
		if(leftSibling != null)
			node.prelim = leftSibling.prelim + tree._getNodeSize(leftSibling) + tree.config.iSiblingSeparation;
		else
			node.prelim = 0;
	}
	else
	{
		var n = node._getChildrenCount();
		//alert("Numero de hijos de " + node.id + " = " + n);
		for(var i = 0; i < n; i++)
		{
			var iChild = node._getChildAt(i);
			//alert("Cogemos hijo -> " + iChild.id);
			// Si tiene varios padres, lo pintamos a la altura de los hijos del
			// padre con un depth mayor
			if (iChild.pid != null && iChild.pid.length > 1)
			{
				//alert("Nodo -> " + iChild.dsc + " tiene mas de 1 padre -> " + iChild.pid);
				var parentMoreLevel = false;
				for (var x = 0; x<iChild.pid.length; x++)
				{
					for (var u = 0; u < tree.nDatabaseNodes.length; u++) {
						var newParentNode = tree.nDatabaseNodes[u];
						//alert(newParentNode.id + " -- " + iChild.pid[x]);
						if (newParentNode.id == iChild.pid[x]) {
							//alert("Padre -> " + newParentNode.dsc + " tiene depth = " + newParentNode._getLevel() + " >= " + level);
							if (parseInt(newParentNode._getLevel()) >= parseInt(level)) {
								//alert("Tiene un padre con mas level!! -> " + parentMoreLevel);
								parentMoreLevel = true;
								break;
							}
						}
					}
				}
				if (!parentMoreLevel && !iChild.drawn)
				{
					iChild.nodeParent = node;
					//alert("Elegimos como padre del nodo = " + iChild.id + " el nodo = " + node.id);
					ECOTree._firstWalk(tree, iChild, level + 1);
					iChild.drawn = true;
				}
			}
			else
			{
				ECOTree._firstWalk(tree, iChild, level + 1);
				iChild.drawn = true;
			}
		}
		var midPoint = node._getChildrenCenter(tree);
		midPoint -= tree._getNodeSize(node) / 2;
		leftSibling = node._getLeftSibling();
		if(leftSibling != null)
		{
			//alert("El nodo -> " + node.id + " le elegimos el prelim en el ultimo if");
			node.prelim = leftSibling.prelim + tree._getNodeSize(leftSibling) + tree.config.iSiblingSeparation;
			node.modifier = node.prelim - midPoint;
			ECOTree._apportion(tree, node, level);
		}
		else
		{
			node.prelim = midPoint;
		}
	}
	//alert("First wall node -> " + node.id + " pid -> " + node.pid + " X -> " + node.XPosition + " Y -> " + node.YPosition + " node.prelim -> " + node.prelim);
}

ECOTree._apportion = function (tree, node, level) {
	//alert("entramos a apportion para node = " + node.id);
	var firstChild = node._getFirstChild();
	var firstChildLeftNeighbor = firstChild.leftNeighbor;
	var j = 1;
	for(var k = tree.config.iMaxDepth - level; firstChild != null && firstChildLeftNeighbor != null && j <= k;)
	{
		var modifierSumRight = 0;
		var modifierSumLeft = 0;
		var rightAncestor = firstChild;
		var leftAncestor = firstChildLeftNeighbor;
		for(var l = 0; l < j; l++)
		{
			rightAncestor = rightAncestor.nodeParent;
			leftAncestor = leftAncestor.nodeParent;
			modifierSumRight += rightAncestor.modifier;
			modifierSumLeft += leftAncestor.modifier;
		}

		var totalGap = (firstChildLeftNeighbor.prelim + modifierSumLeft + tree._getNodeSize(firstChildLeftNeighbor) + tree.config.iSubtreeSeparation) - (firstChild.prelim + modifierSumRight);
		if(totalGap > 0)
		{
			var subtreeAux = node;
			var numSubtrees = 0;
			for(; subtreeAux != null && subtreeAux != leftAncestor; subtreeAux = subtreeAux._getLeftSibling())
				numSubtrees++;

			if(subtreeAux != null)
			{
				var subtreeMoveAux = node;
				var singleGap = totalGap / numSubtrees;
				for(; subtreeMoveAux != leftAncestor; subtreeMoveAux = subtreeMoveAux._getLeftSibling())
				{
					subtreeMoveAux.prelim += totalGap;
					subtreeMoveAux.modifier += totalGap;
					totalGap -= singleGap;
				}

			}
		}
		j++;
		if(firstChild._getChildrenCount() == 0)
			firstChild = tree._getLeftmost(node, 0, j);
		else
			firstChild = firstChild._getFirstChild();
		if(firstChild != null)
			firstChildLeftNeighbor = firstChild.leftNeighbor;
	}
	//alert"Aportation node -> " + node.id + " firstChild -> " + firstChild + " firstChildLeftNeighbor -> " + firstChildLeftNeighbor + " node.prelim -> " + node.prelim);
}

ECOTree._secondWalk = function (tree, node, level, X, Y) {
	//alert("Entramos a secondWalk con node = " + node.id);
	if(level <= tree.config.iMaxDepth)
	{
		//alert"level <= maxdepth");
		var xTmp = tree.rootXOffset + node.prelim + X;
		var yTmp = tree.rootYOffset + Y;
		var maxsizeTmp = 0;
		var nodesizeTmp = 0;
		var flag = false;
		if(!node.secondDrawn)
		{
			switch(tree.config.iRootOrientation)
			{
				case ECOTree.RO_TOP:
				case ECOTree.RO_BOTTOM:
					maxsizeTmp = tree.maxLevelHeight[level];
					nodesizeTmp = node.h;
					break;

				case ECOTree.RO_RIGHT:
				case ECOTree.RO_LEFT:
					maxsizeTmp = tree.maxLevelWidth[level];
					flag = true;
					nodesizeTmp = node.w;
					break;
			}
			switch(tree.config.iNodeJustification)
			{
				case ECOTree.NJ_TOP:
					node.XPosition = xTmp;
					node.YPosition = yTmp;
					//node.XPosition = Math.floor(Math.random() * 15000);
					//node.YPosition = Math.floor(Math.random() * 10);
					break;

				case ECOTree.NJ_CENTER:
					node.XPosition = xTmp;
					node.YPosition = yTmp + (maxsizeTmp - nodesizeTmp) / 2;
					break;

				case ECOTree.NJ_BOTTOM:
					node.XPosition = xTmp;
					node.YPosition = (yTmp + maxsizeTmp) - nodesizeTmp;
					break;
			}
			if(flag)
			{
				var swapTmp = node.XPosition;
				node.XPosition = node.YPosition;
				node.YPosition = swapTmp;
			}
			switch(tree.config.iRootOrientation)
			{
				case ECOTree.RO_BOTTOM:
					node.YPosition = -node.YPosition - nodesizeTmp;
					break;

				case ECOTree.RO_RIGHT:
					node.XPosition = -node.XPosition - nodesizeTmp;
					break;
			}
			if(node._getChildrenCount() != 0)
				ECOTree._secondWalk(tree, node._getFirstChild(), level + 1, X + node.modifier, Y + maxsizeTmp + tree.config.iLevelSeparation);
			var rightSibling = node._getRightSibling();
			if(rightSibling != null)
				ECOTree._secondWalk(tree, rightSibling, level, X, Y);
			node.secondDrawn = true;
		}
	}
	//alert("Second wall node -> " + node.id + " pid -> " + node.pid + " X -> " + node.XPosition + " Y -> " + node.YPosition + " node.prelim -> " + node.prelim);
}

ECOTree.prototype._positionTree = function () {
	this.maxLevelHeight = [];
	this.maxLevelWidth = [];
	this.previousLevelNode = [];
	ECOTree._firstWalk(this.self, this.root, 0);

	switch(this.config.iRootOrientation)
	{
		case ECOTree.RO_TOP:
		case ECOTree.RO_LEFT:
			this.rootXOffset = this.config.topXAdjustment + this.root.XPosition;
			this.rootYOffset = this.config.topYAdjustment + this.root.YPosition;
			break;

		case ECOTree.RO_BOTTOM:
		case ECOTree.RO_RIGHT:
			this.rootXOffset = this.config.topXAdjustment + this.root.XPosition;
			this.rootYOffset = this.config.topYAdjustment + this.root.YPosition;
	}

	ECOTree._secondWalk(this.self, this.root, 0, 0, 0);
}

ECOTree.prototype._setLevelHeight = function (node, level) {
	if (this.maxLevelHeight[level] == null)
		this.maxLevelHeight[level] = 0;
	if(this.maxLevelHeight[level] < node.h)
		this.maxLevelHeight[level] = node.h;
}

ECOTree.prototype._setLevelWidth = function (node, level) {
	if (this.maxLevelWidth[level] == null)
		this.maxLevelWidth[level] = 0;
	if(this.maxLevelWidth[level] < node.w)
		this.maxLevelWidth[level] = node.w;
}

ECOTree.prototype._setNeighbors = function(node, level) {
	node.leftNeighbor = this.previousLevelNode[level];
	//alert("PreviousLevel = " + this.previousLevelNode);
	if(node.leftNeighbor != null)
	{
		node.leftNeighbor.rightNeighbor = node;
		//alert("El nodo izquiero que elegimos para " + node.id + " es " + node.leftNeighbor.id);
	}
	this.previousLevelNode[level] = node;
}

ECOTree.prototype._getNodeSize = function (node) {
	switch(this.config.iRootOrientation)
	{
		case ECOTree.RO_TOP:
		case ECOTree.RO_BOTTOM:
			return node.w;

		case ECOTree.RO_RIGHT:
		case ECOTree.RO_LEFT:
			return node.h;
	}
	return 0;
}

ECOTree.prototype._getLeftmost = function (node, level, maxlevel) {
	if(level >= maxlevel) return node;
	if(node._getChildrenCount() == 0) return null;

	var n = node._getChildrenCount();
	for(var i = 0; i < n; i++)
	{
		var iChild = node._getChildAt(i);
		var leftmostDescendant = this._getLeftmost(iChild, level + 1, maxlevel);
		if(leftmostDescendant != null)
			return leftmostDescendant;
	}

	return null;
}

ECOTree.prototype._selectNodeInt = function (dbindex, flagToggle) {
	if (this.config.selectMode == ECOTree.SL_SINGLE)
	{
		if ((this.iSelectedNode != dbindex) && (this.iSelectedNode != -1))
		{
			this.nDatabaseNodes[this.iSelectedNode].isSelected = false;
		}
		this.iSelectedNode = (this.nDatabaseNodes[dbindex].isSelected && flagToggle) ? -1 : dbindex;
	}
	this.nDatabaseNodes[dbindex].isSelected = (flagToggle) ? !this.nDatabaseNodes[dbindex].isSelected : true;
}

ECOTree.prototype._collapseAllInt = function (flag) {
	var node = null;
	for (var n = 0; n < this.nDatabaseNodes.length; n++)
	{
		node = this.nDatabaseNodes[n];
		if (node.canCollapse) node.isCollapsed = flag;
	}
	this.UpdateTree();
}

ECOTree.prototype._selectAllInt = function (flag) {
	var node = null;
	for (var k = 0; k < this.nDatabaseNodes.length; k++)
	{
		node = this.nDatabaseNodes[k];
		node.isSelected = flag;
	}
	this.iSelectedNode = -1;
	this.UpdateTree();
}

ECOTree.prototype._drawTree = function () {
	var s = [];
	var node = null;
	var color = "";
	var titleColor = "";
	var border = "";
	this.ctx.clearRect(0, 0, 15000, 15000);

	for (var n = 0; n < this.nDatabaseNodes.length; n++)
	{
		node = this.nDatabaseNodes[n];
		switch (this.config.colorStyle) {
			case ECOTree.CS_NODE:
				color = node.c;
				titleColor = node.tc;
				border = node.bc;
				break;
			case ECOTree.CS_LEVEL:
				var iColor = node._getLevel() % this.config.levelColors.length;
				color = this.config.levelColors[iColor];
				iColor = node._getLevel() % this.config.levelBorderColors.length;
				border = this.config.levelBorderColors[iColor];
				break;
		}
		var hasParentNoCollapsed = false;
		if (node.pnodes != null && node.pnodes.length > 1)
		{
			for (var i = 0; i < node.pnodes.length; i++)
			{
				if (node.pnodes[i].id != -1 && !node.pnodes[i].isCollapsed)
				{
					hasParentNoCollapsed = true;
				}
			}
		}
		//alert("Node " + node.dsc + " _isAncestorCollapsed = " + node._isAncestorCollapsed() + " - " + hasParentNoCollapsed);
		if (!node._isAncestorCollapsed() || hasParentNoCollapsed)
		{
			switch (this.render)
			{
				case "CANVAS":
					//Canvas part... firts title rect
					this.ctx.save();
					this.ctx.strokeStyle = border;
					this.ctx.fillStyle = titleColor;
					ECOTree._roundedRectTitle(this.ctx,node.type,node.XPosition,node.YPosition,node.w,
						node.h,5,node.dsc,node.moreData,node.fontSize);
					this.ctx.restore();
					//Canvas part... second properties rect
					this.ctx.save();
					this.ctx.strokeStyle = border;
					switch (this.config.nodeFill) {
						case ECOTree.NF_GRADIENT:
							var lgradient = this.ctx.createLinearGradient(node.XPosition,0,node.XPosition+node.w,0);
							lgradient.addColorStop(0.0,((node.isSelected)?this.config.nodeSelColor:color));
							lgradient.addColorStop(1.0,"#F5FFF5");
							this.ctx.fillStyle = lgradient;
							break;

						case ECOTree.NF_FLAT:
							this.ctx.fillStyle = ((node.isSelected)?this.config.nodeSelColor:color);
							break;
					}
					var topPosition = (node.YPosition + this.canvasoffsetTop - 6 + node.fontSize * 1.5);
					var leftPosition = (node.XPosition + this.canvasoffsetLeft);
					var width = node.w;
					var height = (node.h - node.fontSize * 1.5);
					var lastTopPosition = 0;
					switch (this.config.iRootOrientation) {
						case ECOTree.RO_TOP:
							this.ctx.fillStyle = ((node.isSelected) ? this.config.nodeSelColor : color);
							if (node.dataProp != null && node.dataProp.length > 0) {
								s.push('<div id="prop' + node.id + '" align="left" class="econode" style="position:absolute; top:' + topPosition + 'px; left:' +
									(leftPosition + (node.w / 2 + 5)) + 'px; width:' + width + 'px; height:' + height + 'px; pointer-events:none;"><br>');
								for (var u = 0; u < node.dataProp.length; u++) {
									if (node.dataProp[u] != null && node.dataProp[u] != "") {
										s.push('<div align="center" style="position:absolute; top:'
											+ (lastTopPosition + 15) + 'px; left:0px; width:' + width + 'px; height:' +
											(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
											'&nbsp;&nbsp;&nbsp;&nbsp;' + node.dataProp[u].split("\(")[0] + '</div>');
										lastTopPosition = lastTopPosition + node.fontSize * 1.5;
									}
								}
								if (node.prop == null || node.prop != null && node.prop.length <= 0)
									s.push("</div>");
							}
							if (node.prop != null && node.prop.length > 0) {
								//alert(node.prop);
								for (var p = 0; p < node.prop.length; p++) {
									if (node.prop[p] != "" && !node.prop[p].includes("(parent=")) {
										// Calculate the width of the text in JavaScript
										var widthTextParent = this.ctx.measureText(node.prop[p].split("\(")[0]).width;
										var topPositionFirst = topPosition + lastTopPosition;
										topPosition = topPosition + lastTopPosition + node.fontSize * 1.5;
										var nSons = 0;
										var thatSonIs = 1;
										for (var r = 0; r < node.prop.length; r++) {
											if (node.prop[r] != "" && node.prop[r].includes("(parent=" + node.prop[p].split("\(")[0] + ")"))
												nSons++;
										}
										//alert("Sons en node " + node.dsc + " = " + nSons + " para prop = " + node.prop[p]);
										var leftPositionFirst = 0;
										if (nSons > 0) {
											s.push('<div align="center" style="position:absolute; top:' + (lastTopPosition+5) + 'px; ' +
												'left:0px; width:' + node.w + 'px; height:' +
												(node.fontSize * 1.5) + 'px; ' +
												'pointer-events:none">' +
												node.prop[p].split("\(")[0] + '</div>');
											leftPositionFirst = leftPosition + node.w / 2 + (widthTextParent + 5);
										} else {
											s.push('<div align="left" style="position:absolute; top:' + (lastTopPosition+5) + 'px; ' +
												'left:0px; width:' + (widthTextParent + 10) + 'px; height:' +
												(node.fontSize * 1.5) + 'px; ' +
												'pointer-events:none">' +
												node.prop[p].split("\(")[0] + '</div>');
											leftPositionFirst = leftPosition + (widthTextParent + 10);
										}
										var topPositionAbsolute = lastTopPosition + (node.fontSize);
										lastTopPosition = topPositionAbsolute;
										for (var u = 0; u < node.prop.length; u++) {
											var topPositionRange = topPositionFirst + 5;
											var leftPositionRange = leftPositionFirst + (node.w /2 + 5) - 10;
											if (node.prop[u] != "" && node.prop[u].includes("(parent=" + node.prop[p].split("\(")[0] + ")")) {
												var widthText = this.ctx.measureText(node.prop[u].split("\(")[0]).width;
												if (thatSonIs == 1 && nSons == 1) {
													s.push('<div align="center" style="position:absolute; top:'
														+ (topPositionAbsolute + (node.fontSize + 10)) + 'px; left:0px; width:' + node.w + 'px; height:' +
														(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
														'' + node.prop[u].split("\(")[0] + '</div>');
													s.push(node._drawPropertiesLinks(this.self, leftPosition + node.w / 2,
														topPositionFirst + (node.fontSize + 2), leftPosition + node.w / 2,
														topPositionFirst + topPositionAbsolute, "prop"));
													topPositionRange = topPositionAbsolute + topPositionFirst;
													lastTopPosition = topPositionAbsolute;
													leftPositionRange = leftPosition + (node.w /2 + 5) + node.w / 2 +
														this.ctx.measureText(node.prop[u].split("\(")[0]).width + 5;
												} else if (nSons > 1) {
													if (thatSonIs == 1) {
														s.push('<div align="left" style="position:absolute; top:'
															+ (topPositionAbsolute + (node.fontSize + 10)) + 'px; left:0px; ' +
															'width:' + node.w + 'px; height:' +
															(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
															'' + node.prop[u].split("\(")[0] + '</div>');
														var widthText = this.ctx.measureText(node.prop[u].split("\(")[0]).width;
														s.push(node._drawPropertiesLinks(this.self, leftPosition + (node.w /2 + 5) + node.w / 2,
															topPositionFirst + (node.fontSize + 2), leftPosition + (node.w /2 + 5) + (widthText / 2),
															topPositionFirst + topPositionAbsolute, "prop"));
														topPositionRange = topPositionAbsolute + topPositionFirst;
														lastTopPosition = topPositionAbsolute;
														leftPositionRange = leftPosition + (node.w /2 + 5) + widthText + 15;
													} else if (thatSonIs == nSons) {
														s.push('<div align="right" style="position:absolute; top:'
															+ (topPositionAbsolute + (node.fontSize + 10)) + 'px; left:' + (node.w / nSons) * (thatSonIs - 1) + 'px; ' +
															'width:' + (node.w - ((node.w / nSons) * (thatSonIs - 1))) + 'px; height:' +
															(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
															'' + node.prop[u].split("\(")[0] + '</div>');
														s.push(node._drawPropertiesLinks(this.self, leftPosition + (node.w /2 + 5) + node.w / 2,
															topPositionFirst + (node.fontSize + 2), leftPosition + (node.w /2 + 5) + (node.w) - (widthText / 2),
															topPositionFirst + topPositionAbsolute, "prop"));
														topPositionRange = topPositionAbsolute + topPositionFirst;
														lastTopPosition = topPositionAbsolute;
														leftPositionRange = leftPosition + (node.w /2 + 5) + (node.w) + (widthText);
													} else {
														s.push('<div align="left" style="position:absolute; top:'
															+ (topPositionAbsolute + (node.fontSize + 10)) + 'px; left:' + (node.w / nSons) * (thatSonIs - 1) + 'px; ' +
															'width:' + (node.w) + 'px; height:' +
															(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
															'' + node.prop[u].split("\(")[0] + '</div>');
														var widthText = this.ctx.measureText(node.prop[u].split("\(")[0]).width;
														s.push(node._drawPropertiesLinks(this.self, leftPosition + (node.w /2 + 5) + node.w / 2,
															topPositionFirst + (node.fontSize + 2), leftPosition + (node.w /2 + 5) +
															(node.w / nSons) * (thatSonIs - 1) + (widthText / 2),
															topPositionFirst + topPositionAbsolute, "prop"));
														topPositionRange = topPositionAbsolute + topPositionFirst;
														lastTopPosition = topPositionAbsolute;
														leftPositionRange = leftPosition + (node.w /2 + 20) +
															(node.w / nSons) * (thatSonIs - 1) + (widthText - 2);
													}
												}
												thatSonIs++;
											}
											if (node.prop[u] != "" && node.prop[u].includes("(range=") &&
												!node.prop[u].includes("(range=" + node.dsc + ")")) {
												var rangeNodeTo = "";
												var splitProp = node.prop[u].split("\(");
												for (var o = 0; o < splitProp.length; o++) {
													//alert(splitProp[o]);
													if (splitProp[o].includes("range")) {
														rangeNodeTo = splitProp[o].replace("range=", "").replace("\)", "");
														break;
													}
												}
												for (var o = 0; o < this.nDatabaseNodes.length; o++) {
													var nodeTo = this.nDatabaseNodes[o];
													if (nodeTo.dsc == rangeNodeTo && !node._isAncestorCollapsed() &&
														!nodeTo._isAncestorCollapsed()) {
														var relativePositionX2 = 0;
														var relativePositionY2 = 0;
														switch (this.config.iRootOrientation) {
															case ECOTree.RO_TOP:
																relativePositionX2 = nodeTo.XPosition + (nodeTo.w);
																relativePositionY2 = nodeTo.YPosition + (nodeTo.h / 2);
																break;
															case ECOTree.RO_LEFT:
																relativePositionX2 = nodeTo.XPosition + (nodeTo.w / 2);
																relativePositionY2 = nodeTo.YPosition + (nodeTo.h - 5);
																break;
														}
														s.push(node._drawPropertiesLinks(this.self, leftPositionRange, topPositionRange,
															relativePositionX2, relativePositionY2, "range"));
													}
												}
											}
										}
									}
								}
								s.push("</div>");
							}
							if (node.moreData != null && node.moreData != "" && node.moreData != "[]") {
								s.push('<div id="moreData' + node.id + '" class="econode" style="position:absolute; top:' + (node.YPosition + this.canvasoffsetTop - 6 + node.fontSize * 1.5) + 'px; left:' +
									(node.XPosition + this.canvasoffsetLeft) + 'px; width:' + node.w + 'px; height:' + (node.h - node.fontSize * 1.5) + 'px; pointer-events:none;">');
								s.push('<center><p>' + node.moreData + '</p></center></div>');
								ECOTree._roundedRect(this.ctx, node.type, node.XPosition, node.YPosition, node.w, node.h, 5, node.dsc, node.moreData, node.fontSize);
							}
							this.ctx.restore();
							break;

						case ECOTree.RO_LEFT:
							this.ctx.fillStyle = ((node.isSelected) ? this.config.nodeSelColor : color);
							var propDivCreated = false;
							if (node.prop != null && node.prop.length > 0) {
								propDivCreated = true;
								s.push('<div id="prop' + node.id + '" align="left" class="econode" style="position:absolute; top:' + topPosition + 'px; left:' +
									leftPosition + 'px; width:' + width + 'px; height:' + height + 'px; pointer-events:none;"><br>');
								for (var p = 0; p < node.prop.length; p++) {
									if (node.prop[p] != "" && !node.prop[p].includes("(parent=")) {
										// Calculate the width of the text in JavaScript
										var widthTextParent = this.ctx.measureText(node.prop[p].split("\(")[0]).width;
										var topPositionFirst = topPosition;
										topPosition = topPosition + node.fontSize * 1.5;
										var nSons = 0;
										var thatSonIs = 1;
										for (var r = 0; r < node.prop.length; r++) {
											if (node.prop[r] != "" && node.prop[r].includes("(parent=" + node.prop[p].split("\(")[0] + ")"))
												nSons++;
										}
										//alert("Sons en node " + node.dsc + " = " + nSons + " para prop = " + node.prop[p]);
										var leftPositionFirst = 0;
										if (nSons > 0) {
											s.push('<div align="center" style="position:absolute; top:5px; ' +
												'left:0px; width:' + node.w + 'px; height:' +
												(node.fontSize * 1.5) + 'px; ' +
												'pointer-events:none">' +
												node.prop[p].split("\(")[0] + '</div>');
											leftPositionFirst = leftPosition + node.w / 2 + (widthTextParent + 5);
										} else {
											s.push('<div align="left" style="position:absolute; top:5px; ' +
												'left:0px; width:' + (widthTextParent + 10) + 'px; height:' +
												(node.fontSize * 1.5) + 'px; ' +
												'pointer-events:none">' +
												node.prop[p].split("\(")[0] + '</div>');
											leftPositionFirst = leftPosition + (widthTextParent + 10);
										}
										var topPositionAbsolute = (node.fontSize * 2);
										lastTopPosition = topPositionAbsolute;
										for (var u = 0; u < node.prop.length; u++) {
											var topPositionRange = topPositionFirst + 5;
											var leftPositionRange = leftPositionFirst - 10;
											if (node.prop[u] != "" && node.prop[u].includes("(parent=" + node.prop[p].split("\(")[0] + ")")) {
												var widthText = this.ctx.measureText(node.prop[u].split("\(")[0]).width;
												if (thatSonIs == 1 && nSons == 1) {
													s.push('<div align="center" style="position:absolute; top:'
														+ topPositionAbsolute + 'px; left:0px; width:' + node.w + 'px; height:' +
														(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
														'' + node.prop[u].split("\(")[0] + '</div>');
													s.push(node._drawPropertiesLinks(this.self, leftPosition + node.w / 2,
														topPositionFirst + (node.fontSize + 2), leftPosition + node.w / 2,
														topPositionFirst + topPositionAbsolute, "prop"));
													topPositionRange = topPositionAbsolute + topPositionFirst;
													lastTopPosition = topPositionAbsolute;
													leftPositionRange = leftPosition + node.w / 2 +
														this.ctx.measureText(node.prop[u].split("\(")[0]).width + 5;
												} else if (nSons > 1) {
													if (thatSonIs == 1) {
														s.push('<div align="left" style="position:absolute; top:'
															+ topPositionAbsolute + 'px; left:0px; ' +
															'width:' + node.w + 'px; height:' +
															(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
															'' + node.prop[u].split("\(")[0] + '</div>');
														var widthText = this.ctx.measureText(node.prop[u].split("\(")[0]).width;
														s.push(node._drawPropertiesLinks(this.self, leftPosition + node.w / 2,
															topPositionFirst + (node.fontSize + 2), leftPosition + (widthText / 2),
															topPositionFirst + topPositionAbsolute, "prop"));
														topPositionRange = topPositionAbsolute + topPositionFirst;
														lastTopPosition = topPositionAbsolute;
														leftPositionRange = leftPosition + widthText + 15;
													} else if (thatSonIs == nSons) {
														s.push('<div align="right" style="position:absolute; top:'
															+ topPositionAbsolute + 'px; left:' + (node.w / nSons) * (thatSonIs - 1) + 'px; ' +
															'width:' + (node.w - ((node.w / nSons) * (thatSonIs - 1))) + 'px; height:' +
															(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
															'' + node.prop[u].split("\(")[0] + '</div>');
														s.push(node._drawPropertiesLinks(this.self, leftPosition + node.w / 2,
															topPositionFirst + (node.fontSize + 2), leftPosition + (node.w) - (widthText / 2),
															topPositionFirst + topPositionAbsolute, "prop"));
														topPositionRange = topPositionAbsolute + topPositionFirst;
														lastTopPosition = topPositionAbsolute;
														leftPositionRange = leftPosition + (node.w) + (widthText);
													} else {
														s.push('<div align="left" style="position:absolute; top:'
															+ topPositionAbsolute + 'px; left:' + (node.w / nSons) * (thatSonIs - 1) + 'px; ' +
															'width:' + (node.w) + 'px; height:' +
															(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
															'' + node.prop[u].split("\(")[0] + '</div>');
														var widthText = this.ctx.measureText(node.prop[u].split("\(")[0]).width;
														s.push(node._drawPropertiesLinks(this.self, leftPosition + node.w / 2,
															topPositionFirst + (node.fontSize + 2), leftPosition +
															(node.w / nSons) * (thatSonIs - 1) + (widthText / 2),
															topPositionFirst + topPositionAbsolute, "prop"));
														topPositionRange = topPositionAbsolute + topPositionFirst;
														lastTopPosition = topPositionAbsolute;
														leftPositionRange = leftPosition + 15 +
															(node.w / nSons) * (thatSonIs - 1) + (widthText - 2);
													}
												}
												thatSonIs++;
											}
											if (node.prop[u] != "" && node.prop[u].includes("(range=") &&
												!node.prop[u].includes("(range=" + node.dsc + ")")) {
												var rangeNodeTo = "";
												var splitProp = node.prop[u].split("\(");
												for (var o = 0; o < splitProp.length; o++) {
													//alert(splitProp[o]);
													if (splitProp[o].includes("range")) {
														rangeNodeTo = splitProp[o].replace("range=", "").replace("\)", "");
														break;
													}
												}
												for (var o = 0; o < this.nDatabaseNodes.length; o++) {
													var nodeTo = this.nDatabaseNodes[o];
													if (nodeTo.dsc == rangeNodeTo && !node._isAncestorCollapsed() &&
														!nodeTo._isAncestorCollapsed()) {
														var relativePositionX2 = 0;
														var relativePositionY2 = 0;
														switch (this.config.iRootOrientation) {
															case ECOTree.RO_TOP:
																relativePositionX2 = nodeTo.XPosition + (nodeTo.w);
																relativePositionY2 = nodeTo.YPosition + (nodeTo.h / 2);
																break;
															case ECOTree.RO_LEFT:
																relativePositionX2 = nodeTo.XPosition + (nodeTo.w / 2);
																relativePositionY2 = nodeTo.YPosition + (nodeTo.h - 5);
																break;
														}
														s.push(node._drawPropertiesLinks(this.self, leftPositionRange, topPositionRange,
															relativePositionX2, relativePositionY2, "range"));
													}
												}
											}
										}
									}
								}
								if (node.dataProp == null || node.dataProp.length == 0)
									s.push("</div>");
							}
							if (node.dataProp != null && node.dataProp.length > 0) {
								if (!propDivCreated) {
									s.push('<div id="prop' + node.id + '" align="left" class="econode" style="position:absolute; top:' + topPosition + 'px; left:' +
										leftPosition + 'px; width:' + width + 'px; height:' + height + 'px; pointer-events:none;"><br>');
									propDivCreated = true;
								}
								for (var u = 0; u < node.dataProp.length; u++) {
									if (node.dataProp[u] != null && node.dataProp[u] != "") {
										s.push('<div align="center" style="position:absolute; top:'
											+ (lastTopPosition + 15) + 'px; left:0px; width:' + width + 'px; height:' +
											(node.fontSize * 1.5) + 'px; pointer-events:none;">' +
											'' + node.dataProp[u].split("\(")[0] + '</div>');
										lastTopPosition = lastTopPosition + node.fontSize * 1.5;
									}
								}
								s.push("</div>");
							} else if (node.moreData != null && node.moreData != "" && node.moreData != "[]") {
								s.push('<div id="moreData' + node.id + '" class="econode" style="position:absolute; top:' + (node.YPosition + this.canvasoffsetTop - 6 + node.fontSize * 1.5) + 'px; left:' +
									(node.XPosition + this.canvasoffsetLeft) + 'px; width:' + node.w + 'px; height:' + (node.h - node.fontSize * 1.5) + 'px; pointer-events:none;">');
								s.push('<center><p>' + node.moreData + '</p></center></div>');
								ECOTree._roundedRect(this.ctx, node.type, node.XPosition, node.YPosition, node.w, node.h, 5, node.dsc, node.moreData, node.fontSize);
							}
							this.ctx.restore();
							break;
					}

					//HTML part...
					s.push('<div id="' + node.id + '" class="econode" style="position:absolute; top:'+(node.YPosition+this.canvasoffsetTop-6)+'px; left:'+
						(node.XPosition+this.canvasoffsetLeft+3)+'px; width:'+node.w+'px; height:'+node.h+'px; pointer-events:none;" ');
					if (this.config.selectMode != ECOTree.SL_NONE)
						s.push('onclick="javascript:ECOTree._canvasNodeClickHandler('+this.obj+',event.target.id,\''+node.id+'\');" >');
					else
						s.push('>');
					s.push('<center><p><b>' + node.dsc + '</b></p></center></div>');
					if (node.canCollapse) {
						s.push('<div id="' + node.id + '" class="econode" style="position:absolute; top:'+(node.YPosition+this.canvasoffsetTop-6)+'px; left:'+
							(node.XPosition+this.canvasoffsetLeft+3)+'px; width:'+node.w/10+'px; height:'+node.fontSize*1.5/5+'px; cursor: pointer;">');
						s.push('<a href="javascript:'+this.obj+'.collapseNode(\''+node.id+'\', true);" >');
						s.push('<img border=0 src="'+((node.isCollapsed) ? this.config.collapsedImage : this.config.expandedImage)+'" >');
						s.push('</a>');
						s.push('<img src="'+this.config.transImage+'" ></div>');
					}
					break;

			}
			if (!node.isCollapsed)	s.push(node._drawChildrenLinks(this.self));
			else
			{
				//alert("Entramos al else con node = " + node.dsc);
				// Si esta colapsado pero tiene varios hijos tenemos que pintar las lineas
				// todas punteadas con los hijos que aun estan visibles por otros padres
				var dashedLine = false;
				//alert("Numero de hijos -> " + node.nodeChildren.length);
				for (var i = 0; i < node.nodeChildren.length; i++)
				{
					//alert("i = " + i);
					//alert("Node -> " + node.dsc + " childs -> " + node.nodeChildren);
					if (node.nodeChildren[i].pnodes != null)
					{
						//alert("Nodo hijo -> " + node.nodeChildren[i]);
						var hasCollapsed = false;
						//alert("Numero de padres -> " + node.nodeChildren[i].pnodes.length);
						for (var x = 0; x < node.nodeChildren[i].pnodes.length; x++)
						{
							// Lo que pasa es que en PID estamos guardando la ID del nodo, por lo tanto tenemos
							// que acceder despues al nodo.
							//alert("NodeChildren -> " + node.nodeChildren[i].dsc + " --- " + "Node pid -> " + node.nodeChildren[i].pnodes[x]);
							if (!node.nodeChildren[i].pnodes[x].isCollapsed)
							{
								//alert("dashedLine = true");
								dashedLine = true;
							}
						}
					}
				}
				if (dashedLine) s.push(node._drawChildrenLinks(this.self));
			}
		}
	}
	return s.join('');
}

ECOTree.prototype.toString = function () {
	var s = [];
	if (!this.repaint)
		this._positionTree();

	return s.join('');
}

// ECOTree API begins here...

ECOTree.prototype.UpdateTree = function () {
	this.elm.innerHTML = this;
	if (this.render == "CANVAS") {
		var canvas = document.getElementById("ECOTreecanvas");
		if (canvas && canvas.getContext)  {
			this.canvasoffsetLeft = canvas.offsetLeft;
			this.canvasoffsetTop = canvas.offsetTop;
			this.ctx = canvas.getContext('2d');
			this.ctx.width = window.innerWidth;
			this.ctx.height = window.innerHeight;
			var h = this._drawTree();
			var r = this.elm.ownerDocument.createRange();
			r.setStartBefore(this.elm);
			var parsedHTML = r.createContextualFragment(h);
			//this.elm.parentNode.insertBefore(parsedHTML,this.elm)
			//this.elm.parentNode.appendChild(parsedHTML);
			this.elm.appendChild(parsedHTML);
			//this.elm.insertBefore(parsedHTML,this.elm.firstChild);
		}
	}
}

ECOTree.prototype.add = function (id, type, pid, dsc, prop, moreData, dataProp, w, h, c, tc, bc, target, meta) {
	var nw = this.config.defaultNodeWidth; //Width, height, colors, target and metadata defaults...
	var nh = (type.localeCompare("Definido") == 0) ? this.config.defaultNodeHeight : this.config.defaultNodeHeight/5;
	var color = c || this.config.nodeColor;
	var titleColor = tc || this.config.nodeTitleColor;
	var border = bc || this.config.nodeBorderColor;
	var tg = (this.config.useTarget) ? ((typeof target == "undefined") ? (this.config.defaultTarget) : target) : null;
	var metadata = (typeof meta != "undefined")	? meta : "";

	var arrayParentsNode = [];
	for (var j = 0; j < pid.length; j++)
	{
		var selectedpid = pid[j];
		var pnode = null; //Search for parent node in database
		if (selectedpid == -1)
		{
			pnode = this.root;
		}
		else
		{
			for (var k = 0; k < this.nDatabaseNodes.length; k++)
			{
				if (this.nDatabaseNodes[k].id == selectedpid)
				{
					pnode = this.nDatabaseNodes[k];
					break;
				}
			}
		}
		if (pnode != null)
		{
			arrayParentsNode.push(pnode);
		}
	}
	var node = new ECONode(id, type, pid, prop, arrayParentsNode, dsc, moreData, dataProp,
		nw, nh, color, titleColor, border, tg, metadata);	//New node creation...
	node.nodeParent = pnode;  //Set it's parent
	var i = this.nDatabaseNodes.length;	//Save it in database
	node.dbIndex = this.mapIDs[id] = i;
	this.nDatabaseNodes[i] = node;
	node.siblingIndex = h;
	for (var j = 0; j < arrayParentsNode.length; j++)
	{
		arrayParentsNode[j].nodeChildren.push(node);
		arrayParentsNode[j].canCollapse = true; //It's obvious that now the parent can collapse
	}
}

ECOTree.prototype.searchNodes = function (str) {
	var node = null;
	var m = this.config.searchMode;
	var sm = (this.config.selectMode == ECOTree.SL_SINGLE);

	if (typeof str == "undefined") return;
	if (str == "") return;

	var found = false;
	var n = (sm) ? this.iLastSearch : 0;
	if (n == this.nDatabaseNodes.length) n = this.iLastSeach = 0;

	str = str.toLocaleUpperCase();

	for (; n < this.nDatabaseNodes.length; n++)
	{
		node = this.nDatabaseNodes[n];
		if (node.dsc.toLocaleUpperCase().indexOf(str) != -1 && ((m == ECOTree.SM_DSC) || (m == ECOTree.SM_BOTH))) { node._setAncestorsExpanded(); this._selectNodeInt(node.dbIndex, false); found = true; }
		if (node.meta.toLocaleUpperCase().indexOf(str) != -1 && ((m == ECOTree.SM_META) || (m == ECOTree.SM_BOTH))) { node._setAncestorsExpanded(); this._selectNodeInt(node.dbIndex, false); found = true; }
		if (sm && found) {this.iLastSearch = n + 1; break;}
	}
	this.UpdateTree();
}

ECOTree.prototype.selectAll = function () {
	if (this.config.selectMode != ECOTree.SL_MULTIPLE) return;
	this._selectAllInt(true);
}

ECOTree.prototype.unselectAll = function () {
	this._selectAllInt(false);
}

ECOTree.prototype.collapseAll = function () {
	this._collapseAllInt(true);
}

ECOTree.prototype.expandAll = function () {
	this._collapseAllInt(false);
}

ECOTree.prototype.collapseNode = function (nodeid, upd) {
	//alert"Vamos a colapsar el nodo -> " + nodeid);
	var dbindex = this.mapIDs[nodeid];
	//alert"dbindex -> " + dbindex);
	this.nDatabaseNodes[dbindex].isCollapsed = !this.nDatabaseNodes[dbindex].isCollapsed;
	//alert"this.nDatabaseNodes[dbindex].isCollapsed -> " + this.nDatabaseNodes[dbindex].isCollapsed);
	if (upd) this.UpdateTree();
}

ECOTree.prototype.selectNode = function (nodeid, upd) {
	this._selectNodeInt(this.mapIDs[nodeid], true);
	if (upd) this.UpdateTree();
}

ECOTree.prototype.setNodeTitle = function (nodeid, title, upd) {
	var dbindex = this.mapIDs[nodeid];
	this.nDatabaseNodes[dbindex].dsc = title;
	if (upd) this.UpdateTree();
}

ECOTree.prototype.setNodeMetadata = function (nodeid, meta, upd) {
	var dbindex = this.mapIDs[nodeid];
	this.nDatabaseNodes[dbindex].meta = meta;
	if (upd) this.UpdateTree();
}

ECOTree.prototype.setNodeTarget = function (nodeid, target, upd) {
	var dbindex = this.mapIDs[nodeid];
	this.nDatabaseNodes[dbindex].target = target;
	if (upd) this.UpdateTree();
}

ECOTree.prototype.setNodeColors = function (nodeid, color, border, upd) {
	var dbindex = this.mapIDs[nodeid];
	if (color) this.nDatabaseNodes[dbindex].c = color;
	if (border) this.nDatabaseNodes[dbindex].bc = border;
	if (upd) this.UpdateTree();
}

ECOTree.prototype.getSelectedNodes = function () {
	var node = null;
	var selection = [];
	var selnode = null;

	for (var n=0; n<this.nDatabaseNodes.length; n++) {
		node = this.nDatabaseNodes[n];
		if (node.isSelected)
		{
			selnode = {
				"id" : node.id,
				"dsc" : node.dsc,
				"meta" : node.meta
			}
			selection[selection.length] = selnode;
		}
	}
	return selection;
}

// Return node if we clicked mouse up a node
ECOTree.prototype.isNodeClicked = function (x, y) {
	for (var i = 0; i < this.nDatabaseNodes.length; i++)
	{
		var node = this.nDatabaseNodes[i];
		//alert("Comparamos " + node.XPosition + " <= " + x + " <= " + (node.XPosition + node.w));
		if (node.XPosition <= x && x <= (node.XPosition + node.w))
		{
			//alert(node.YPosition + " <= " + y + " <= " + (node.YPosition + node.h));
			if (node.YPosition <= y && y <= (node.YPosition + node.h))
				return i;
		}
	}
	return -1;
}

// Return node if we clicked mouse up a node
ECOTree.prototype.updateNodePosition = function (x, y, iNode) {
	if (iNode > 0)
	{
		this.nDatabaseNodes[iNode].XPosition = x;
		this.nDatabaseNodes[iNode].YPosition = y;
		this.repaint = true;
	}
}