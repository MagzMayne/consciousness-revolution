# Julia sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

struct Greeter
    message::String
end

function greet(g::Greeter)
    println(g.message)
end

function main()
    greeter = Greeter("Hello from Julia!")
    greet(greeter)
    
    # Array
    numbers = [1, 2, 3, 4, 5]
    doubled = [x * 2 for x in numbers]
    
    # Dictionary
    info = Dict(
        "language" => "Julia",
        "paradigm" => "Multi-paradigm",
        "typing" => "Dynamic"
    )
    
    # Map function
    languages = ["julia", "python", "r"]
    upper = map(uppercase, languages)
    
    # Broadcasting
    result = numbers .* 2
    
    println(doubled)
    println(upper)
    println(info)
end

main()
