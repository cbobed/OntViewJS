package com.ontviewapp.model;

import com.ontviewapp.utils.ExpressionManager;
import org.semanticweb.owlapi.apibinding.OWLManager;
import org.semanticweb.owlapi.model.*;
import org.semanticweb.owlapi.reasoner.Node;
import org.semanticweb.owlapi.reasoner.NodeSet;
import org.semanticweb.owlapi.reasoner.OWLReasoner;

import java.awt.*;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.StringTokenizer;

public class OntologyNode  {

    ArrayList<String> sons;
    ArrayList<String> parents;
    ArrayList<String> instances;
	String name;
	String moreInformation;


	public OntologyNode(String name, ArrayList<String> parents, ArrayList<String> sons,
						ArrayList<String> instances, String moreInformation) {
		this.name = name;
		this.parents = parents;
		this.sons = sons;
		this.instances = instances;
		this.moreInformation = moreInformation;
	}

	public String getName() {
		return name;
	}

	public String getMoreInformation() {
		return moreInformation;
	}

	public ArrayList<String> getParents() {
		return parents;
	}

	public ArrayList<String> getSons() {
		return sons;
	}

	public ArrayList<String> getInstances() {
		return instances;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setMoreInformation(String moreInformation) {
		this.moreInformation = moreInformation;
	}

	public void setParents(ArrayList<String> parents) {
		this.parents = parents;
	}

	public void setSons(ArrayList<String> sons) {
		this.sons = sons;
	}

	public void setInstances(ArrayList<String> instances) {
		this.instances = instances;
	}
}






