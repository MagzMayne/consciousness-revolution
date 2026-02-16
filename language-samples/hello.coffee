#!/usr/bin/env coffeescript
# CoffeeScript sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

class Greeter
  constructor: (@message) ->
  
  greet: ->
    console.log @message

main = ->
  greeter = new Greeter "Hello from CoffeeScript!"
  greeter.greet()
  
  # Array comprehension
  numbers = [1..5]
  doubled = (n * 2 for n in numbers)
  
  # Object
  info =
    language: "CoffeeScript"
    paradigm: "Multi-paradigm"
    typing: "Dynamic"
  
  # Function
  languages = ["coffeescript", "javascript", "typescript"]
  upper = (lang.toUpperCase() for lang in languages)
  
  # Conditional
  value = 42
  result = if value is 42 then "The answer!" else "Something else"
  
  console.log doubled
  console.log upper
  console.log result

main()
