#!/usr/bin/env powershell
# PowerShell sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

class Greeter {
    [string]$Message
    
    Greeter([string]$message) {
        $this.Message = $message
    }
    
    [void] Greet() {
        Write-Host $this.Message
    }
}

function Main {
    $greeter = [Greeter]::new("Hello from PowerShell!")
    $greeter.Greet()
    
    # Array
    $numbers = @(1, 2, 3, 4, 5)
    $doubled = $numbers | ForEach-Object { $_ * 2 }
    
    # Hashtable
    $info = @{
        Language = "PowerShell"
        Paradigm = "Multi-paradigm"
        Typing = "Dynamic"
    }
    
    # Pipeline
    $languages = @("powershell", "bash", "cmd")
    $languages | ForEach-Object { $_.ToUpper() } | Write-Host
    
    # Conditional
    if ($info.Language -eq "PowerShell") {
        Write-Host "Running PowerShell!"
    }
    
    Write-Host $doubled
}

Main
