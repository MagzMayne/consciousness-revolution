/**
 * Kotlin sample for GitHub language detection
 * BarbrickDesign - Complete Language Portfolio
 */

class Greeter(private val message: String) {
    fun greet() {
        println(message)
    }
}

fun main() {
    val greeter = Greeter("Hello from Kotlin!")
    greeter.greet()
    
    // List
    val numbers = listOf(1, 2, 3, 4, 5)
    val doubled = numbers.map { it * 2 }
    
    // Map
    val info = mapOf(
        "language" to "Kotlin",
        "paradigm" to "Multi-paradigm",
        "typing" to "Static"
    )
    
    // Lambda
    val languages = listOf("Kotlin", "Java", "Scala")
    languages.forEach { lang ->
        println(lang.uppercase())
    }
    
    // When expression
    val value = 42
    when (value) {
        42 -> println("The answer!")
        else -> println("Something else")
    }
}
