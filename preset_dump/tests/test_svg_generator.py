"""Tests for SVGGenerator"""

import pytest
import xml.etree.ElementTree as ET
from src.services.svg_generator import SVGGenerator
from src.services.enums import *


class TestSVGGenerator:
    
    def test_preferred_file_extension(self):
        """Test that the generator returns correct file extension"""
        generator = SVGGenerator()
        assert generator.preferred_file_extension == ".svg"
    
    def test_generate_report_returns_string(self, minimal_program_data):
        """Test that generate_report returns a string"""
        generator = SVGGenerator()
        result = generator.generate_report(minimal_program_data)
        
        assert isinstance(result, str)
        assert len(result) > 100  # Should be substantial SVG content
    
    def test_generate_report_is_valid_xml(self, sample_program_data):
        """Test that generated SVG is valid XML"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Should be parseable as XML
        try:
            root = ET.fromstring(result)
            assert root.tag.endswith('svg')
        except ET.ParseError:
            pytest.fail("Generated SVG is not valid XML")
    
    def test_svg_structure(self, sample_program_data):
        """Test that SVG has expected structure"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        root = ET.fromstring(result)
        
        # Check SVG attributes
        assert 'xmlns' in root.attrib
        assert root.attrib['xmlns'] == SVGGenerator.SVG_NAMESPACE
        assert 'viewBox' in root.attrib
        assert 'width' in root.attrib
        
        # Should have background rect
        rects = root.findall('.//{http://www.w3.org/2000/svg}rect')
        assert len(rects) >= 1  # At least the background rect
        
        # Should have text elements
        texts = root.findall('.//{http://www.w3.org/2000/svg}text')
        assert len(texts) >= 3  # Title, logo, and section headers
    
    def test_program_name_in_svg(self, sample_program_data):
        """Test that program name appears in SVG"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Program name should appear in the SVG
        assert "Test Program" in result
        assert "Program:" in result
    
    def test_knob_elements(self, sample_program_data):
        """Test that knob elements are created"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        root = ET.fromstring(result)
        
        # Should have circles for knobs
        circles = root.findall('.//{http://www.w3.org/2000/svg}circle')
        assert len(circles) >= 10  # Should have multiple knobs
        
        # Should have lines for knob indicators
        lines = root.findall('.//{http://www.w3.org/2000/svg}line')
        assert len(lines) >= 5  # Should have knob indicators
    
    def test_switch_elements(self, sample_program_data):
        """Test that switch elements are created"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        root = ET.fromstring(result)
        
        # Should have circles for switches/LEDs
        circles = root.findall('.//{http://www.w3.org/2000/svg}circle')
        
        # Check for active switch color
        active_switches = [c for c in circles if c.attrib.get('fill') == SVGGenerator.SWITCH_ACTIVE_COLOR]
        assert len(active_switches) > 0  # Should have some active switches
    
    def test_section_headers(self, sample_program_data):
        """Test that section headers are present"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Should contain section headers
        expected_sections = ["MIXER", "FILTER", "AMP EG", "EG", "LFO", "EFFECTS"]
        for section in expected_sections:
            assert section in result
    
    def test_create_knob_method(self):
        """Test the _create_knob method"""
        generator = SVGGenerator()
        root = ET.Element("svg")
        
        # Create a knob
        knob = generator._create_knob(root, "TEST KNOB\n50%", 100, 100, 50.0)
        
        # Should return a group element
        assert knob.tag.endswith('g')
        
        # Should have child elements (circle and text)
        children = list(knob)
        assert len(children) >= 2
        
        # Should have a circle
        circles = [child for child in children if child.tag.endswith('circle')]
        assert len(circles) == 1
        
        # Should have text
        texts = [child for child in children if child.tag.endswith('text')]
        assert len(texts) >= 1
    
    def test_create_switch_method(self):
        """Test the _create_switch method"""
        generator = SVGGenerator()
        root = ET.Element("svg")
        
        # Create a switch
        switch = generator._create_switch(root, "MODE", 100, 100, 1, ["Off", "On", "Auto"])
        
        # Should return a group element
        assert switch.tag.endswith('g')
        
        # Should have child elements
        children = list(switch)
        assert len(children) >= 3  # Circles + text
    
    def test_percent_from_value(self):
        """Test the _percent_from_value method"""
        generator = SVGGenerator()
        
        # Test normal range
        assert generator._percent_from_value(0, 0, 100) == 0.0
        assert generator._percent_from_value(50, 0, 100) == 50.0
        assert generator._percent_from_value(100, 0, 100) == 100.0
        
        # Test different ranges
        assert generator._percent_from_value(512, 0, 1023) == pytest.approx(50.0, rel=0.1)
        assert generator._percent_from_value(0, 0, 1023) == 0.0
        assert generator._percent_from_value(1023, 0, 1023) == 100.0
        
        # Test edge case
        assert generator._percent_from_value(50, 50, 50) == 0.0  # Same min/max
    
    def test_percent_to_degree(self):
        """Test the _percent_to_degree method"""
        generator = SVGGenerator()
        
        # Test normal ranges
        degree_0 = generator._percent_to_degree(0)
        degree_50 = generator._percent_to_degree(50)
        degree_100 = generator._percent_to_degree(100)
        
        assert degree_0 == 35.0  # Min angle
        assert degree_100 == 325.0  # Max angle
        assert degree_0 < degree_50 < degree_100
        
        # Test clamping
        assert generator._percent_to_degree(-10) == 35.0
        assert generator._percent_to_degree(110) == 325.0
    
    def test_voice_mode_section(self, sample_program_data):
        """Test that voice mode section is created properly"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Should contain octave display
        assert "OCTAVE" in result
        
        # Should contain portamento
        assert "PORTAMENTO" in result
        
        # Should contain voice mode depth
        assert "VOICE MODE" in result
        assert "DEPTH" in result
    
    def test_oscillator_section(self, sample_program_data):
        """Test that oscillator section is created properly"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Should contain VCO sections
        assert "VCO 1" in result
        assert "VCO 2" in result
        
        # Should contain controls
        assert "PITCH" in result
        assert "SHAPE" in result
        assert "WAVE" in result
        assert "OCTAVE" in result
        
        # Should contain sync and ring
        assert "SYNC" in result
        assert "RING" in result
        
        # Should contain cross mod
        assert "CROSS MOD" in result
    
    def test_effects_section(self, sample_program_data):
        """Test that effects section is created properly"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Should contain effects
        assert "MOD FX" in result
        assert "REVERB FX" in result
        assert "DELAY FX" in result
        
        # Should show on/off status
        assert "(On)" in result  # Effects are on in sample data
        
        # Should contain effect types
        assert "CHORUS" in result  # From sample data
        assert "HALL" in result    # From sample data
        assert "STEREO" in result  # From sample data
    
    def test_envelope_and_lfo_sections(self, sample_program_data):
        """Test that envelope and LFO sections are created"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Should contain envelope sections
        assert "AMP EG" in result
        assert "ATTACK" in result
        assert "DECAY" in result
        assert "SUSTAIN" in result
        assert "RELEASE" in result
        
        # Should contain LFO section
        assert "LFO" in result
        assert "RATE" in result
        assert "INT" in result
        assert "TARGET" in result
    
    def test_prettify_xml_method(self):
        """Test the _prettify_xml method"""
        generator = SVGGenerator()
        
        # Create simple XML element
        root = ET.Element("test")
        child = ET.SubElement(root, "child")
        child.text = "content"
        
        # Prettify it
        result = generator._prettify_xml(root)
        
        # Should be a string
        assert isinstance(result, str)
        
        # Should contain the elements
        assert "<test>" in result
        assert "<child>" in result
        assert "content" in result
        
        # Should have proper formatting (no extra blank lines)
        lines = result.split('\n')
        assert all(line.strip() for line in lines)  # No empty lines
    
    def test_handle_missing_program_name(self):
        """Test handling when program name is None or empty"""
        from src.services.program_data import ProgramData
        
        generator = SVGGenerator()
        
        # Test with None program name
        program = ProgramData(program_name=None)
        result = generator.generate_report(program)
        assert "Program: None" in result
        
        # Test with empty program name
        program = ProgramData(program_name="")
        result = generator.generate_report(program)
        assert "Program:" in result
    
    def test_constants_are_defined(self):
        """Test that all required constants are defined"""
        generator = SVGGenerator()
        
        # Check that constants exist and have expected types
        assert isinstance(generator.SVG_NAMESPACE, str)
        assert isinstance(generator.PADDING, int)
        assert isinstance(generator.STROKE_WIDTH, int)
        assert isinstance(generator.BACKGROUND_COLOR, str)
        assert isinstance(generator.STROKE_COLOR, str)
        assert isinstance(generator.SWITCH_ACTIVE_COLOR, str)
        assert isinstance(generator.KNOB_DIAMETER, int)
        assert isinstance(generator.SYNTH_WIDTH, int)
        assert isinstance(generator.SYNTH_HEIGHT, int)
    
    def test_generated_svg_size(self, sample_program_data):
        """Test that generated SVG has reasonable size"""
        generator = SVGGenerator()
        result = generator.generate_report(sample_program_data)
        
        # Should be substantial but not excessive
        assert 10000 < len(result) < 500000  # Between 10KB and 500KB
        
        # Should contain multiple sections
        section_count = result.count('<g')
        assert section_count > 10  # Should have many groups