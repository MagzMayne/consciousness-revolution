(* OCaml sample for GitHub language detection
   BarbrickDesign - Complete Language Portfolio *)

type greeter = {
  message : string;
}

let greet g =
  print_endline g.message

let main () =
  let greeter = { message = "Hello from OCaml!" } in
  greet greeter;
  
  (* List *)
  let numbers = [1; 2; 3; 4; 5] in
  let doubled = List.map (fun x -> x * 2) numbers in
  
  (* Record *)
  type language_info = {
    language : string;
    paradigm : string;
    typing : string;
  }
  
  let info = {
    language = "OCaml";
    paradigm = "Functional";
    typing = "Static";
  } in
  
  (* Higher-order functions *)
  let languages = ["ocaml"; "f#"; "haskell"] in
  let upper = List.map String.uppercase_ascii languages in
  
  (* Pattern matching *)
  let describe x =
    match x with
    | 42 -> "The answer"
    | _ -> "Something else"
  in
  
  List.iter (Printf.printf "%d ") doubled;
  print_newline ();
  List.iter (Printf.printf "%s ") upper;
  print_newline ()

let () = main ()
