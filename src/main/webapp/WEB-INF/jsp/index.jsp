<%@ page import="com.ontviewapp.model.*"%>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.Set" %>
<%@ page import="java.util.*" %>
<%@ page import="java.io.*" %>
<%@ page import="org.semanticweb.owlapi.model.OWLNamedIndividual" %>
<%@ page import="org.semanticweb.owlapi.reasoner.NodeSet" %>
<%@ page import="org.json.*" %>
<%@ page import="java.util.regex.*" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="org.semanticweb.owlapi.model.OWLObjectProperty" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <jsp:useBean id="bean" class="com.ontviewapp.actions.indexAction" scope="request" />
    <jsp:setProperty name="bean" property="*" />

    <title>ECOTree Simple Tree 4</title>
    <script type="text/javascript" src="/js/ECOTree.js"></script>
    <link href="/js/css/ECOTree.css" rel="stylesheet" type="text/css"/>
    <xml:namespace ns="urn:schemas-microsoft-com:vml" prefix="v"/>
    <style>
        html, body { margin:0; padding:0; } /* to remove the top and left whitespace */
        canvas { display:block; }
        #footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            background: #E3DDDD;
            line-height: 2;
            text-align: center;
            color: #000000;
            font-size: 15px;
            font-family: Verdana;
            text-shadow: 0 1px 0 #000000;
            box-shadow: 0 0 15px #000000
        }
    </style>
    <script>
        var t = null;
        var ontologyNodes = [];

        class ontologyNode {
            constructor(id,type,parents,name,prop,moreData,dataProp) {
                this.id = id;
                this.type = type;
                this.parents = parents;
                this.name = name;
                this.prop = prop;
                this.moreData = moreData;
                this.dataProp = dataProp;
            }
        }

        function chargeOntology(node) {
            var nodeSplit = node.split(";");
            var prop = (nodeSplit[4].replace(/\[/g, '').
                replace(/\]/g, '').split(",") == "" ? [] : nodeSplit[4].replace(/\[/g, '').
                replace(/\]/g, '').split(","));
            var dataProp = (nodeSplit[6].replace(/\[/g, '').
                replace(/\]/g, '').split(",") == "" ? [] : nodeSplit[6].replace(/\[/g, '').
                replace(/\]/g, '').split(","));
            var nodeOntology = new ontologyNode(nodeSplit[0], nodeSplit[1], nodeSplit[2].replace(/\[/g, '').
                replace(/\]/g, '').split(","),
                nodeSplit[3], prop, nodeSplit[5], dataProp);
            ontologyNodes.push(nodeOntology);
        }

        function CreateTree() {
            var canvas = document.getElementById('ECOTreecanvas'), context = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            t = new ECOTree('t','sample2');
            <%
            if (request.getAttribute("position").toString().toUpperCase().equals("TOP")) {
                %>
                    t.config.iRootOrientation = ECOTree.RO_TOP;
                    t.config.topXAdjustment = window.innerWidth/5;
                    t.config.topYAdjustment = 100;
                <%
            } else if (request.getAttribute("position").toString().toUpperCase().equals("LEFT")){
                %>
                    t.config.iRootOrientation = ECOTree.RO_LEFT;
                    t.config.topXAdjustment = 100;
                    t.config.topYAdjustment = window.innerHeight/2;
                <%
            }
            %>
            t.config.defaultNodeWidth = 120;
            t.config.defaultNodeHeight = 100;
            t.config.iLevelSeparation = 100;
            t.config.iSubtreeSeparation = 100;
            t.config.iSiblingSeparation = 100;
            t.config.linkType = 'B';
            t.config.useTarget = false;
            t.config.nodeFill = ECOTree.NF_FLAT;
            t.config.colorStyle = ECOTree.CS_NODE;
            t.config.nodeSelColor = "#DC143C";
            t.config.nodeColor = "#FFFFFF";
            t.config.nodeBorderColor = "#000000";
            t.config.linkColor = "#0000CD";
            //t.config.nodeTitleColor : "#808080";
            var alph = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
            //t.add(0,'Primitivo',[-1],'Thing', [], '',[],null,null);
            //var n = 1;
            //for (var maxExp = 0; maxExp <= 1; maxExp++)
            //{
            //	for (var exp = 0; exp <= 10; exp++)
            //	{
            //		for (var i = 1; i <= 10; i++)
            //		{
            //			if (maxExp == 0)
            //			{
            //				if (exp == 0)
            //					t.add(alph[maxExp] + alph[exp] + i,[0],alph[maxExp] + alph[exp] + i, 'Properties', null,null,);
            //				else
            //					t.add(alph[maxExp] + alph[exp] + i,[alph[maxExp] + alph[exp-1] + i],alph[maxExp] + alph[exp] + i,'Properties',null,null,);
            //			}
            //			else
            //			{
            //				if (exp == 0)
            //					t.add(alph[maxExp] + alph[exp] + i,[alph[maxExp-1] + alph[10] + i],alph[maxExp] + alph[exp] + i,'Properties',null,null,);
            //				else
            //					t.add(alph[maxExp] + alph[exp] + i,[alph[maxExp] + alph[exp-1] + i],alph[maxExp] + alph[exp] + i,'Properties',null,null,);
            //			}
            //			n++;
            //		}
            //	}
            //}
            // TENGO QUE IR METIENDO LOS NODOS SI ESTAN SUS PADRES YA AÑADIDOS
            for (var x = 0; x < ontologyNodes.length; x++)
            {
                //alert(ontologyNodes[x].id + " type = " + ontologyNodes[x].type + " parents = " + ontologyNodes[x].parents +
                //    " name = " +  ontologyNodes[x].name + " prop = " + ontologyNodes[x].prop + " moreData = " + ontologyNodes[x].moreData +
                //    " dataProp = " + ontologyNodes[x].dataProp + " p1 = " + ontologyNodes[x].p1 + " p2 = " + ontologyNodes[x].p2);
                t.add(ontologyNodes[x].id,ontologyNodes[x].type,ontologyNodes[x].parents,ontologyNodes[x].name,
                    ontologyNodes[x].prop,ontologyNodes[x].moreData,ontologyNodes[x].dataProp,ontologyNodes[x].p1,ontologyNodes[x].p2);
                //alert("Añadimos");
            }
            //t.add('proyectos2','Primitivo',['Thing'],'proyectos2',['director(parent=miembros)(range=jefes)',
            //    'jefe(parent=miembros)(range=jefes)','miembros(range=personas)'],'',['titulo : string'],null,null);
            //t.add('proyectos3','Primitivo',['Thing'],'proyectos3',['director(parent=miembros)(range=jefes)',
            //    'jefe(parent=miembros)(range=jefes)','miembros(range=personas)'],'',['titulo : string'],null,null);
            //t.add('superpro2','Definido',['proyectos'],'superpro2',[],'(Proyectos, >= 3 (miembros, personas))',[],null,null);
            //t.add('superpro3','Definido',['proyectos'],'superpro3',[],'(Proyectos, >= 3 (miembros, personas))',[],null,null);
            //t.add('jefes2','Definido',['personas'],'jefes2',[],'(personas, hasVal (ocupacion:"jefe")))',[],null,null);
            //t.add('jefes3','Definido',['personas'],'jefes3',[],'(personas, hasVal (ocupacion:"jefe")))',[],null,null);
            //t.add(1,'Primitivo',[0],'Proyectos', ['titulo:string', 'miembros', 'miembros:jefe'],'',[],null,null);
            //t.add(2,'Definido',[1],'SuperPro', [],'(Proyectos, >= 3 (miembros, personas))',[],null,null);
            //t.add(3,'Primitivo',[0],'Personas', ['ocupacion:string', 'nombre:string'],'',[],null,null);
           // t.add(4,'Definido',[3],'Jefes', [],'(personas, hasVal (ocupacion:"jefe")))',[],null,null);
            //t.add(5,'Definido',[3],'Empleados', [],'(personas, hasVal (ocupacion:"jefe")))',[],null,null);
            //t.add(6,'Definido',[5,4,1],'SubEmpleados', [],'(personas, hasVal (ocupacion:"jefe")))',[],null,null);
            t.UpdateTree();
            //alert(n);
            // variables to save last mouse position
            // used to see how far the user dragged the mouse
            // and then move the text by that distance
            var startX;
            var startY;
            var nodeClicked = null;
            var iNode = -1;
            var BB=document.getElementById("ECOTreecanvas").getBoundingClientRect();
            var offsetX=BB.left;
            var offsetY=BB.top;
            // listen for mouse events
            document.getElementById("ECOTreecanvas").addEventListener("mousedown", function(e){
                //alert("Down");
                startX = e.clientX-offsetX;
                startY = e.clientY-offsetY;
                iNode = t.isNodeClicked(startX,startY);
                nodeClicked = t.nDatabaseNodes[iNode];
            });
            document.getElementById("ECOTreecanvas").addEventListener("mousemove", function(e){
                if (nodeClicked == null ) {
                    return;
                }
                e.preventDefault();

                switch(t.config.iRootOrientation)
                {
                    case ECOTree.RO_TOP:
                        var mouseX = parseInt(e.clientX);
                        // Put your mousemove stuff here
                        var dx = mouseX - startX;

                        startX = mouseX;

                        nodeClicked.XPositionOld = nodeClicked.XPosition;

                        nodeClicked.XPosition += dx;

                        t.updateNodePosition(nodeClicked.XPosition,nodeClicked.YPosition,iNode);
                        //t.UpdateTreeNode(nodeClicked);
                        t.UpdateTree();
                        break;

                    case ECOTree.RO_LEFT:
                        var mouseY = parseInt(e.clientY);
                        // Put your mousemove stuff here
                        var dy = mouseY - startY;

                        startY = mouseY;

                        nodeClicked.YPositionOld = nodeClicked.YPosition;

                        nodeClicked.YPosition += dy;

                        t.updateNodePosition(nodeClicked.XPosition,nodeClicked.YPosition,iNode);
                        //t.UpdateTreeNode(nodeClicked);
                        t.UpdateTree();
                        break;
                }
            });
            document.getElementById("ECOTreecanvas").addEventListener("mouseup", function(e){
                e.preventDefault();
                nodeClicked = null;
                iNode = -1;
            });
            document.getElementById("ECOTreecanvas").addEventListener("mouseout", function(e){
                e.preventDefault();
                nodeClicked = null;
                iNode = -1;
            });
        }

        function ChangePosition() {
            var pos = document.forms[0].rootPosition.value;
            //alert(pos);
            t.config.iRootOrientation = pos;
            t.UpdateTree();
        }
    </script>
</head>

<%
    String jsonPrueba = "";
    System.out.println("URI -> " + request.getAttribute("position"));
    long inicio = System.currentTimeMillis();
    String uri = request.getAttribute("uri").toString();
    System.out.println("Valor de URI antes de entrar = " + uri);
    if (uri != null && !uri.equals("")) {
        String reasoner = "Pellet";
        String allJson = "";
        Set<Map.Entry<String,Shape>> shapes = bean.getShapesFromOntology(uri,reasoner);
        long fin = System.currentTimeMillis();
        System.out.println("Fin de ejecucion obteniendo ontologia -> " + (fin - inicio));
        inicio = System.currentTimeMillis();
        Shape raiz;
        int id = 1;
        // Ordenamos la lista de shape para poder añadirla al arbol
        ArrayList<Shape> orderShapes = bean.orderListShapes(shapes, new HashSet<>(shapes));
        System.out.println("OrderShapes size = " + orderShapes.size());
        for (Shape shape: orderShapes) {
            System.out.println(shape.asVisClass().getVisibleLabel());
        }
        for (Shape shape : orderShapes){
            // Jackson JSON
            ObjectMapper objectMapper = new ObjectMapper();
            // Creamos un nuevo objeto json que es el nodo de la ontologia
            JSONObject jsonObject = new JSONObject();
            JSONArray jsonParents = new JSONArray();
            JSONArray jsonChildrens = new JSONArray();
            JSONArray jsonInstances = new JSONArray();
            jsonObject.put("id", shape.asVisClass().getVisibleLabel());
            id++;
            if (shape.asVisClass().getIsDefined())
                jsonObject.put("type", "Definido");
            else
                jsonObject.put("type", "Primitivo");
            ArrayList<String> parents = new ArrayList<>();
            ArrayList<String> sons = new ArrayList<>();
            ArrayList<String> instances = new ArrayList<>();
            ArrayList<String> visibleDefinitionLabels = new ArrayList<>();
            ArrayList<VisObjectProperty> visiblePropertyLabels = new ArrayList<>();
            ArrayList<VisDataProperty> dPropertyList = new ArrayList<>();
            if(shape.asVisClass().getParents() != null &&
                    shape.asVisClass().getParents().size() == 0) {
                raiz = shape;
            } else {
                for(Shape entryParent : shape.asVisClass().getParents()) {
                    JSONObject parent = new JSONObject();
                    // Añadimos los hijos. FALTA POR PONER EL TIPO DE ENLACE QUE TIENEN!
                    parent.put("name", entryParent.asVisClass().getVisibleLabel());
                    jsonParents.put(parent);
                    parents.add(entryParent.asVisClass().getVisibleLabel());
                }
            }
            // Si el nodo es thing (es decir el nodo raiz) le añadimos como padre
            // el nodo con id = -1 para que el arbol se pueda formar correctamente
            if (jsonObject.get("id").toString().toUpperCase().equals("THING")) {
                jsonParents = new JSONArray();
                JSONObject parent = new JSONObject();
                // Añadimos los hijos. FALTA POR PONER EL TIPO DE ENLACE QUE TIENEN!
                parent.put("name", -1);
                jsonParents.put(parent);
                parents = new ArrayList<>();
                parents.add("-1");
            }
            //for(Shape entryChild : entry.getValue().asVisClass().getChildren()) {
            //    JSONObject children = new JSONObject();
            // Añadimos los hijos. FALTA POR PONER EL TIPO DE ENLACE QUE TIENEN!
            //    children.put("name", entryChild.asVisClass().getVisibleLabel());
            //    jsonChildrens.put(children);
            //    sons.add(entryChild.asVisClass().getVisibleLabel());
            //}
            jsonObject.put("parents", jsonParents);
            jsonObject.put("name", shape.asVisClass().getVisibleLabel());
            //jsonObject.put("childrens", jsonChildrens);
            jsonObject.put("moreInformation", shape.asVisClass().
                    getToolTipInfoParameters(bean.getFinalReasoner(),bean.getFinalOntology()));
            //ArrayList<String> instanceArray = new ArrayList<String>();
            //if ((entry.getValue() instanceof VisClass)){
            //    NodeSet<OWLNamedIndividual> instanceSet = ((VisClass) entry.getValue()).getInstancesParameters(bean.getFinalReasoner());
            //    for (org.semanticweb.owlapi.reasoner.Node<OWLNamedIndividual>  instanceNode : instanceSet.getNodes() ){
            //        for (OWLNamedIndividual instance : instanceNode.getEntities()){
            //            JSONObject instanceJSON = new JSONObject();
            //            instanceJSON.put("name", instance.getIRI().getFragment());
            //            instanceArray.add(instance.getIRI().getFragment());
            //            jsonInstances.put(instanceJSON);
            //            instances.add(instance.getIRI().getFragment());
            //        }
            //    }
            //}
            //jsonObject.put("instances", jsonInstances);
            //System.out.println(entry.getValue().asVisClass().getLinkedClassExpression());
            //VisPropertyBox vpb = entry.getValue().asVisClass().getPropertyBox();
            //if(vpb != null) {
            //    System.out.println("Tiene property box");
            //    ArrayList<VisObjectProperty> listVisObjectProperty= vpb.getPropertyList();
            //    ArrayList<VisDataProperty> listVisDataProperty = vpb.getDataPropertyList();
            //y su Object property box es:
            //    for(VisObjectProperty vop: listVisObjectProperty) {
            //
            //    }
            //}
            //allJson = allJson + jsonObject.toString().replaceAll("\\\\","");
            if (jsonObject.get("type").equals("Definido"))
                visibleDefinitionLabels = shape.asVisClass().getVisibleDefinitionLabels();
            else if (jsonObject.get("type").equals("Primitivo") && shape.asVisClass().getPropertyBox() != null) {
                visiblePropertyLabels = shape.asVisClass().getPropertyBox().getPropertyList();
                dPropertyList = shape.asVisClass().getPropertyBox().getDataPropertyList();
            }
            String prop = "";
            if (visiblePropertyLabels != null) {
                System.out.println("Aqui entramos");
                for (VisObjectProperty vop : visiblePropertyLabels) {
                    if(vop.getParentConnectors() != null) {
                        for (VisConnectorHeritance vch : vop.getParentConnectors()) {
                            System.out.println("From : " + vch.getFromProp().getVisibleLabel() + " to " + vch.getToProp().getVisibleLabel());
                        }
                    }
                    prop = prop + "," + vop.getVisibleLabel();
                    for (VisObjectProperty vop2 : vop.getParents()) {
                        System.out.println("La Property padre es -> " + vop2.getVisibleLabel());
                        prop = prop + "(parent=" + vop2.getVisibleLabel() + ")";
                    }
                    if(vop.getRangeConnector() != null &&
                            vop.getRangeConnector().getTo().asVisClass().getVisibleLabel() != "") {
                        prop = prop + "(range=" + vop.getRangeConnector().getTo().asVisClass().getVisibleLabel() + ")";
                    }
                }
            } else {
                System.out.println("VisiblePropertyLabels = null");
            }
            System.out.println("PROP = " + prop);
            if (prop.equals(",jefe(parent=miembros)(range=jefes),miembros(range=personas)")) {
                prop = ",jefe2(parent=miembros)(range=jefes),director(parent=miembros)(range=jefes)" + prop;
            }
            System.out.println("PROP = " + prop);
            String dList = "";
            if (dPropertyList != null) {
                System.out.println("Aqui entramos");
                for (VisDataProperty vop : dPropertyList) {
                    System.out.println("dList -> " + vop.getVisibleLabel() + " - " + vop.getDomain().getVisibleLabel() +
                            " - " + vop.getRange());
                    dList = dList + "," + vop.getVisibleLabel() + " : " + vop.getRange();
                }
            }

            System.out.println("JSON --> " + jsonObject.toString().replaceAll("\\\\",""));
            jsonPrueba = jsonPrueba + jsonObject.toString().replaceAll("\\\\","");
            String nodeToString = jsonObject.get("id") + ";" + jsonObject.get("type") + ";" + parents.toString() + ";" + jsonObject.get("name") + ";" +
                    "[" + prop + "];" + visibleDefinitionLabels.toString().replaceAll("\\s","") + ";[" + dList + "];";
            //String respuestaParcial = objectMapper.writeValueAsString(new OntologyNode(entry.getValue().
            //        asVisClass().getVisibleLabel(),
            //        parents,sons,instances,entry.getValue().asVisClass().
            //        getToolTipInfoParameters(bean.getFinalReasoner(),bean.getFinalOntology())));
            //System.out.println(nodeToString);
            allJson = allJson + "&&&&" + nodeToString;
        }
        System.out.println("El resultado es -> " + allJson);
        if(allJson != null && allJson.contains("&&&&")) {
            for(String match: allJson.split("&&&&")) {
                if(match != null && !match.equals("") && match.contains(";")) {
                    System.out.println(match.trim());
                    %><script>chargeOntology('<%=match.trim()%>');</script><%
                    System.out.println("Hemos llamado a la funcion!");
                }
            }
        }
    }
%>

<body onload="CreateTree();">
    <canvas id="ECOTreecanvas"></canvas>
    <div id="sample2"></div>
</body>
<div id="footer">
    <form action="/viewOntology" method="GET">
        <label>Ontology:</label>
        <input type="text" name="uri" id="uri" size="70" value="${uri}">
        <label>&nbsp;&nbsp;Root position:</label>
        <select name="position" id="position">
            <%
                if (request.getAttribute("position").toString().toUpperCase().equals("LEFT")) {
                    %>
                        <option value="top">Top</option>
                        <option value="left" selected>Left</option>
                    <%
                } else if (request.getAttribute("position").toString().toUpperCase().equals("TOP")) {
                    %>
                        <option value="top" selected>Top</option>
                        <option value="left">Left</option>
                    <%
                } else {
                    %>
                        <option value="top">Top</option>
                        <option value="left" selected>Left</option>
                    <%
                }
            %>
        </select>
        <input type="submit" value="Charge changes">
    </form>
    <font size="1"><a href="javascript:t.collapseAll();">Collapse All</a></font>&nbsp;&nbsp;
    <font size="1"><a href="javascript:t.expandAll();">Expand All</a></font>
</div>
</html>