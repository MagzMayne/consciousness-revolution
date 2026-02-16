# Elixir sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

defmodule Greeter do
  defstruct message: ""
  
  def greet(%Greeter{message: message}) do
    IO.puts(message)
  end
end

defmodule Hello do
  def main do
    greeter = %Greeter{message: "Hello from Elixir!"}
    Greeter.greet(greeter)
    
    # List
    numbers = [1, 2, 3, 4, 5]
    doubled = Enum.map(numbers, fn x -> x * 2 end)
    
    # Map
    info = %{
      language: "Elixir",
      paradigm: "Functional",
      typing: "Dynamic"
    }
    
    # Pipe operator
    languages = ["elixir", "erlang", "lfe"]
    languages
    |> Enum.map(&String.upcase/1)
    |> Enum.each(&IO.puts/1)
    
    # Pattern matching
    case 42 do
      42 -> IO.puts("The answer!")
      _ -> IO.puts("Something else")
    end
    
    IO.inspect(doubled)
    IO.inspect(info)
  end
end

Hello.main()
