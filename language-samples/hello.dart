// Dart sample for GitHub language detection
// BarbrickDesign - Complete Language Portfolio

class Greeter {
  final String message;
  
  Greeter(this.message);
  
  void greet() {
    print(message);
  }
}

void main() {
  var greeter = Greeter("Hello from Dart!");
  greeter.greet();
  
  // List
  var numbers = [1, 2, 3, 4, 5];
  var doubled = numbers.map((n) => n * 2).toList();
  
  // Map
  var info = {
    'language': 'Dart',
    'paradigm': 'Multi-paradigm',
    'typing': 'Static',
  };
  
  // Collection methods
  var languages = ['Dart', 'Flutter', 'JavaScript'];
  languages.forEach((lang) {
    print(lang.toUpperCase());
  });
  
  // Async/await
  Future<String> fetchData() async {
    await Future.delayed(Duration(seconds: 1));
    return 'Data loaded';
  }
}
