#!/usr/bin/env python3
"""
Base Domain Pack
Defines the interface for pluggable domain-specific logic modules

Module: 4.7 from specification
"""

from typing import List, Dict, Any
from abc import ABC, abstractmethod
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from reasoning.constraint_engine import ConstraintRule


class DomainPack(ABC):
    """
    Base class for domain packs
    
    Module: 4.7 from specification
    
    Domain packs provide:
    - Allowed object types
    - Relation types
    - Constraint rules
    """
    
    def __init__(self, name: str):
        self.name = name
        self.object_types: List[str] = []
        self.relation_types: List[str] = []
        self.constraint_rules: List[ConstraintRule] = []
    
    @abstractmethod
    def get_object_types(self) -> List[str]:
        """Return allowed object types for this domain"""
        pass
    
    @abstractmethod
    def get_relation_types(self) -> List[Dict[str, Any]]:
        """
        Return relation types with their properties
        Returns: List of dicts with structure:
        {
            "type": "relation_name",
            "properties": {
                "symmetric": bool,
                "transitive": bool,
                "anti_symmetric": bool
            }
        }
        """
        pass
    
    @abstractmethod
    def get_constraint_rules(self) -> List[ConstraintRule]:
        """Return domain-specific constraint rules"""
        pass
    
    def get_description(self) -> str:
        """Return a description of this domain"""
        return f"Domain pack: {self.name}"
