-- Haskell sample for GitHub language detection
-- BarbrickDesign - Complete Language Portfolio

module Main where

import Data.Char (toUpper)

data Greeter = Greeter { message :: String }

greet :: Greeter -> IO ()
greet g = putStrLn (message g)

main :: IO ()
main = do
    let greeter = Greeter "Hello from Haskell!"
    greet greeter
    
    -- List comprehension
    let numbers = [1..5]
    let doubled = [x * 2 | x <- numbers]
    
    -- Map
    let languages = ["haskell", "elm", "purescript"]
    let upper = map (map toUpper) languages
    
    -- Pattern matching
    let describe x = case x of
            42 -> "The answer"
            _  -> "Something else"
    
    -- Print results
    print doubled
    mapM_ putStrLn upper
    putStrLn $ describe 42
