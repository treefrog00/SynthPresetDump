"""JSON report generator for Minilogue XD program data"""

import json
from typing import Any, Dict
from .program_data import ProgramData


class JsonReportGenerator:
    """Generates JSON reports from Minilogue XD program data"""
    
    @property
    def preferred_file_extension(self) -> str:
        return ".json"
    
    def generate_report(self, program_data: ProgramData) -> str:
        """Generate JSON report from program data"""
        return json.dumps(self._serialize_program_data(program_data), indent=2)
    
    def _serialize_program_data(self, program_data: ProgramData) -> Dict[str, Any]:
        """Convert ProgramData to a JSON-serializable dictionary"""
        result = {}
        
        for field_name, field_value in program_data.__dict__.items():
            if hasattr(field_value, 'value'):
                # Handle enum types
                result[field_name] = field_value.value
            elif hasattr(field_value, 'name'):
                # Handle enum types with name attribute
                result[field_name] = field_value.name
            else:
                # Handle primitive types
                result[field_name] = field_value
        
        return result