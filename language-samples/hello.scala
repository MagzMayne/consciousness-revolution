/**
 * Scala sample for GitHub language detection
 * BarbrickDesign - Complete Language Portfolio
 */

object Hello {
  class Greeter(message: String) {
    def greet(): Unit = {
      println(message)
    }
  }
  
  def main(args: Array[String]): Unit = {
    val greeter = new Greeter("Hello from Scala!")
    greeter.greet()
    
    // List
    val numbers = List(1, 2, 3, 4, 5)
    val doubled = numbers.map(_ * 2)
    
    // Map
    val info = Map(
      "language" -> "Scala",
      "paradigm" -> "Multi-paradigm",
      "typing" -> "Static"
    )
    
    // Higher-order functions
    val languages = List("Scala", "Java", "Kotlin")
    languages.foreach(lang => println(lang.toUpperCase))
    
    // Pattern matching
    val value = 42
    value match {
      case 42 => println("The answer!")
      case _ => println("Something else")
    }
  }
}
