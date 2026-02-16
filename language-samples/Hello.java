/**
 * Java sample for GitHub language detection
 * BarbrickDesign - Complete Language Portfolio
 */

import java.util.*;

public class Hello {
    private String message;
    
    public Hello(String message) {
        this.message = message;
    }
    
    public void greet() {
        System.out.println(this.message);
    }
    
    public static void main(String[] args) {
        Hello greeter = new Hello("Hello from Java!");
        greeter.greet();
        
        // Collections
        List<String> languages = new ArrayList<>();
        languages.add("Java");
        languages.add("Python");
        languages.add("JavaScript");
        
        // HashMap
        Map<String, String> info = new HashMap<>();
        info.put("language", "Java");
        info.put("paradigm", "Object-oriented");
        info.put("typing", "Static");
        
        // Stream API
        languages.stream()
                 .map(String::toUpperCase)
                 .forEach(System.out::println);
    }
}
