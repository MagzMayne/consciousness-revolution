/**
 * C# sample for GitHub language detection
 * BarbrickDesign - Complete Language Portfolio
 */

using System;
using System.Collections.Generic;
using System.Linq;

namespace BarbrickDesign
{
    class Greeter
    {
        private string message;
        
        public Greeter(string message)
        {
            this.message = message;
        }
        
        public void Greet()
        {
            Console.WriteLine(message);
        }
    }
    
    class Program
    {
        static void Main(string[] args)
        {
            var greeter = new Greeter("Hello from C#!");
            greeter.Greet();
            
            // List
            var languages = new List<string> { "C#", "Java", "Python" };
            
            // Dictionary
            var info = new Dictionary<string, string>
            {
                ["language"] = "C#",
                ["paradigm"] = "Multi-paradigm",
                ["typing"] = "Static"
            };
            
            // LINQ
            var upper = languages.Select(l => l.ToUpper());
            foreach (var lang in upper)
            {
                Console.WriteLine(lang);
            }
        }
    }
}
