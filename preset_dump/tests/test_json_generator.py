"""Tests for JsonReportGenerator"""

import pytest
import json
from src.services.json_generator import JsonReportGenerator
from src.services.enums import *


class TestJsonReportGenerator:
    
    def test_preferred_file_extension(self):
        """Test that the generator returns correct file extension"""
        generator = JsonReportGenerator()
        assert generator.preferred_file_extension == ".json"
    
    def test_generate_report_minimal(self, minimal_program_data):
        """Test JSON generation with minimal program data"""
        generator = JsonReportGenerator()
        result = generator.generate_report(minimal_program_data)
        
        # Should be valid JSON
        parsed = json.loads(result)
        
        # Check basic structure
        assert isinstance(parsed, dict)
        assert parsed["header"] == "PROG"
        assert parsed["program_name"] == "Minimal"
        assert parsed["program_end_marker"] == "PRED"
    
    def test_generate_report_full(self, sample_program_data):
        """Test JSON generation with full program data"""
        generator = JsonReportGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Should be valid JSON
        parsed = json.loads(result)
        
        # Check structure is complete
        assert isinstance(parsed, dict)
        assert len(parsed) > 50  # Should have many fields
        
        # Check specific values
        assert parsed["program_name"] == "Test Program"
        assert parsed["octave"] == 2
        assert parsed["portamento"] == 64
        assert parsed["key_trig"] == True
        
        # Check enum serialization
        assert parsed["voice_mode_type"] == VoiceModeType.POLY.value
        assert parsed["vco1_wave"] == VcoWave.SAW.value
        assert parsed["multi_osc_type"] == MultiOscType.VPM.value
    
    def test_enum_serialization(self, sample_program_data):
        """Test that enums are properly serialized to their values"""
        generator = JsonReportGenerator()
        result = generator.generate_report(sample_program_data)
        parsed = json.loads(result)
        
        # Test various enum types
        assert parsed["vco1_wave"] == 2  # SAW
        assert parsed["voice_mode_type"] == 4  # POLY
        assert parsed["mod_fx_type"] == 1  # CHORUS
        assert parsed["delay_sub_type"] == 0  # STEREO
        assert parsed["reverb_sub_type"] == 0  # HALL
    
    def test_boolean_serialization(self, sample_program_data):
        """Test that boolean values are properly serialized"""
        generator = JsonReportGenerator()
        result = generator.generate_report(sample_program_data)
        parsed = json.loads(result)
        
        # Test boolean fields
        assert parsed["key_trig"] is True
        assert parsed["oscillator_sync"] is True
        assert parsed["ring_mod"] is False
        assert parsed["mod_fx_on_off"] is True
        assert parsed["delay_on_off"] is True
        assert parsed["reverb_on_off"] is True
    
    def test_integer_serialization(self, sample_program_data):
        """Test that integer values are properly serialized"""
        generator = JsonReportGenerator()
        result = generator.generate_report(sample_program_data)
        parsed = json.loads(result)
        
        # Test integer fields
        assert parsed["vco1_pitch"] == 300
        assert parsed["filter_cutoff"] == 512
        assert parsed["amp_eg_attack"] == 100
        assert parsed["program_level"] == 72
    
    def test_json_is_pretty_formatted(self, minimal_program_data):
        """Test that generated JSON is pretty-formatted (indented)"""
        generator = JsonReportGenerator()
        result = generator.generate_report(minimal_program_data)
        
        # Should contain newlines and spaces for indentation
        assert '\n' in result
        assert '  ' in result  # 2-space indentation
        
        # Should be valid JSON
        parsed = json.loads(result)
        assert isinstance(parsed, dict)
    
    def test_serialize_program_data_method(self, sample_program_data):
        """Test the private _serialize_program_data method"""
        generator = JsonReportGenerator()
        result = generator._serialize_program_data(sample_program_data)
        
        # Should return a dictionary
        assert isinstance(result, dict)
        
        # Should contain all expected fields
        assert "program_name" in result
        assert "vco1_wave" in result
        assert "mod_fx_type" in result
        
        # Enums should be converted to values
        assert result["vco1_wave"] == VcoWave.SAW.value
        assert result["voice_mode_type"] == VoiceModeType.POLY.value
    
    def test_handles_none_values(self):
        """Test that None values are handled properly"""
        from src.services.program_data import ProgramData
        
        program = ProgramData()
        generator = JsonReportGenerator()
        result = generator.generate_report(program)
        
        # Should be valid JSON
        parsed = json.loads(result)
        
        # None values should be preserved
        assert parsed["header"] is None
        assert parsed["program_name"] is None
        assert parsed["program_end_marker"] is None
    
    def test_consistency_multiple_calls(self, sample_program_data):
        """Test that multiple calls with same data produce identical results"""
        generator = JsonReportGenerator()
        
        result1 = generator.generate_report(sample_program_data)
        result2 = generator.generate_report(sample_program_data)
        
        # Results should be identical
        assert result1 == result2
        
        # Both should parse to same data
        parsed1 = json.loads(result1)
        parsed2 = json.loads(result2)
        assert parsed1 == parsed2