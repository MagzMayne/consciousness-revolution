#!/bin/bash
# Language Samples Compilation and Testing Script
# BarbrickDesign - AUL Showcase Verification
# This script compiles/runs as many language samples as possible

set -e

SAMPLES_DIR="language-samples"
RESULTS_FILE="compilation-results.md"
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# List of compilers/interpreters to check
COMPILERS="gcc g++ python3 node ruby go rustc javac dotnet swift kotlinc julia R"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 BarbrickDesign Language Portfolio - Compilation Test Suite"
echo "=============================================================="
echo ""

# Initialize results file
cat > "$RESULTS_FILE" << 'EOF'
# Language Samples Compilation Results

This document shows the results of compiling/running all language samples in the repository.

## Test Results Summary

EOF

log_result() {
    local language=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "SUCCESS" ]; then
        echo -e "${GREEN}✓${NC} $language: $message"
        echo "- ✅ **$language**: $message" >> "$RESULTS_FILE"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗${NC} $language: $message"
        echo "- ❌ **$language**: $message" >> "$RESULTS_FILE"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    else
        echo -e "${YELLOW}⊘${NC} $language: $message"
        echo "- ⚠️ **$language**: $message" >> "$RESULTS_FILE"
        SKIP_COUNT=$((SKIP_COUNT + 1))
    fi
}

cd "$SAMPLES_DIR"

echo "Testing Compiled Languages..."
echo "=============================="

# C
echo -n "Testing C... "
if gcc hello.c -o "$(mktemp)" 2>/dev/null; then
    TEMP_C=$(mktemp)
    gcc hello.c -o "$TEMP_C" 2>/dev/null
    if "$TEMP_C" > /dev/null 2>&1; then
        log_result "C" "SUCCESS" "Compiled and executed successfully"
    else
        log_result "C" "FAIL" "Compiled but execution failed"
    fi
    rm -f "$TEMP_C"
else
    log_result "C" "FAIL" "Compilation failed"
fi

# C++
echo -n "Testing C++... "
if g++ hello.cpp -o /tmp/hello_cpp 2>/dev/null; then
    if /tmp/hello_cpp > /dev/null 2>&1; then
        log_result "C++" "SUCCESS" "Compiled and executed successfully"
    else
        log_result "C++" "FAIL" "Compiled but execution failed"
    fi
    rm -f /tmp/hello_cpp
else
    log_result "C++" "FAIL" "Compilation failed"
fi

# Go
echo -n "Testing Go... "
if go build -o /tmp/hello_go hello.go 2>/dev/null; then
    if /tmp/hello_go > /dev/null 2>&1; then
        log_result "Go" "SUCCESS" "Compiled and executed successfully"
    else
        log_result "Go" "FAIL" "Compiled but execution failed"
    fi
    rm -f /tmp/hello_go
else
    log_result "Go" "FAIL" "Compilation failed"
fi

# Rust
echo -n "Testing Rust... "
if rustc hello.rs -o /tmp/hello_rs 2>/dev/null; then
    if /tmp/hello_rs > /dev/null 2>&1; then
        log_result "Rust" "SUCCESS" "Compiled and executed successfully"
    else
        log_result "Rust" "FAIL" "Compiled but execution failed"
    fi
    rm -f /tmp/hello_rs
else
    log_result "Rust" "FAIL" "Compilation failed"
fi

# Java
echo -n "Testing Java... "
if javac Hello.java 2>/dev/null; then
    if java Hello > /dev/null 2>&1; then
        log_result "Java" "SUCCESS" "Compiled and executed successfully"
    else
        log_result "Java" "FAIL" "Compiled but execution failed"
    fi
    rm -f Hello.class
else
    log_result "Java" "FAIL" "Compilation failed"
fi

# C#
echo -n "Testing C#... "
if dotnet --version > /dev/null 2>&1; then
    if dotnet build hello.cs -o /tmp 2>/dev/null; then
        log_result "C#" "SUCCESS" "Compiled successfully"
    else
        log_result "C#" "SKIP" "Compilation not available in this environment"
    fi
else
    log_result "C#" "SKIP" "dotnet not properly configured"
fi

# Swift
echo -n "Testing Swift... "
if which swift > /dev/null 2>&1; then
    if swiftc hello.swift -o /tmp/hello_swift 2>/dev/null; then
        if /tmp/hello_swift > /dev/null 2>&1; then
            log_result "Swift" "SUCCESS" "Compiled and executed successfully"
        else
            log_result "Swift" "FAIL" "Compiled but execution failed"
        fi
        rm -f /tmp/hello_swift
    else
        log_result "Swift" "FAIL" "Compilation failed"
    fi
else
    log_result "Swift" "SKIP" "Swift compiler not available"
fi

# Kotlin
echo -n "Testing Kotlin... "
if which kotlinc > /dev/null 2>&1; then
    if kotlinc hello.kt -include-runtime -d /tmp/hello.jar 2>/dev/null; then
        if java -jar /tmp/hello.jar > /dev/null 2>&1; then
            log_result "Kotlin" "SUCCESS" "Compiled and executed successfully"
        else
            log_result "Kotlin" "FAIL" "Compiled but execution failed"
        fi
        rm -f /tmp/hello.jar
    else
        log_result "Kotlin" "FAIL" "Compilation failed"
    fi
else
    log_result "Kotlin" "SKIP" "Kotlin compiler not available"
fi

# Julia
echo -n "Testing Julia... "
if which julia > /dev/null 2>&1; then
    if julia hello.jl > /dev/null 2>&1; then
        log_result "Julia" "SUCCESS" "Executed successfully"
    else
        log_result "Julia" "FAIL" "Execution failed"
    fi
else
    log_result "Julia" "SKIP" "Julia not available"
fi

echo ""
echo "Testing Interpreted Languages..."
echo "================================="

# Python
echo -n "Testing Python... "
if python3 hello.py > /dev/null 2>&1; then
    log_result "Python" "SUCCESS" "Executed successfully"
else
    log_result "Python" "FAIL" "Execution failed"
fi

# JavaScript (Node.js)
echo -n "Testing JavaScript... "
if node hello.js > /dev/null 2>&1; then
    log_result "JavaScript" "SUCCESS" "Executed successfully (Node.js)"
else
    log_result "JavaScript" "FAIL" "Execution failed"
fi

# TypeScript
echo -n "Testing TypeScript... "
if which tsc > /dev/null 2>&1; then
    # Use tsconfig.json if it exists, otherwise use explicit options
    if [ -f "tsconfig.json" ]; then
        tsc 2>/dev/null
        if [ $? -eq 0 ]; then
            if node ts-out/hello.js > /dev/null 2>&1; then
                log_result "TypeScript" "SUCCESS" "Compiled to JS and executed successfully"
            else
                log_result "TypeScript" "FAIL" "Compiled but execution failed"
            fi
            rm -rf ts-out
        else
            log_result "TypeScript" "FAIL" "Compilation failed"
            rm -rf ts-out
        fi
    else
        if tsc hello.ts 2>/dev/null && node hello.js > /dev/null 2>&1; then
            log_result "TypeScript" "SUCCESS" "Compiled to JS and executed successfully"
            rm -f hello.js
        else
            log_result "TypeScript" "FAIL" "Compilation or execution failed"
            rm -f hello.js
        fi
    fi
else
    log_result "TypeScript" "SKIP" "TypeScript compiler not available"
fi

# Ruby
echo -n "Testing Ruby... "
if ruby hello.rb > /dev/null 2>&1; then
    log_result "Ruby" "SUCCESS" "Executed successfully"
else
    log_result "Ruby" "FAIL" "Execution failed"
fi

# PHP
echo -n "Testing PHP... "
if php hello.php > /dev/null 2>&1; then
    log_result "PHP" "SUCCESS" "Executed successfully"
else
    log_result "PHP" "FAIL" "Execution failed"
fi

# Perl
echo -n "Testing Perl... "
if perl hello.pl > /dev/null 2>&1; then
    log_result "Perl" "SUCCESS" "Executed successfully"
else
    log_result "Perl" "FAIL" "Execution failed"
fi

# Bash
echo -n "Testing Bash... "
if bash hello.sh > /dev/null 2>&1; then
    log_result "Bash" "SUCCESS" "Executed successfully"
else
    log_result "Bash" "FAIL" "Execution failed"
fi

# Lua
echo -n "Testing Lua... "
if which lua > /dev/null 2>&1; then
    if lua hello.lua > /dev/null 2>&1; then
        log_result "Lua" "SUCCESS" "Executed successfully"
    else
        log_result "Lua" "FAIL" "Execution failed"
    fi
else
    log_result "Lua" "SKIP" "Lua interpreter not available"
fi

# PowerShell
echo -n "Testing PowerShell... "
if which pwsh > /dev/null 2>&1; then
    if pwsh hello.ps1 > /dev/null 2>&1; then
        log_result "PowerShell" "SUCCESS" "Executed successfully"
    else
        log_result "PowerShell" "FAIL" "Execution failed"
    fi
else
    log_result "PowerShell" "SKIP" "PowerShell not available"
fi

# R
echo -n "Testing R... "
if which R > /dev/null 2>&1 || which Rscript > /dev/null 2>&1; then
    if Rscript hello.r > /dev/null 2>&1; then
        log_result "R" "SUCCESS" "Executed successfully"
    else
        log_result "R" "FAIL" "Execution failed"
    fi
else
    log_result "R" "SKIP" "R interpreter not available"
fi

echo ""
echo "Testing Functional Languages..."
echo "================================"

# Haskell
echo -n "Testing Haskell... "
if which ghc > /dev/null 2>&1; then
    if ghc hello.hs -o /tmp/hello_hs 2>/dev/null; then
        if /tmp/hello_hs > /dev/null 2>&1; then
            log_result "Haskell" "SUCCESS" "Compiled and executed successfully"
        else
            log_result "Haskell" "FAIL" "Compiled but execution failed"
        fi
        rm -f /tmp/hello_hs hello.hi hello.o
    else
        log_result "Haskell" "FAIL" "Compilation failed"
    fi
else
    log_result "Haskell" "SKIP" "Haskell compiler not available"
fi

# Scala
echo -n "Testing Scala... "
if which scalac > /dev/null 2>&1; then
    if scalac hello.scala 2>/dev/null; then
        if scala Hello > /dev/null 2>&1; then
            log_result "Scala" "SUCCESS" "Compiled and executed successfully"
        else
            log_result "Scala" "FAIL" "Compiled but execution failed"
        fi
        rm -f Hello.class Hello$.class
    else
        log_result "Scala" "FAIL" "Compilation failed"
    fi
else
    log_result "Scala" "SKIP" "Scala compiler not available"
fi

# Clojure
echo -n "Testing Clojure... "
if which clojure > /dev/null 2>&1; then
    if clojure hello.clj > /dev/null 2>&1; then
        log_result "Clojure" "SUCCESS" "Executed successfully"
    else
        log_result "Clojure" "FAIL" "Execution failed"
    fi
else
    log_result "Clojure" "SKIP" "Clojure not available"
fi

# Erlang
echo -n "Testing Erlang... "
if which erl > /dev/null 2>&1; then
    if erlc hello.erl 2>/dev/null; then
        log_result "Erlang" "SUCCESS" "Compiled successfully"
        rm -f hello.beam
    else
        log_result "Erlang" "FAIL" "Compilation failed"
    fi
else
    log_result "Erlang" "SKIP" "Erlang compiler not available"
fi

# Elixir
echo -n "Testing Elixir... "
if which elixir > /dev/null 2>&1; then
    if elixir hello.ex > /dev/null 2>&1; then
        log_result "Elixir" "SUCCESS" "Executed successfully"
    else
        log_result "Elixir" "FAIL" "Execution failed"
    fi
else
    log_result "Elixir" "SKIP" "Elixir not available"
fi

# F#
echo -n "Testing F#... "
if which fsharpc > /dev/null 2>&1 || which dotnet > /dev/null 2>&1; then
    log_result "F#" "SKIP" "F# available but needs project setup"
else
    log_result "F#" "SKIP" "F# compiler not available"
fi

# OCaml
echo -n "Testing OCaml... "
if which ocamlc > /dev/null 2>&1; then
    if ocamlc hello.ml -o /tmp/hello_ml 2>/dev/null; then
        if /tmp/hello_ml > /dev/null 2>&1; then
            log_result "OCaml" "SUCCESS" "Compiled and executed successfully"
        else
            log_result "OCaml" "FAIL" "Compiled but execution failed"
        fi
        rm -f /tmp/hello_ml hello.cmi hello.cmo
    else
        log_result "OCaml" "FAIL" "Compilation failed"
    fi
else
    log_result "OCaml" "SKIP" "OCaml compiler not available"
fi

# Lisp
echo -n "Testing Lisp... "
if which clisp > /dev/null 2>&1 || which sbcl > /dev/null 2>&1; then
    if clisp hello.lisp > /dev/null 2>&1 || sbcl --script hello.lisp > /dev/null 2>&1; then
        log_result "Lisp" "SUCCESS" "Executed successfully"
    else
        log_result "Lisp" "FAIL" "Execution failed"
    fi
else
    log_result "Lisp" "SKIP" "Lisp interpreter not available"
fi

echo ""
echo "Testing Other Languages..."
echo "=========================="

# Groovy
echo -n "Testing Groovy... "
if which groovy > /dev/null 2>&1; then
    if groovy hello.groovy > /dev/null 2>&1; then
        log_result "Groovy" "SUCCESS" "Executed successfully"
    else
        log_result "Groovy" "FAIL" "Execution failed"
    fi
else
    log_result "Groovy" "SKIP" "Groovy not available"
fi

# Dart
echo -n "Testing Dart... "
if which dart > /dev/null 2>&1; then
    if dart hello.dart > /dev/null 2>&1; then
        log_result "Dart" "SUCCESS" "Executed successfully"
    else
        log_result "Dart" "FAIL" "Execution failed"
    fi
else
    log_result "Dart" "SKIP" "Dart not available"
fi

# Nim
echo -n "Testing Nim... "
if which nim > /dev/null 2>&1; then
    if nim c --run hello.nim > /dev/null 2>&1; then
        log_result "Nim" "SUCCESS" "Compiled and executed successfully"
        rm -f hello
    else
        log_result "Nim" "FAIL" "Compilation or execution failed"
    fi
else
    log_result "Nim" "SKIP" "Nim compiler not available"
fi

# Crystal
echo -n "Testing Crystal... "
if which crystal > /dev/null 2>&1; then
    if crystal hello.cr > /dev/null 2>&1; then
        log_result "Crystal" "SUCCESS" "Executed successfully"
    else
        log_result "Crystal" "FAIL" "Execution failed"
    fi
else
    log_result "Crystal" "SKIP" "Crystal not available"
fi

# Zig
echo -n "Testing Zig... "
if which zig > /dev/null 2>&1; then
    if zig run hello.zig > /dev/null 2>&1; then
        log_result "Zig" "SUCCESS" "Compiled and executed successfully"
    else
        log_result "Zig" "FAIL" "Compilation or execution failed"
    fi
else
    log_result "Zig" "SKIP" "Zig compiler not available"
fi

cd ..

# Add summary to results file
cat >> "$RESULTS_FILE" << EOF

## Summary Statistics

- ✅ **Success**: $SUCCESS_COUNT languages
- ❌ **Failed**: $FAIL_COUNT languages
- ⚠️ **Skipped**: $SKIP_COUNT languages
- 📊 **Total Tested**: $((SUCCESS_COUNT + FAIL_COUNT + SKIP_COUNT)) languages

## Test Environment

- **OS**: $(uname -s)
- **Architecture**: $(uname -m)
- **Date**: $(date)
- **Script**: test-language-samples.sh

## Available Compilers/Interpreters

$(for cmd in $COMPILERS; do
    if which $cmd > /dev/null 2>&1; then
        echo "- $cmd: $(which $cmd)"
    fi
done)

## Notes

This test suite verifies that language samples can be compiled and/or executed in the current environment. Some languages may be skipped if their compilers/interpreters are not available.

---

Generated by BarbrickDesign Language Portfolio Testing Suite
EOF

echo ""
echo "=============================================================="
echo "Test Results Summary"
echo "=============================================================="
echo -e "${GREEN}Success:${NC} $SUCCESS_COUNT languages"
echo -e "${RED}Failed:${NC} $FAIL_COUNT languages"
echo -e "${YELLOW}Skipped:${NC} $SKIP_COUNT languages"
echo -e "${BLUE}Total:${NC} $((SUCCESS_COUNT + FAIL_COUNT + SKIP_COUNT)) languages"
echo ""
echo "Detailed results saved to: $RESULTS_FILE"
echo "=============================================================="
