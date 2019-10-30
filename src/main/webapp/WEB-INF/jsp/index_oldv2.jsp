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

    <style type="text/css">
        body {
            font: 10pt sans;
        }
        #mynetwork {
            width: 1800px;
            height: 750px;
            border: 1px solid lightgray;
        }
    </style>

    <link href="/css/main.css" rel="stylesheet">
    <link href="/js/css/vis-network.css" rel="stylesheet" type="text/css"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.17.0/vis.min.js"></script>
    <script language="javascript" src="/js/vis-network.js"></script>

    <jsp:useBean id="bean" class="com.ontviewapp.actions.indexAction" scope="request" />
    <jsp:setProperty name="bean" property="*" />

    <script>
        // Almacena los nodos de tipo ontologyNode
        var nodesOntology = [];
        // Almacena {id, label} de los nodos
        var nodes = new vis.DataSet([]);
        // Almacena {id, label} de los nodos
        var allNodes = new vis.DataSet([]);
        // Almacena los enlaces entre los nodos
        var edges = new vis.DataSet([]);
        var network = null;
        // Indica la id del proximo nodo que se añada al array
        var nextId = 0;

        class ontologyNode {
            constructor(moreInformation,childrens,instances,name,parents) {
                this.moreInformation = moreInformation;
                this.childrens = childrens;
                this.instances = instances;
                this.name = name;
                this.parents = parents;
            }
        }

        function getDataNodes(node) {
            var nodeSplit = node.split(";");
            nodeOntology = new ontologyNode(nodeSplit[4],nodeSplit[2],nodeSplit[3],nodeSplit[0],nodeSplit[1]);
            nodesOntology.push(nodeOntology);
            nodes.add({id: nodeOntology.name, label: nodeOntology.name, color: "#A9D0F5", hidden: false, shape: 'box'});
        }

        function getLinksNodes() {
            var ids = nodes.map(function(node) {
                return node['id'];
            });
            alert("All nodes -> " + ids);
            for (var i = 0; i < nodesOntology.length; i++) {
                if(nodesOntology[i].childrens.replace(/]/g, '').replace(/\[/g, '').length > 0) {
                    var sons = nodesOntology[i].childrens.split(",");
                    for (var x = 0; x < sons.length; x++) {
                        edges.add({
                            from: nodesOntology[i].name,
                            to: sons[x].replace(/"/g, '').replace(/}/g, '').replace(/]/g, '').replace(/\[/g, '').trim()
                        });
                    }
                }
            }
            var uniones = edges.map(function(edge) {
                return edge['from'] + " --> " + edge['to'];
            });
            alert("All unions -> " + uniones);
        }

        function getDataNodesNoReasoner(node) {
            allNodes.add({id: node, label: node,
                color: "#A9D0F5", hidden: false, shape: 'box'});
        }

        function getLinksNodesNoReasoner(link) {
            var linkSplit = link.split("&&&");
            if (linkSplit != null && linkSplit.length == 2) {
                edges.add({
                    from: linkSplit[1].trim(),
                    to: linkSplit[0].trim()
                });
            } else {
                alert("Algo hay mal en los links");
            }
        }

        function destroy() {
            if (network !== null) {
                network.destroy();
                network = null;
            }
        }

        function draw() {
            destroy();
            var nodeCount = parseInt(document.getElementById('nodeCount').value);
            alert("NodeCount = " + nodeCount + " tamaño de allNodes = " + allNodes.length);
            var items = allNodes.get();
            nodes.clear();
            for(var i = 0; i<nodeCount; i++) {
                nodes.add({id: items[i].id, label: items[i].label,
                    color: "#A9D0F5", hidden: false, shape: 'box'})
            }
            alert("Vamos a pintar con nodes = " + nodes.length + " y links = " + edges.length);
            var data = {nodes: nodes, edges: edges};
            // create a network
            var container = document.getElementById('mynetwork');
            var options = {
                layout: {
                    hierarchical: {
                        sortMethod: "directed",
                        direction: "UD"
                    }
                }
            };
            network = new vis.Network(container, data, options);
            // add event listeners
            network.on('select', function (params) {
                document.getElementById('selection').innerHTML = 'Selection: ' + params.nodes;
                alert(params.nodes);
                if (params.nodes != null && params.nodes != "") {
                    var allIdNodes = nodes.get();
                    alert(allIdNodes.toSource());
                    for (var i = 0; i<allIdNodes.length; i++) {
                        if (allIdNodes[i]['color'] == "#5858FA") {
                            nodes.update([{id: allIdNodes[i]['id'], color: "#A9D0F5"}]);
                        }
                    }
                    nodes.update([{id: params.nodes, color: '#5858FA'}]);
                    if (network.getConnectedNodes(params.nodes,'to').length > 0) {
                        hiddenShowNode(params.nodes);
                        network.fit();
                    }
                }
                alert("Terminamos");
            });
        }

        function hiddenShowNode(idNode) {
            alert("Entramos a hiddenShowNode");
            var arrayChildrens = network.getConnectedNodes(idNode,'to');
            alert("Nodos hijos --> " + arrayChildrens.toSource());
            if (arrayChildrens.length > 0) {
                for (var i = 0; i < arrayChildrens.length; i++) {
                    hiddenShowNode(arrayChildrens[i]);
                }
            } else {
                if (idNode != null) {
                    alert("Hola");
                    var node = nodes.get(idNode)
                    alert(node.toSource() + node['hidden']);
                    if (node['hidden'] == false) {
                        alert("Lo ponemos a true");
                        nodes.update([{id: idNode, hidden: true}]);
                    } else {
                        alert("Lo ponemos a false");
                        nodes.update([{id: idNode, hidden: false}]);
                    }
                    alert("Hemos hecho el update");
                }
            }
        }
    </script>

    <%
        int tamanoJson = 0;
        int tamanoNormal = 0;
        String jsonPrueba = "";
        long inicio = System.currentTimeMillis();
        String uri = "file:/C:/Users/alvarojc/Desktop/snomed_manch.owl";
        String reasoner = "JFact";
        String allJson = "";
        Object[] resultOntology = bean.getShapesFromOntologyNoReasoner(uri,reasoner);
        Set<Map.Entry<String,Shape>> shapes = (Set<Map.Entry<String,Shape>>) resultOntology[0];
        ArrayList<String> nameClasses = (ArrayList<String>) resultOntology[1];
        ArrayList<String> linksNameClasses = (ArrayList<String>) resultOntology[2];
        // Este if esta para que no usemos el razonador y solo cojamos
        if(nameClasses != null && linksNameClasses != null) {
            for(String node: nameClasses) {
                if(node != null && !node.equals("")) {
                    %><script>getDataNodesNoReasoner('<%=node.trim()%>');</script><%
                }
            }
            //for(String link: linksNameClasses) {
            //    if(link != null && !link.equals("")) {
            //
            //    }
            //}
        } else {
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
                        %><script>getDataNodes('<%=match.trim()%>');</script><%
                    }
                }
            }
            fin = System.currentTimeMillis();
            System.out.println("Fin de ejecucacion llamadas a JavaScript -> " + (fin - inicio));
            %><script>getLinksNodes();</script><%
                // {"moreInformation":"([^,]*)","childrens":(\[[^]]*]),
                // "instances":(\[[^]]*]),"name":"([^"]*)","parents":(\[[^]]*])}
        }
    %>
</head>

<body onload="draw();">
    <h2>Hierarchical Layout - Scale-Free-Network</h2>

    <div style="width:700px; font-size:14px; text-align: justify;">
        This example shows the randomly generated <b>scale-free-network</b> set of nodes and connected edges from example 2.
        In this example, hierarchical layout has been enabled and the vertical levels are determined automatically.
    </div>
    <br/>

    <form onsubmit="draw(); return false;">
        <label for="nodeCount">Number of nodes:</label>
        <input id="nodeCount" type="text" value="1000" style="width: 50px;">
        <input type="submit" value="Go">
    </form>
    <p>
        <input type="button" id="btn-UD" value="Up-Down">
        <input type="button" id="btn-DU" value="Down-Up">
        <input type="button" id="btn-LR" value="Left-Right">
        <input type="button" id="btn-RL" value="Right-Left">
        <input type="hidden" id='direction' value="UD">
        <input type="hidden" id='moreNodes' value="More nodes">
    </p>

    <script language="javascript">
        var directionInput = document.getElementById("direction");
        var btnUD = document.getElementById("btn-UD");
        btnUD.onclick = function () {
            directionInput.value = "UD";
            draw();
        }
        var btnDU = document.getElementById("btn-DU");
        btnDU.onclick = function () {
            directionInput.value = "DU";
            draw();
        };
        var btnLR = document.getElementById("btn-LR");
        btnLR.onclick = function () {
            directionInput.value = "LR";
            draw();
        };
        var btnRL = document.getElementById("btn-RL");
        btnRL.onclick = function () {
            directionInput.value = "RL";
            draw();
        };
        var btnRL = document.getElementById("moreNodes");
        btnRL.onclick = function () {
            draw();
        };
    </script>
    <br>

    <div id="mynetwork"></div>

    <p id="selection"></p>
</body>
</html>