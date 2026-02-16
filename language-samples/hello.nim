// Nim sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

type
  Greeter = object
    message: string

proc greet(g: Greeter) =
  echo g.message

proc main() =
  var greeter = Greeter(message: "Hello from Nim!")
  greeter.greet()
  
  # Seq (sequence)
  let numbers = @[1, 2, 3, 4, 5]
  var doubled = newSeq[int]()
  for num in numbers:
    doubled.add(num * 2)
  
  # Table
  import tables
  var info = initTable[string, string]()
  info["language"] = "Nim"
  info["paradigm"] = "Multi-paradigm"
  info["typing"] = "Static"
  
  # Map
  let languages = @["nim", "python", "c"]
  for lang in languages:
    echo lang.toUpperAscii()
  
  # Pattern matching
  let value = 42
  case value
  of 42:
    echo "The answer!"
  else:
    echo "Something else"
  
  echo doubled

main()
