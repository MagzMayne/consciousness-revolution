#!/usr/bin/env bash
# Bash sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

greet() {
    local message=$1
    echo "$message"
}

main() {
    greet "Hello from Bash!"
    
    # Array
    numbers=(1 2 3 4 5)
    
    # Loop
    for num in "${numbers[@]}"; do
        echo $((num * 2))
    done
    
    # Associative array (Bash 4+)
    declare -A info
    info[language]="Bash"
    info[paradigm]="Scripting"
    info[typing]="Dynamic"
    
    # String manipulation
    languages=("bash" "zsh" "fish")
    for lang in "${languages[@]}"; do
        echo "${lang^^}"
    done
}

main
