// Crystal sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

class Greeter
  property message : String
  
  def initialize(@message : String)
  end
  
  def greet
    puts @message
  end
end

def main
  greeter = Greeter.new("Hello from Crystal!")
  greeter.greet
  
  # Array
  numbers = [1, 2, 3, 4, 5]
  doubled = numbers.map { |x| x * 2 }
  
  # Hash
  info = {
    "language" => "Crystal",
    "paradigm" => "Multi-paradigm",
    "typing"   => "Static",
  }
  
  # Block
  languages = ["crystal", "ruby", "elixir"]
  languages.each do |lang|
    puts lang.upcase
  end
  
  # Pattern matching
  value = 42
  case value
  when 42
    puts "The answer!"
  else
    puts "Something else"
  end
  
  puts doubled
end

main
