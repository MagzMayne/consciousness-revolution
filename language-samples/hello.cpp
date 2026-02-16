/**
 * C++ sample for GitHub language detection
 * BarbrickDesign - Complete Language Portfolio
 */

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>

class Greeter {
private:
    std::string message;
    
public:
    Greeter(const std::string& msg) : message(msg) {}
    
    void greet() const {
        std::cout << message << std::endl;
    }
};

int main() {
    Greeter greeter("Hello from C++!");
    greeter.greet();
    
    // Vector
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    // Map
    std::map<std::string, std::string> info;
    info["language"] = "C++";
    info["paradigm"] = "Multi-paradigm";
    info["typing"] = "Static";
    
    // Algorithm
    std::for_each(numbers.begin(), numbers.end(), [](int n) {
        std::cout << n * 2 << " ";
    });
    
    return 0;
}
