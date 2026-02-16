// Groovy sample for GitHub language detection
// BarbrickDesign - Complete Language Portfolio

class Greeter {
    String message
    
    Greeter(String message) {
        this.message = message
    }
    
    void greet() {
        println message
    }
}

def main() {
    def greeter = new Greeter("Hello from Groovy!")
    greeter.greet()
    
    // List
    def numbers = [1, 2, 3, 4, 5]
    def doubled = numbers.collect { it * 2 }
    
    // Map
    def info = [
        language: "Groovy",
        paradigm: "Multi-paradigm",
        typing: "Dynamic"
    ]
    
    // Closures
    def languages = ["groovy", "java", "scala"]
    languages.each { lang ->
        println lang.toUpperCase()
    }
    
    // Range
    (1..5).each { println it }
    
    println doubled
}

main()
