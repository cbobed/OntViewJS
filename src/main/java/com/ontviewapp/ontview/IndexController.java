package com.ontviewapp.ontview;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class IndexController {
    @RequestMapping(value = "/viewOntology", method = RequestMethod.GET)
    public String hello(ModelMap model, @RequestParam(value="uri",
            required = false, defaultValue = "") String uri, @RequestParam(value="position",
            required = false, defaultValue = "left") String position) {
        System.out.println("Entramos al controller uri = " + uri + " -- position = " + position);
        model.addAttribute("uri",uri);
        model.addAttribute("position",position);
        return "index";
    }
}
