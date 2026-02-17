#!/usr/bin/env python3
"""
Protocol Agent
Converts natural language requests into canonical TaskSpec

Module: 4.1 from specification
"""

from typing import Dict, Any, List, Optional
import re
import logging
from .schemas import (
    TaskSpecification,
    Object,
    Relation
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ProtocolAgent:
    """
    Protocol Agent - converts natural language to TaskSpec
    
    Module: 4.1 from specification
    
    Responsibilities:
    - Extract domain, goal, objects, relations, constraints from text
    - Populate TaskSpec strictly according to schema
    - Do NOT solve the task; only normalize it
    """
    
    def __init__(self):
        self.domain_keywords = {
            "scheduling": ["schedule", "meeting", "appointment", "calendar", "time", "book"],
            "relationships": ["family", "parent", "child", "sibling", "spouse", "relative", "relationship"],
            "puzzle": ["puzzle", "solve", "riddle", "logic", "constraint"],
            "workflow": ["workflow", "process", "task", "depends", "step", "sequence"],
            "custom": []
        }
        logger.info("Protocol Agent initialized")
    
    def parse_natural_language(self, text: str, source: str = "user") -> TaskSpecification:
        """
        Parse natural language request into TaskSpec
        
        Args:
            text: Natural language description of the task
            source: Source of the request (user, system, agent)
        
        Returns:
            TaskSpecification
        """
        logger.info(f"Parsing natural language: {text[:100]}...")
        
        # Detect domain
        domain = self._detect_domain(text)
        
        # Extract goal
        goal = self._extract_goal(text)
        
        # Extract objects
        objects = self._extract_objects(text, domain)
        
        # Extract relations
        relations = self._extract_relations(text, objects, domain)
        
        # Extract constraints
        constraints = self._extract_constraints(text, domain)
        
        # Create TaskSpec
        task_spec = TaskSpecification(
            source=source,
            natural_language=text,
            domain=domain,
            goal=goal,
            objects=objects,
            relations=relations,
            constraints=constraints
        )
        
        logger.info(f"Created TaskSpec: domain={domain}, objects={len(objects)}, relations={len(relations)}")
        return task_spec
    
    def _detect_domain(self, text: str) -> str:
        """Detect the domain from natural language"""
        text_lower = text.lower()
        
        # Count keyword matches for each domain
        domain_scores = {}
        for domain, keywords in self.domain_keywords.items():
            if domain == "custom":
                continue
            score = sum(1 for keyword in keywords if keyword in text_lower)
            domain_scores[domain] = score
        
        # Return domain with highest score, or "custom" if no match
        if not domain_scores or max(domain_scores.values()) == 0:
            return "custom"
        
        return max(domain_scores, key=domain_scores.get)
    
    def _extract_goal(self, text: str) -> str:
        """Extract the goal from natural language"""
        # Look for phrases like "I want to...", "Please...", "Find...", etc.
        goal_patterns = [
            r"(?:I want to|I need to|Please|Could you)\s+(.+?)(?:\.|$)",
            r"^(.+?)(?:\s+for|\s+between|\s+with|\.|$)"
        ]
        
        for pattern in goal_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Default: use first sentence or first 100 chars
        sentences = re.split(r'[.!?]', text)
        if sentences:
            return sentences[0].strip()[:100]
        
        return text[:100]
    
    def _extract_objects(self, text: str, domain: str) -> List[Object]:
        """Extract objects from natural language"""
        objects = []
        
        if domain == "scheduling":
            # Extract people and resources
            # Simple name extraction: look for capitalized words
            names = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', text)
            for i, name in enumerate(set(names)):
                objects.append(Object(
                    id=f"person_{i}",
                    type="Person",
                    attributes={"name": name}
                ))
            
            # Extract time slots
            time_patterns = [
                r'\b(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\b',
                r'\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b'
            ]
            for pattern in time_patterns:
                times = re.findall(pattern, text, re.IGNORECASE)
                for i, time in enumerate(times):
                    objects.append(Object(
                        id=f"time_{i}",
                        type="TimeSlot",
                        attributes={"value": time}
                    ))
        
        elif domain == "relationships":
            # Extract people
            names = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', text)
            for i, name in enumerate(set(names)):
                objects.append(Object(
                    id=f"person_{i}",
                    type="Person",
                    attributes={"name": name}
                ))
        
        else:
            # Generic object extraction
            # Extract capitalized nouns
            potential_objects = re.findall(r'\b([A-Z][a-z]+)\b', text)
            for i, obj_name in enumerate(set(potential_objects)):
                objects.append(Object(
                    id=f"object_{i}",
                    type="Entity",
                    attributes={"name": obj_name}
                ))
        
        return objects
    
    def _extract_relations(self, text: str, objects: List[Object], domain: str) -> List[Relation]:
        """Extract relations from natural language"""
        relations = []
        
        if domain == "scheduling":
            # Look for "between X and Y" patterns
            pattern = r'between\s+([A-Z][a-z]+)\s+and\s+([A-Z][a-z]+)'
            matches = re.findall(pattern, text, re.IGNORECASE)
            for i, (name1, name2) in enumerate(matches):
                # Find corresponding objects
                obj1 = next((o for o in objects if o.attributes.get("name") == name1), None)
                obj2 = next((o for o in objects if o.attributes.get("name") == name2), None)
                
                if obj1 and obj2:
                    relations.append(Relation(
                        id=f"rel_{i}",
                        type="requires_meeting",
                        from_id=obj1.id,
                        to_id=obj2.id
                    ))
        
        elif domain == "relationships":
            # Look for relationship keywords
            rel_patterns = {
                "parent_of": r'(\w+)\s+is\s+(?:the\s+)?parent\s+of\s+(\w+)',
                "child_of": r'(\w+)\s+is\s+(?:the\s+)?child\s+of\s+(\w+)',
                "sibling_of": r'(\w+)\s+and\s+(\w+)\s+are\s+siblings',
                "spouse_of": r'(\w+)\s+(?:is\s+married\s+to|spouse\s+of)\s+(\w+)'
            }
            
            for rel_type, pattern in rel_patterns.items():
                matches = re.findall(pattern, text, re.IGNORECASE)
                for i, (name1, name2) in enumerate(matches):
                    # Find corresponding objects
                    obj1 = next((o for o in objects if o.attributes.get("name", "").lower() == name1.lower()), None)
                    obj2 = next((o for o in objects if o.attributes.get("name", "").lower() == name2.lower()), None)
                    
                    if obj1 and obj2:
                        relations.append(Relation(
                            id=f"rel_{rel_type}_{i}",
                            type=rel_type,
                            from_id=obj1.id,
                            to_id=obj2.id
                        ))
        
        return relations
    
    def _extract_constraints(self, text: str, domain: str) -> List[str]:
        """Extract constraints from natural language"""
        constraints = []
        
        text_lower = text.lower()
        
        # Common constraint patterns
        constraint_keywords = {
            "no_overlapping": ["no overlap", "no overlapping", "don't overlap"],
            "before": ["before", "prior to", "earlier than"],
            "after": ["after", "following", "later than"],
            "business_hours_only": ["business hours", "working hours", "9 to 5"],
            "same_day": ["same day", "on the same day"],
            "availability": ["available", "availability", "free"]
        }
        
        for constraint_id, keywords in constraint_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                constraints.append(constraint_id)
        
        # Domain-specific constraints
        if domain == "scheduling":
            if "meeting" in text_lower:
                constraints.append("valid_meeting_duration")
        
        return constraints


if __name__ == "__main__":
    # Test the protocol agent
    print("Testing Protocol Agent...")
    
    agent = ProtocolAgent()
    
    # Test 1: Scheduling domain
    test1 = agent.parse_natural_language(
        "Schedule a meeting between Alice and Bob for Monday at 2:00 PM"
    )
    print("\n✓ Test 1: Scheduling")
    print(f"  Domain: {test1.domain}")
    print(f"  Goal: {test1.goal}")
    print(f"  Objects: {len(test1.objects)}")
    print(f"  Relations: {len(test1.relations)}")
    print(f"  Constraints: {test1.constraints}")
    
    # Test 2: Relationships domain
    test2 = agent.parse_natural_language(
        "Alice is the parent of Bob, and Charlie is the child of Alice"
    )
    print("\n✓ Test 2: Relationships")
    print(f"  Domain: {test2.domain}")
    print(f"  Goal: {test2.goal}")
    print(f"  Objects: {len(test2.objects)}")
    print(f"  Relations: {len(test2.relations)}")
    for rel in test2.relations:
        print(f"    - {rel.type}: {rel.from_id} -> {rel.to_id}")
    
    # Test 3: Custom domain
    test3 = agent.parse_natural_language(
        "Solve the puzzle where X must come before Y"
    )
    print("\n✓ Test 3: Puzzle")
    print(f"  Domain: {test3.domain}")
    print(f"  Goal: {test3.goal}")
    print(f"  Constraints: {test3.constraints}")
    
    print("\n✓ Protocol Agent test complete!")
