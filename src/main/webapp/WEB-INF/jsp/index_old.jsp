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


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello ${name}!</title>
    <link href="/css/main.css" rel="stylesheet">

    <jsp:useBean id="bean" class="com.ontviewapp.actions.indexAction" scope="request" />
    <jsp:setProperty name="bean" property="*" />

    <script language="javascript" src="/js/go-debug.js"></script>
    <script>
        var ontologyNodes = [];
        var nodeDataArray = [];
        var linkDataArray = [];
        function chargeOntology(node) {
            var nodeSplit = node.split(";");
            nodeOntology = new ontologyNode(nodeSplit[4],nodeSplit[2],nodeSplit[3],nodeSplit[0],nodeSplit[1]);
            ontologyNodes.push(nodeOntology);
            nodeDataArray.push( {"key": nodeOntology.name, "text": nodeOntology.name});
        }

        function chargeLinks() {
            for(var i = 0; i<ontologyNodes.length - 1 ; i++) {
                var fathers = ontologyNodes[i].parents.split(",");
                for(var x = 0; x<fathers.length - 1; x++) {
                    linkDataArray.push({ "from": fathers[x].replace(/"/g,'').replace(/}/g,'').
                        replace(/]/g,'').replace(/\[/g,'').trim(),
                        "to": ontologyNodes[i].name});
                }
            }
        }

        class ontologyNode {
            constructor(moreInformation,childrens,instances,name,parents) {
                this.moreInformation = moreInformation;
                this.childrens = childrens;
                this.instances = instances;
                this.name = name;
                this.parents = parents;
            }
        }

        var names = {}; // hash to keep track of what names have been used
        function init() {
            if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
            var $ = go.GraphObject.make;  // for conciseness in defining templates
            myDiagram =
                $(go.Diagram, "myDiagramDiv",
                    {
                        initialAutoScale: go.Diagram.UniformToFill,
                        // define the layout for the diagram
                        layout: $(go.TreeLayout, { nodeSpacing: 5, layerSpacing: 30 })
                    });
            // Define a simple node template consisting of text followed by an expand/collapse button
            myDiagram.nodeTemplate =
                $(go.Node, "Horizontal",
                    { selectionChanged: nodeSelectionChanged },  // this event handler is defined below
                    $(go.Panel, "Auto",
                        $(go.Shape, { fill: "#1F4963", stroke: null }),
                        $(go.TextBlock,
                            {
                                font: "bold 13px Helvetica, bold Arial, sans-serif",
                                stroke: "white", margin: 3
                            },
                            new go.Binding("text", "key"))
                    ),
                    $("TreeExpanderButton")
                );
            // Define a trivial link template with no arrowhead.
            myDiagram.linkTemplate =
                $(go.Link,
                    { selectable: false },
                    $(go.Shape));  // the link shape
            // create the model for the concept map
            var nodeDataArray = [
                { key: "Concept Maps" },
                { key: "Organized Knowledge", parent: "Concept Maps"},
                { key: "Context Dependent", parent: "Concept Maps" }
            ];

            // create the model for the DOM tree
            myDiagram.model =
                $(go.TreeModel, {
                    isReadOnly: true,  // don't allow the user to delete or copy nodes
                    // build up the tree in an Array of node data
                    nodeDataArray: nodeDataArray
                });
        }
        // Walk the DOM, starting at document, and return an Array of node data objects representing the DOM tree
        // Typical usage: traverseDom(document.activeElement)
        // The second and third arguments are internal, used when recursing through the DOM
        function traverseDom(node, parentName, dataArray) {
            if (parentName === undefined) parentName = null;
            if (dataArray === undefined) dataArray = [];
            // skip everything but HTML Elements
            if (!(node instanceof Element)) return;
            // Ignore the navigation menus
            if (node.id === "navindex" || node.id === "navtop") return;
            // add this node to the nodeDataArray
            var name = getName(node);
            var data = { key: name, name: name };
            dataArray.push(data);
            // add a link to its parent
            if (parentName !== null) {
                data.parent = parentName;
            }
            // find all children
            var l = node.childNodes.length;
            for (var i = 0; i < l; i++) {
                traverseDom(node.childNodes[i], name, dataArray);
            }
            return dataArray;
        }
        // Give every node a unique name
        function getName(node) {
            var n = node.nodeName;
            if (node.id) n = n + " (" + node.id + ")";
            var namenum = n;  // make sure the name is unique
            var i = 1;
            while (names[namenum] !== undefined) {
                namenum = n + i;
                i++;
            }
            names[namenum] = node;
            return namenum;
        }
        // When a Node is selected, highlight the corresponding HTML element.
        function nodeSelectionChanged(node) {
            if (node.isSelected) {
                names[node.data.name].style.backgroundColor = "lightblue";
            } else {
                names[node.data.name].style.backgroundColor = "";
            }
        }
    </script>

    <%
        int tamanoJson = 0;
        int tamanoNormal = 0;
        String jsonPrueba = "";
        long inicio = System.currentTimeMillis();
        String uri = "http://horus.cps.unizar.es:18080/ontology/univ-bench.owl";
        String reasoner = "Pellet";
        String allJson = "";
        Object[] resultOntology = bean.getShapesFromOntology(uri,reasoner);
        Set<Map.Entry<String,Shape>> shapes = (Set<Map.Entry<String,Shape>>) resultOntology[0];
        ArrayList<String> nameClasses = (ArrayList<String>) resultOntology[1];
        ArrayList<String> linksNameClasses = (ArrayList<String>) resultOntology[2];
        for(String clase : nameClasses) {
            System.out.println(clase);
        }
        long fin = System.currentTimeMillis();
        System.out.println("Fin de ejecucion obteniendo ontologia -> " + (fin - inicio));
        inicio = System.currentTimeMillis();
        Shape raiz;
        for (Map.Entry<String,Shape> entry : shapes){
            // Jackson JSON
            ObjectMapper objectMapper = new ObjectMapper();
            // Creamos un nuevo objeto json que es el nodo de la ontologia
            JSONObject jsonObject = new JSONObject();
            JSONArray jsonParents = new JSONArray();
            JSONArray jsonChildrens = new JSONArray();
            JSONArray jsonInstances = new JSONArray();
            jsonObject.put("name", entry.getValue().asVisClass().getVisibleLabel());
            ArrayList<String> parents = new ArrayList<>();
            ArrayList<String> sons = new ArrayList<>();
            ArrayList<String> instances = new ArrayList<>();
            if(entry.getValue().asVisClass().getParents() != null &&
                entry.getValue().asVisClass().getParents().size() == 0) {
                raiz = entry.getValue();
            } else {
                for(Shape entryParent : entry.getValue().asVisClass().getParents()) {
                    JSONObject parent = new JSONObject();
                    // Añadimos los hijos. FALTA POR PONER EL TIPO DE ENLACE QUE TIENEN!
                    parent.put("name", entryParent.asVisClass().getVisibleLabel());
                    jsonParents.put(parent);
                    parents.add(entryParent.asVisClass().getVisibleLabel());
                }
            }
            for(Shape entryChild : entry.getValue().asVisClass().getChildren()) {
                JSONObject children = new JSONObject();
                // Añadimos los hijos. FALTA POR PONER EL TIPO DE ENLACE QUE TIENEN!
                children.put("name", entryChild.asVisClass().getVisibleLabel());
                jsonChildrens.put(children);
                sons.add(entryChild.asVisClass().getVisibleLabel());
            }
            jsonObject.put("parents", jsonParents);
            jsonObject.put("childrens", jsonChildrens);
            jsonObject.put("moreInformation", entry.getValue().asVisClass().
                    getToolTipInfoParameters(bean.getFinalReasoner(),bean.getFinalOntology()));
            ArrayList<String> instanceArray = new ArrayList<String>();
            if ((entry.getValue() instanceof VisClass)){
                NodeSet<OWLNamedIndividual> instanceSet = ((VisClass) entry.getValue()).getInstancesParameters(bean.getFinalReasoner());
                for (org.semanticweb.owlapi.reasoner.Node<OWLNamedIndividual>  instanceNode : instanceSet.getNodes() ){
                    for (OWLNamedIndividual instance : instanceNode.getEntities()){
                        JSONObject instanceJSON = new JSONObject();
                        instanceJSON.put("name", instance.getIRI().getFragment());
                        instanceArray.add(instance.getIRI().getFragment());
                        jsonInstances.put(instanceJSON);
                        instances.add(instance.getIRI().getFragment());
                    }
                }
            }
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
            System.out.println("JSON --> " + jsonObject.toString().replaceAll("\\\\",""));
            jsonPrueba = jsonPrueba + jsonObject.toString().replaceAll("\\\\","");
            String nodeToString = entry.getValue().
                    asVisClass().getVisibleLabel() + ";" + parents.toString() + ";" + sons.toString() + ";" +
                    instances.toString() + ";" + "";
            //String respuestaParcial = objectMapper.writeValueAsString(new OntologyNode(entry.getValue().
            //        asVisClass().getVisibleLabel(),
            //        parents,sons,instances,entry.getValue().asVisClass().
            //        getToolTipInfoParameters(bean.getFinalReasoner(),bean.getFinalOntology())));
            //System.out.println(nodeToString);
            allJson = allJson + "&&&&" + nodeToString;
        }
        System.out.println("Tamaño jsonPrueba = " + jsonPrueba.length() + " vs " + allJson.length());
        fin = System.currentTimeMillis();
        System.out.println("Fin de ejecucion creando el JSON -> " + (fin - inicio));
        inicio = System.currentTimeMillis();
        System.out.println(allJson);
        if(allJson != null && allJson.contains("&&&&")) {
            for(String match: allJson.split("&&&&")) {
                if(match != null && !match.equals("") && match.contains(";")) {
                    System.out.println(match.trim());
                    %><script>chargeOntology('<%=match.trim()%>');</script><%
                }
            }
        }
        fin = System.currentTimeMillis();
        System.out.println("Fin de ejecucacion llamadas a JavaScript -> " + (fin - inicio));
        %><script>chargeLinks();</script><%
            // {"moreInformation":"([^,]*)","childrens":(\[[^]]*]),
            // "instances":(\[[^]]*]),"name":"([^"]*)","parents":(\[[^]]*])}
    %>
</head>

<body onload="initOntology()">
    <h2 class="hello-title">Prueba ontologia</h2>
    <p>La URI que estamos intentando abrir es <%=uri%></p>
    <p>La estamos intentando analizar con el reasoner <%=reasoner%></p>
    <p>Nos sale un total de <%=shapes.size()%> shapes</p>
    <div id="ontologyDiv" style="background-color:
		whitesmoke; border: solid 1px black; width: 100%; height: 500px"></div>
</body>
</html>