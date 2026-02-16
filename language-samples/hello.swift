/**
 * Swift sample for GitHub language detection
 * BarbrickDesign - Complete Language Portfolio
 */

import Foundation

class Greeter {
    var message: String
    
    init(message: String) {
        self.message = message
    }
    
    func greet() {
        print(message)
    }
}

func main() {
    let greeter = Greeter(message: "Hello from Swift!")
    greeter.greet()
    
    // Array
    let numbers = [1, 2, 3, 4, 5]
    let doubled = numbers.map { $0 * 2 }
    
    // Dictionary
    let info: [String: String] = [
        "language": "Swift",
        "paradigm": "Multi-paradigm",
        "typing": "Static"
    ]
    
    // For-in loop
    let languages = ["Swift", "Objective-C", "C"]
    for lang in languages {
        print(lang.uppercased())
    }
    
    // Optional
    var optional: String? = "Optional value"
    if let value = optional {
        print(value)
    }
}

main()
