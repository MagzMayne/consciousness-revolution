// Solidity sample for GitHub language detection
// BarbrickDesign - Complete Language Portfolio

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Greeter {
    string private message;
    address public owner;
    
    event Greeted(string message, address sender);
    
    constructor(string memory _message) {
        message = _message;
        owner = msg.sender;
    }
    
    function greet() public view returns (string memory) {
        return message;
    }
    
    function setMessage(string memory _message) public {
        require(msg.sender == owner, "Only owner can set message");
        message = _message;
        emit Greeted(_message, msg.sender);
    }
    
    struct Language {
        string name;
        string paradigm;
        string typing;
    }
    
    mapping(uint => Language) public languages;
    uint public languageCount;
    
    function addLanguage(string memory _name, string memory _paradigm, string memory _typing) public {
        languages[languageCount] = Language(_name, _paradigm, _typing);
        languageCount++;
    }
}
