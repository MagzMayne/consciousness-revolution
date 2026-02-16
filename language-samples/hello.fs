# F# sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

type Greeter(message: string) =
    member this.Message = message
    member this.Greet() = printfn "%s" this.Message

let main () =
    let greeter = Greeter("Hello from F#!")
    greeter.Greet()
    
    // List
    let numbers = [1; 2; 3; 4; 5]
    let doubled = numbers |> List.map (fun x -> x * 2)
    
    // Record
    type LanguageInfo = {
        Language: string
        Paradigm: string
        Typing: string
    }
    
    let info = {
        Language = "F#"
        Paradigm = "Functional"
        Typing = "Static"
    }
    
    // Pipeline
    let languages = ["f#"; "ocaml"; "haskell"]
    languages
    |> List.map (fun s -> s.ToUpper())
    |> List.iter (printfn "%s")
    
    // Pattern matching
    let describe x =
        match x with
        | 42 -> "The answer"
        | _ -> "Something else"
    
    printfn "%A" doubled
    printfn "%s" (describe 42)

main()
