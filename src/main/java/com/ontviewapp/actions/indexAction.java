package com.ontviewapp.actions;

import com.ontviewapp.main.Mine;
import com.ontviewapp.model.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.semanticweb.owlapi.model.*;
import org.semanticweb.owlapi.reasoner.Node;
import org.semanticweb.owlapi.reasoner.NodeSet;
import org.semanticweb.owlapi.reasoner.OWLReasoner;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestParam;
import org.xml.sax.SAXException;
import uk.ac.manchester.cs.jfact.kernel.Ontology;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPathExpressionException;
import java.io.IOException;
import java.util.*;

public class indexAction {
    OWLOntology finalOntology;
    OWLReasoner finalReasoner;
    public Object[] getShapesFromOntologyNoReasoner(String uri, String reasoner) {
        Mine mine = new Mine();
        //mine.loadActiveOntology(IRI.create(uri));
        Object[] arrays = mine.loadActiveOntologyNoReasoner(IRI.create(uri));
        mine.loadReasoner(reasoner);
        OWLOntology activeOntology = mine.getActiveOntology();
        finalOntology = activeOntology;
        OWLReasoner activeReasoner = mine.getReasoner();
        finalReasoner = activeReasoner;
        VisGraph visGraph = new VisGraph();
        HashSet<OWLClassExpression> set = new HashSet<OWLClassExpression>();
        try {
            for (OWLClass d : activeReasoner.getTopClassNode().getEntities()) {
                set.add(d);
            }
            HashMap<String, Shape> shapeMap = visGraph.buildReasonedGraphReturn(activeOntology,
                    activeReasoner,set,false);
            for (Map.Entry<String,Shape> entry : visGraph.shapeMap.entrySet()){
                System.out.println(entry.getValue().asVisClass().getVisibleLabel());
            }
        } catch (XPathExpressionException e) {
            e.printStackTrace();
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new Object[]{visGraph.shapeMap.entrySet(), arrays[0], arrays[1]};
    }

    public Set<Map.Entry<String,Shape>> getShapesFromOntology(String uri, String reasoner) {
        Mine mine = new Mine();
        mine.loadActiveOntology(IRI.create(uri));
        mine.loadReasoner(reasoner);
        OWLOntology activeOntology = mine.getActiveOntology();
        finalOntology = activeOntology;
        OWLReasoner activeReasoner = mine.getReasoner();
        finalReasoner = activeReasoner;
        VisGraph visGraph = new VisGraph();
        visGraph.setReasoner(activeReasoner);
        HashSet<OWLClassExpression> set = new HashSet<OWLClassExpression>();
        try {
            for (OWLClass d : activeReasoner.getTopClassNode().getEntities()) {
                set.add(d);
            }
            HashMap<String, Shape> shapeMap = visGraph.buildReasonedGraphReturn(activeOntology,
                    activeReasoner,set,false);
            for (Map.Entry<String,Shape> entry : visGraph.shapeMap.entrySet()){
                System.out.println(entry.getValue().asVisClass().getVisibleLabel());
            }
            return visGraph.shapeMap.entrySet();
        } catch (XPathExpressionException e) {
            e.printStackTrace();
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public OWLOntology getFinalOntology() {
        return finalOntology;
    }

    public OWLReasoner getFinalReasoner() {
        return finalReasoner;
    }

    public String searchFirstNode(Set<Map.Entry<String,Shape>> shapes) {
        for (Map.Entry<String,Shape> entry : shapes) {
            if(entry.getValue().asVisClass().getParents() != null &&
                    entry.getValue().asVisClass().getParents().size() == 0) {
                return recursiveJson(new JSONObject(), entry.getValue()).
                        toString().replaceAll("\\\\","");
            }
        }
        return "";
    }

    public JSONObject recursiveJson(JSONObject finalJson, Shape entry) {
        System.out.println("Entramos a recursiveJSON");
        if(entry.asVisClass().getChildren() != null &&
                entry.asVisClass().getChildren().size() > 0) {
            JSONObject jsonObject = new JSONObject();
            JSONArray jsonChildrens = new JSONArray();
            try {
                jsonObject.put("id", entry.asVisClass().getVisibleLabel());
                jsonObject.put("name", entry.asVisClass().getVisibleLabel());
                jsonObject.put("data", "{}");
                for(Shape children : entry.asVisClass().getChildren()) {
                    jsonChildrens.put(recursiveJson(finalJson, children));
                }
                jsonObject.put("children", jsonChildrens);
                return jsonObject;
            } catch (JSONException e) {
                e.printStackTrace();
            }
        } else {
            JSONObject jsonObject = new JSONObject();
            JSONArray jsonChildrens = new JSONArray();
            try {
                jsonObject.put("id", entry.asVisClass().getVisibleLabel());
                jsonObject.put("name", entry.asVisClass().getVisibleLabel());
                jsonObject.put("data", "{}");
                jsonObject.put("children", jsonChildrens);
                return jsonObject;
            } catch (JSONException e) {
                e.printStackTrace();
            }
        } return finalJson;
    }

    public String jsonExample () {
        int totalNodos = 1;
        JSONObject jsonObject = new JSONObject();
        JSONArray jsonChildrens = new JSONArray();
        try {
            //jsonObject.put("id", "0");
            jsonObject.put("name", "0");
            //jsonObject.put("data", "{}");
            jsonObject.put("children", jsonChildrens);
            jsonObject.put("parent", "null");
            for(int i = 1; i<10; i++) {
                JSONObject jsonObject2 = new JSONObject();
                JSONArray jsonChildrens2 = new JSONArray();
                JSONArray jsonParents2 = new JSONArray();
                //jsonObject2.put("id", i);
                jsonObject2.put("name", i);
                //jsonObject2.put("data", "{}");
                jsonObject2.put("children", jsonChildrens2);
                jsonObject2.put("parent", "0");
                totalNodos++;
                for(int j = 0; j<10; j++) {
                    JSONObject jsonObject3 = new JSONObject();
                    JSONArray jsonChildrens3 = new JSONArray();
                    //jsonObject2.put("id", i);
                    jsonObject3.put("name", j+"a"+i);
                    //jsonObject2.put("data", "{}");
                    jsonObject3.put("children", jsonChildrens3);
                    jsonObject3.put("parent", i);
                    totalNodos++;
                    jsonChildrens2.put(jsonObject3);
                    for(int x = 0; x<20; x++) {
                        JSONObject jsonObject4 = new JSONObject();
                        JSONArray jsonChildrens4 = new JSONArray();
                        //jsonObject2.put("id", i);
                        jsonObject4.put("name", j+"a"+i+"b"+x);
                        //jsonObject2.put("data", "{}");
                        jsonObject4.put("children", jsonChildrens4);
                        jsonObject4.put("parent", j+"a"+i);
                        jsonChildrens3.put(jsonObject4);
                        totalNodos++;
                        for(int p = 0; p<30; p++) {
                            JSONObject jsonObject5 = new JSONObject();
                            JSONArray jsonChildrens5 = new JSONArray();
                            //jsonObject2.put("id", i);
                            jsonObject5.put("name", j+"a"+i+"b"+x+"c"+p);
                            //jsonObject2.put("data", "{}");
                            jsonObject5.put("children", jsonChildrens5);
                            jsonObject5.put("parent", j+"a"+i+"b"+x);
                            jsonChildrens4.put(jsonObject5);
                            totalNodos++;
                        }
                    }
                }
                jsonChildrens.put(jsonObject2);
            }
            System.out.println("Total nodos = " + totalNodos);
            return jsonObject.toString().
                replaceAll("\\\\","");
        } catch (JSONException e) {
            e.printStackTrace();
        } return "";
    }

    public ArrayList<Shape> orderListShapes(Set<Map.Entry<String,Shape>> shapes,
                                            Set<Map.Entry<String,Shape>> shapesCopy) {
        ArrayList<Shape> orderShapes = new ArrayList<Shape>();
        while (shapes.size() > 0) {
            System.out.println("Entramos");
            shapesCopy = new HashSet<>(shapes);
            System.out.println("ShapesCopy size = " + shapesCopy.size());
            for (Map.Entry<String, Shape> entry : shapesCopy) {
                if (entry.getValue().asVisClass().getVisibleLabel().toUpperCase().equals("THING")) {
                    orderShapes.add(entry.getValue());
                    shapes.remove(entry);
                    System.out.println("Añadido thing");
                } else if (entry.getValue().asVisClass().getParents() != null &&
                        entry.getValue().asVisClass().getParents().size() == 0) {
                    orderShapes.add(entry.getValue());
                    shapes.remove(entry);
                    System.out.println("Añadido " + entry.getValue());
                } else if (entry.getValue().asVisClass().getParents() != null) {
                    boolean todosLosPadresAnadidos = true;
                    for (Shape entryParent : entry.getValue().asVisClass().getParents()) {
                        String nameParent = entryParent.asVisClass().getVisibleLabel();
                        boolean existParent = false;
                        for (Shape orderShape : orderShapes) {
                            if (orderShape.asVisClass().getVisibleLabel().toUpperCase().
                                    equals(nameParent.toUpperCase())) {
                                existParent = true;
                            }
                        }
                        if (!existParent) {
                            todosLosPadresAnadidos = false;
                            break;
                        }
                    }
                    if (todosLosPadresAnadidos) {
                        orderShapes.add(entry.getValue());
                        shapes.remove(entry);
                    }
                }
            }
        } return orderShapes;
    }
}
