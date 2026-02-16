% Erlang sample for GitHub language detection
% BarbrickDesign - Complete Language Portfolio

-module(hello).
-export([main/0, greet/1]).

-record(greeter, {message}).

greet(Greeter) ->
    io:format("~s~n", [Greeter#greeter.message]).

main() ->
    Greeter = #greeter{message = "Hello from Erlang!"},
    greet(Greeter),
    
    % List
    Numbers = [1, 2, 3, 4, 5],
    Doubled = lists:map(fun(X) -> X * 2 end, Numbers),
    
    % Map (Erlang 17+)
    Info = #{
        language => "Erlang",
        paradigm => "Functional",
        typing => "Dynamic"
    },
    
    % List comprehension
    Languages = ["erlang", "elixir", "lfe"],
    Upper = [string:uppercase(L) || L <- Languages],
    
    % Pattern matching
    case 42 of
        42 -> io:format("The answer!~n");
        _ -> io:format("Something else~n")
    end,
    
    io:format("~p~n", [Doubled]),
    io:format("~p~n", [Upper]),
    io:format("~p~n", [Info]).
