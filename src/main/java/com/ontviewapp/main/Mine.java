package com.ontviewapp.main;

import java.applet.Applet;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.Graphics;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.WindowEvent;
import java.awt.image.BufferedImage;
import java.awt.image.Raster;
import java.io.File;
import java.io.IOException;
import java.security.AccessController;
import java.util.ArrayList;
import java.util.HashSet;

import javax.imageio.ImageIO;
import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.SwingUtilities;
import javax.swing.filechooser.FileFilter;

import org.semanticweb.owlapi.apibinding.OWLManager;
import org.semanticweb.owlapi.io.StringDocumentSource;
import org.semanticweb.owlapi.model.*;
import org.semanticweb.owlapi.reasoner.ConsoleProgressMonitor;
import org.semanticweb.owlapi.reasoner.OWLReasoner;
import org.semanticweb.owlapi.reasoner.OWLReasonerConfiguration;
import org.semanticweb.owlapi.reasoner.OWLReasonerFactory;
import org.semanticweb.owlapi.reasoner.SimpleConfiguration;

import com.clarkparsia.pellet.owlapiv3.PelletReasonerFactory;

//import org.jdesktop.swingx.autocomplete.*;

import com.ontviewapp.model.Embedable;
import com.ontviewapp.model.PaintFrame;
import com.ontviewapp.model.VisGraph;
import com.ontviewapp.model.VisPositionConfig;
import com.ontviewapp.expressionNaming.SIDClassExpressionNamer;
import com.ontviewapp.utils.ExpressionManager;
import uk.ac.manchester.cs.jfact.JFactFactory;

import java.security.*;
import java.util.Set;

public class Mine {
	
	private static final long serialVersionUID = 1L;
    boolean DEBUG=false;

    OWLOntology activeOntology;
    OWLReasoner reasoner;
	OWLOntologyManager manager; 
    HashSet<String> entityNameSet;
    
    PaintFrame   artPanel;
    JFileChooser selector;    
    JComboBox    ontologyCombo,reasonerCombo,searchCombo;
    //TopPanel     nTopPanel;
    JScrollPane  scroll;
    boolean      firstItemStateChanged = false;
    Mine         self= this;
    boolean      check = true;

	public void loadActiveOntology(IRI source){
        manager = OWLManager.createOWLOntologyManager();
        //artPanel.setCursor(Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR));
        try {
			activeOntology = manager.loadOntologyFromOntologyDocument(source);
		} catch (OWLOntologyCreationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
	       // artPanel.setCursor(Cursor.getDefaultCursor());
	        activeOntology = null; 
	        manager = null; 
		}
        //artPanel.setCursor(Cursor.getDefaultCursor());
        // artPanel.setOntology(activeOntology);
        
        //artPanel.setActiveOntolgySource(source.toString()); //this might FAIL
        
        // CBL expression manager 
        if (activeOntology != null && manager != null) {
        	ExpressionManager.setNamespaceManager(manager, activeOntology);
        	
        	for (String ns: ExpressionManager.getNamespaceManager().getNamespaces()) {
        		System.err.println("prefix: "+ExpressionManager.getNamespaceManager().getPrefixForNamespace(ns)); 
        		System.err.println("  ns: "+ns); 
        		
        	}
        	
        }
    }

	public Object[] loadActiveOntologyNoReasoner(IRI source){
		manager = OWLManager.createOWLOntologyManager();
		//artPanel.setCursor(Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR));
		try {
			activeOntology = manager.loadOntologyFromOntologyDocument(source);
		} catch (OWLOntologyCreationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			// artPanel.setCursor(Cursor.getDefaultCursor());
			activeOntology = null;
			manager = null;
		}
		OWLDataFactory df = OWLManager.getOWLDataFactory();
		ArrayList<String> classesName = new ArrayList<>();
		ArrayList<String> links = new ArrayList<>();
		Set<OWLClass> classes = activeOntology.getClassesInSignature();
		System.out.println("NUMERO TOTAL DE CLASES = " + classes.size());
		for(OWLClass clase: classes) {
			//System.out.println(clase.toString());
			for(OWLAnnotation annotation : clase.getAnnotations(activeOntology, df.getRDFSLabel())) {
				OWLLiteral val = (OWLLiteral) annotation.getValue();
				//System.out.println(val.getLiteral());
				classesName.add(val.getLiteral());
			}
		}
		for(final OWLSubClassOfAxiom subClasse : activeOntology.getAxioms(AxiomType.SUBCLASS_OF)) {
			if(subClasse.getSuperClass() instanceof OWLClass &&
					subClasse.getSubClass() instanceof OWLClass) {
				System.out.println(subClasse.getSubClass() + " extends " +
						subClasse.getSuperClass());
				OWLLiteral valSuperClass = null;
				OWLLiteral valSubClass = null;
				OWLClass superClass = (OWLClass) subClasse.getSuperClass();
				for(OWLAnnotation annotation : superClass.getAnnotations(activeOntology, df.getRDFSLabel())) {
					valSuperClass = (OWLLiteral) annotation.getValue();
				}
				OWLClass subClass = (OWLClass) subClasse.getSubClass();
				for(OWLAnnotation annotation : subClass.getAnnotations(activeOntology, df.getRDFSLabel())) {
					valSubClass = (OWLLiteral) annotation.getValue();
				}
				//System.out.println(valSubClass.getLiteral() + " extends " + valSuperClass.getLiteral());
				links.add(valSubClass.getLiteral() + "&&&" + valSuperClass.getLiteral());
			}
		}
		return new Object[]{classesName, links};
	}
	
    public void loadReasoner(String reasonerString){
    	if (activeOntology!=null) {

    		 ConsoleProgressMonitor progressMonitor = new ConsoleProgressMonitor();
	         // Specify the progress monitor via a configuration.  We could also specify other setup parameters in
	    	 // the configuration, and different reasoners may accept their own defined parameters this way.
	    	 OWLReasonerConfiguration config = new SimpleConfiguration(progressMonitor);
	    	 
	    	 // Create a reasoner that will reason over our ontology and its imports closure.  Pass in the configuration.
	         reasoner = getReasonerFactory(reasonerString).createReasoner(activeOntology,config);

	         // between creating and precomputing 
	         applyRenaming();
	         
	         reasoner.precomputeInferences();
             //artPanel.setReasoner(reasoner);
		}
    }

	private OWLReasonerFactory getReasonerFactory(String r){
		OWLReasonerFactory reasonerFactory = null;
		if (r.equalsIgnoreCase("Pellet")) {
			reasonerFactory = new PelletReasonerFactory();
		}
		else if (r.equalsIgnoreCase("JFact")) {
			reasonerFactory = new JFactFactory();
		}
//    	else if (r.equalsIgnoreCase("Elk")) {
//    		reasonerFactory = new ElkReasonerFactory();
//    	}
//    	else if (r.equalsIgnoreCase("Jcel")) {
//    		reasonerFactory = new JcelReasonerFactory();
//    	}
		return reasonerFactory;
	}

    public void applyRenaming(){
		SIDClassExpressionNamer renamer = new SIDClassExpressionNamer(activeOntology, reasoner); 
		renamer.applyNaming(true); 
    }

    public OWLReasoner getReasoner() {
		return reasoner;
	}

	public OWLOntology getActiveOntology() {
		return activeOntology;
	}

}
 
    

