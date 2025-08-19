"""Tests for ProgramParser and DisplayHelper"""

import pytest
import struct
import zipfile
from io import BytesIO

from src.services.binary_parser import ProgramParser, DisplayHelper
from src.services.program_data import ProgramData
from src.services.enums import *


class TestProgramParser:
    
    def test_parse_binary_basic(self, sample_binary_data):
        """Test basic binary parsing"""
        result = ProgramParser.parse_binary(sample_binary_data)
        
        assert isinstance(result, ProgramData)
        assert result.header == "PROG"
        assert result.program_name == "Test Program"
        assert result.program_end_marker == "PRED"
    
    def test_parse_binary_all_fields(self, sample_binary_data):
        """Test that all major fields are parsed correctly"""
        result = ProgramParser.parse_binary(sample_binary_data)
        
        # Basic fields
        assert result.octave == 2
        assert result.portamento == 64
        assert result.key_trig == True
        assert result.voice_mode_depth == 512
        assert result.voice_mode_type == VoiceModeType.POLY
        
        # VCO fields
        assert result.vco1_wave == VcoWave.SAW
        assert result.vco1_octave == 1
        assert result.vco1_pitch == 300
        assert result.vco1_shape == 200
        
        assert result.vco2_wave == VcoWave.TRI
        assert result.vco2_octave == 2
        assert result.vco2_pitch == 400
        assert result.vco2_shape == 600
        
        # Sync/Ring
        assert result.oscillator_sync == True
        assert result.ring_mod == False
        assert result.cross_mod_depth == 256
        
        # Multi Engine
        assert result.multi_osc_type == MultiOscType.VPM
        assert result.selected_multi_osc_user == 5
        
        # Mixer
        assert result.vco1_level == 800
        assert result.vco2_level == 700
        assert result.multi_level == 600
        
        # Filter
        assert result.filter_cutoff == 512
        assert result.filter_resonance == 256
        assert result.filter_cutoff_drive == 1
        assert result.filter_cutoff_keyboard_track == 2
        
        # Effects
        assert result.mod_fx_on_off == True
        assert result.mod_fx_type == ModFxType.CHORUS
        assert result.delay_on_off == True
        assert result.reverb_on_off == True
    
    def test_parse_from_upload_zip(self, sample_zip_file):
        """Test parsing from uploaded ZIP file"""
        result = ProgramParser.parse_from_upload(sample_zip_file)
        
        assert isinstance(result, ProgramData)
        assert result.header == "PROG"
        assert result.program_name == "Test Program"
    
    def test_parse_from_upload_raw_binary(self, sample_binary_data):
        """Test parsing from raw binary data"""
        result = ProgramParser.parse_from_upload(sample_binary_data)
        
        assert isinstance(result, ProgramData)
        assert result.header == "PROG"
        assert result.program_name == "Test Program"
    
    def test_parse_binary_too_short(self):
        """Test parsing with data that's too short"""
        short_data = b"PROG" + b"\x00" * 50
        
        with pytest.raises(ValueError, match="Data too short"):
            ProgramParser.parse_binary(short_data)
    
    def test_parse_binary_malformed(self):
        """Test parsing with malformed data"""
        malformed_data = b"INVALID" + b"\x00" * 160
        
        with pytest.raises(ValueError, match="Failed to parse binary data"):
            ProgramParser.parse_binary(malformed_data)
    
    def test_parse_file_nonexistent(self):
        """Test parsing nonexistent file"""
        with pytest.raises((FileNotFoundError, ValueError)):
            ProgramParser.parse_file("nonexistent.mnlgxdprog")
    
    def test_enum_conversion(self, sample_binary_data):
        """Test that raw values are correctly converted to enums"""
        result = ProgramParser.parse_binary(sample_binary_data)
        
        # Test various enum conversions
        assert isinstance(result.voice_mode_type, VoiceModeType)
        assert isinstance(result.vco1_wave, VcoWave)
        assert isinstance(result.multi_osc_type, MultiOscType)
        assert isinstance(result.mod_fx_type, ModFxType)
        assert isinstance(result.delay_sub_type, DelaySubType)
        assert isinstance(result.reverb_sub_type, ReverbSubType)
        assert isinstance(result.eg_target, EGTarget)
        assert isinstance(result.lfo_mode, LFOMode)
        assert isinstance(result.lfo_target, LFOTarget)
    
    def test_boolean_conversion(self, sample_binary_data):
        """Test that integer values are correctly converted to booleans"""
        result = ProgramParser.parse_binary(sample_binary_data)
        
        # Test boolean conversions
        assert isinstance(result.key_trig, bool)
        assert isinstance(result.oscillator_sync, bool)
        assert isinstance(result.ring_mod, bool)
        assert isinstance(result.mod_fx_on_off, bool)
        assert isinstance(result.delay_on_off, bool)
        assert isinstance(result.reverb_on_off, bool)
    
    def test_user_param_type_parsing(self):
        """Test that user parameter types are parsed correctly from packed format"""
        # Create test data with specific user param type values
        test_data = bytearray(160)
        struct.pack_into('<4s', test_data, 0, b'PROG')
        struct.pack_into('<4s', test_data, 156, b'PRED')
        
        # Set user param types (2 bits each in byte 102)
        # Type 0=0, Type 1=1, Type 2=2, Type 3=3 -> 0b11100100 = 228
        struct.pack_into('<B', test_data, 102, 0b11100100)
        
        result = ProgramParser.parse_binary(bytes(test_data))
        
        assert result.user_param1_type == UserParamType.PERCENT_TYPE  # 0
        assert result.user_param2_type == UserParamType.PERCENT_BIPOLAR  # 1
        assert result.user_param3_type == UserParamType.SELECT  # 2
        assert result.user_param4_type == UserParamType.COUNT  # 3


class TestDisplayHelper:
    
    def test_pitch_cents(self):
        """Test pitch cents conversion"""
        # Test edge cases
        assert DisplayHelper.pitch_cents(0) == '-1200C'
        assert DisplayHelper.pitch_cents(4) == '-1200C'
        assert DisplayHelper.pitch_cents(532) == '0C'
        assert DisplayHelper.pitch_cents(1023) == '1200C'
        
        # Test some middle values
        cents_500 = DisplayHelper.pitch_cents(500)
        assert 'C' in cents_500
        assert cents_500 != '0C'  # Should not be zero
    
    def test_eg_int_percent(self):
        """Test EG INT percentage conversion"""
        # Test edge cases
        assert DisplayHelper.eg_int_percent(0) == -100.0
        assert DisplayHelper.eg_int_percent(11) == -100.0
        assert DisplayHelper.eg_int_percent(532) == 0.0
        assert DisplayHelper.eg_int_percent(1023) == 100.0
        
        # Test middle range
        percent_600 = DisplayHelper.eg_int_percent(600)
        assert 0.0 < percent_600 <= 100.0
        
        percent_400 = DisplayHelper.eg_int_percent(400)
        assert -100.0 <= percent_400 < 0.0
    
    def test_voice_mode_depth_label_arp(self):
        """Test voice mode depth label for ARP mode"""
        # Test ARP ranges
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.ARP, 50) == "MANUAL 1"
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.ARP, 200) == "RISE 1"
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.ARP, 800) == "RANDOM 1"
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.ARP, 1000) == "RANDOM 3"
    
    def test_voice_mode_depth_label_chord(self):
        """Test voice mode depth label for CHORD mode"""
        # Test CHORD ranges
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.CHORD, 50) == "5th"
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.CHORD, 200) == "m"
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.CHORD, 300) == "Maj"
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.CHORD, 1000) == "Maj7b5"
    
    def test_voice_mode_depth_label_unison(self):
        """Test voice mode depth label for UNISON mode"""
        result = DisplayHelper.voice_mode_depth_label(VoiceModeType.UNISON, 512)
        assert "Cent" in result
        assert "25.0" in result  # 512 * 50 / 1023 ≈ 25
    
    def test_voice_mode_depth_label_poly(self):
        """Test voice mode depth label for POLY mode"""
        # Test POLY mode
        assert DisplayHelper.voice_mode_depth_label(VoiceModeType.POLY, 200) == "Poly"
        
        duo_result = DisplayHelper.voice_mode_depth_label(VoiceModeType.POLY, 500)
        assert "Duo" in duo_result
    
    def test_lfo_rate_normal_mode(self):
        """Test LFO rate for normal mode"""
        result = DisplayHelper.lfo_rate(512, LFOMode.NORMAL)
        assert result == "512"  # Should return raw value for non-BPM mode
    
    def test_lfo_rate_bpm_mode(self):
        """Test LFO rate for BPM mode"""
        # Test BPM mode ranges
        assert DisplayHelper.lfo_rate(50, LFOMode.BPM) == "4"
        assert DisplayHelper.lfo_rate(100, LFOMode.BPM) == "2"
        assert DisplayHelper.lfo_rate(150, LFOMode.BPM) == "1"
        assert DisplayHelper.lfo_rate(500, LFOMode.BPM) == "1/4"
        assert DisplayHelper.lfo_rate(800, LFOMode.BPM) == "1/16"
        assert DisplayHelper.lfo_rate(1000, LFOMode.BPM) == "1/36"
    
    def test_program_level_decibel(self):
        """Test program level to decibel conversion"""
        # Test formula: (value - 12) / 5.0 - 18.0
        
        # Test standard values
        assert DisplayHelper.program_level_decibel(72) == "+0.0dB"  # (72-12)/5-18 = 0
        assert DisplayHelper.program_level_decibel(12) == "-18.0dB"  # Minimum
        assert DisplayHelper.program_level_decibel(132) == "+6.0dB"  # Maximum
        
        # Test negative value
        db_50 = DisplayHelper.program_level_decibel(50)
        assert "dB" in db_50
        assert "-" in db_50  # Should be negative
    
    def test_minus_to_plus_100_string(self):
        """Test -100% to +100% string conversion"""
        # Test conversion: value - 100
        assert DisplayHelper.minus_to_plus_100_string(0) == "-100%"
        assert DisplayHelper.minus_to_plus_100_string(100) == "0%"
        assert DisplayHelper.minus_to_plus_100_string(150) == "+50%"
        assert DisplayHelper.minus_to_plus_100_string(200) == "+100%"
        
        # Test no sign for zero
        result_100 = DisplayHelper.minus_to_plus_100_string(100)
        assert result_100 == "0%"
        assert not result_100.startswith("+")


class TestBinaryParserEdgeCases:
    
    def test_zip_file_with_multiple_programs(self):
        """Test ZIP file containing multiple programs"""
        # Create a ZIP with multiple program files
        zip_buffer = BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w') as zf:
            # Create minimal binary data for two programs
            prog1_data = b'PROG' + b'Program1\x00\x00\x00\x00' + b'\x00' * 140 + b'PRED'
            prog2_data = b'PROG' + b'Program2\x00\x00\x00\x00' + b'\x00' * 140 + b'PRED'
            
            zf.writestr('Prog_000.prog_bin', prog1_data)
            zf.writestr('Prog_001.prog_bin', prog2_data)
        
        zip_buffer.seek(0)
        zip_data = zip_buffer.getvalue()
        
        # Should parse the first program by default
        result = ProgramParser.parse_from_upload(zip_data)
        assert result.program_name.startswith("Program1")
    
    def test_empty_zip_file(self):
        """Test empty ZIP file"""
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zf:
            pass  # Empty zip
        
        zip_buffer.seek(0)
        zip_data = zip_buffer.getvalue()
        
        with pytest.raises(ValueError, match="No program files found"):
            ProgramParser.parse_from_upload(zip_data)
    
    def test_binary_data_with_extra_bytes(self):
        """Test binary data longer than expected"""
        # Create data with extra bytes at the end
        base_data = b'PROG' + b'Test\x00\x00\x00\x00\x00\x00\x00\x00' + b'\x00' * 140 + b'PRED'
        extended_data = base_data + b'\x00' * 100  # Extra bytes
        
        # Should still parse successfully
        result = ProgramParser.parse_binary(extended_data)
        assert result.header == "PROG"
        assert result.program_name.startswith("Test")
    
    def test_bytesio_input(self):
        """Test parsing from BytesIO object"""
        data = b'PROG' + b'Test\x00\x00\x00\x00\x00\x00\x00\x00' + b'\x00' * 140 + b'PRED'
        bio = BytesIO(data)
        
        result = ProgramParser.parse_binary(bio)
        assert result.header == "PROG"
        assert result.program_name.startswith("Test")


class TestBinaryParserIntegration:
    
    def test_parse_and_serialize_roundtrip(self, sample_binary_data):
        """Test that parsing and then serializing maintains data integrity"""
        from src.services.json_generator import JsonReportGenerator
        import json
        
        # Parse binary data
        program = ProgramParser.parse_binary(sample_binary_data)
        
        # Serialize to JSON
        generator = JsonReportGenerator()
        json_output = generator.generate_report(program)
        
        # Parse JSON back
        json_data = json.loads(json_output)
        
        # Verify key fields match
        assert json_data["program_name"] == "Test Program"
        assert json_data["octave"] == 2
        assert json_data["vco1_pitch"] == 300
        assert json_data["filter_cutoff"] == 512
    
    def test_consistency_across_multiple_parses(self, sample_binary_data):
        """Test that parsing the same data multiple times gives consistent results"""
        result1 = ProgramParser.parse_binary(sample_binary_data)
        result2 = ProgramParser.parse_binary(sample_binary_data)
        
        # Key fields should be identical
        assert result1.program_name == result2.program_name
        assert result1.vco1_pitch == result2.vco1_pitch
        assert result1.filter_cutoff == result2.filter_cutoff
        assert result1.mod_fx_type == result2.mod_fx_type