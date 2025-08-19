"""Pytest configuration and fixtures for Minilogue XD tests"""

import pytest
import struct
import json
from io import BytesIO
import zipfile

from src.services.program_data import ProgramData
from src.services.enums import *


@pytest.fixture
def sample_program_data():
    """Create a sample ProgramData object for testing"""
    return ProgramData(
        header="PROG",
        program_name="Test Program",
        octave=2,
        portamento=64,
        key_trig=True,
        voice_mode_depth=512,
        voice_mode_type=VoiceModeType.POLY,
        
        # VCO 1
        vco1_wave=VcoWave.SAW,
        vco1_octave=1,
        vco1_pitch=300,
        vco1_shape=200,
        
        # VCO 2
        vco2_wave=VcoWave.TRI,
        vco2_octave=2,
        vco2_pitch=400,
        vco2_shape=600,
        
        oscillator_sync=True,
        ring_mod=False,
        cross_mod_depth=256,
        
        # Multi Engine
        multi_osc_type=MultiOscType.VPM,
        selected_multi_osc_noise=MultiOscNoise.HIGH,
        selected_multi_osc_vpm=MultiOscVPM.SIN1,
        selected_multi_osc_user=5,
        shape_noise=100,
        shape_vpm=200,
        shape_user=300,
        shift_shape_noise=150,
        shift_shape_vpm=250,
        shift_shape_user=350,
        
        # Mixer
        vco1_level=800,
        vco2_level=700,
        multi_level=600,
        
        # Filter
        filter_cutoff=512,
        filter_resonance=256,
        filter_cutoff_drive=1,
        filter_cutoff_keyboard_track=2,
        
        # Amp EG
        amp_eg_attack=100,
        amp_eg_decay=200,
        amp_eg_sustain=700,
        amp_eg_release=150,
        
        # EG
        eg_attack=120,
        eg_decay=180,
        eg_int=600,
        eg_target=EGTarget.CUTOFF,
        
        # LFO
        lfo_wave=VcoWave.TRI,
        lfo_mode=LFOMode.BPM,
        lfo_rate=400,
        lfo_int=300,
        lfo_target=LFOTarget.PITCH,
        
        # Mod FX
        mod_fx_on_off=True,
        mod_fx_type=ModFxType.CHORUS,
        mod_fx_chorus=ModFxChorus.STEREO,
        mod_fx_ensemble=ModFxEnsemble.LIGHT,
        mod_fx_phaser=ModFxPhaser.FAST,
        mod_fx_flanger=ModFxFlanger.MONO,
        mod_fx_user=3,
        mod_fx_time=400,
        mod_fx_depth=500,
        
        # Delay FX
        delay_on_off=True,
        delay_sub_type=DelaySubType.STEREO,
        delay_time=300,
        delay_depth=400,
        
        # Reverb FX
        reverb_on_off=True,
        reverb_sub_type=ReverbSubType.HALL,
        reverb_time=500,
        reverb_depth=300,
        
        # Program level
        program_level=72,
        
        # VPM Parameters
        vpm_parameter1_feedback=110,
        vpm_parameter2_noise_depth=90,
        vpm_parameter3_shape_mod_int=120,
        vpm_parameter4_mod_attack=80,
        vpm_parameter5_mod_decay=130,
        vpm_parameter6_mod_key_track=95,
        
        program_end_marker="PRED"
    )


@pytest.fixture
def sample_binary_data():
    """Create sample binary data for testing the parser"""
    # This creates a minimal valid Minilogue XD program binary
    data = struct.pack('<4s12sBBBHBBBHHBBHHBBHBBBBHHHHHHHHBBHHBBHHHHHBBBBHBHBBBBBBBHHBBBBBBBHHBHBBBBBHHHHHBBBHHB4s',
        b'PROG',           # Header
        b'Test Program\x00\x00',  # Program name (12 bytes)
        2,                 # Octave
        64,                # Portamento
        1,                 # Key Trig
        512,               # Voice Mode Depth
        4,                 # Voice Mode Type (POLY)
        2,                 # VCO1 Wave (SAW)
        1,                 # VCO1 Octave
        300,               # VCO1 Pitch
        200,               # VCO1 Shape
        1,                 # VCO2 Wave (TRI)
        2,                 # VCO2 Octave
        400,               # VCO2 Pitch
        600,               # VCO2 Shape
        1,                 # Sync
        0,                 # Ring
        256,               # Cross Mod Depth
        1,                 # Multi Type (VPM)
        0,                 # Multi Noise
        0,                 # Multi VPM
        5,                 # Multi User
        100,               # Shape Noise
        200,               # Shape VPM
        300,               # Shape User
        150,               # Shift Shape Noise
        250,               # Shift Shape VPM
        350,               # Shift Shape User
        800,               # VCO1 Level
        700,               # VCO2 Level
        600,               # Multi Level
        512,               # Filter Cutoff
        256,               # Filter Resonance
        1,                 # Filter Drive
        2,                 # Filter Key Track
        100,               # Amp EG Attack
        200,               # Amp EG Decay
        700,               # Amp EG Sustain
        150,               # Amp EG Release
        120,               # EG Attack
        180,               # EG Decay
        600,               # EG Int
        0,                 # EG Target
        1,                 # LFO Wave (TRI)
        2,                 # LFO Mode (BPM)
        400,               # LFO Rate
        300,               # LFO Int
        2,                 # LFO Target (PITCH)
        1,                 # Mod FX On/Off
        1,                 # Mod FX Type (CHORUS)
        0,                 # Mod FX Chorus
        1,                 # Mod FX Ensemble
        1,                 # Mod FX Phaser
        2,                 # Mod FX Flanger
        3,                 # Mod FX User
        400,               # Mod FX Time
        500,               # Mod FX Depth
        1,                 # Delay On/Off
        0,                 # Delay Sub Type
        300,               # Delay Time
        400,               # Delay Depth
        1,                 # Reverb On/Off
        0,                 # Reverb Sub Type
        500,               # Reverb Time
        300,               # Reverb Depth
        0,                 # Bend Range Plus
        0,                 # Bend Range Minus
        0,                 # Joystick Assign Plus
        100,               # Joystick Range Plus
        0,                 # Joystick Assign Minus
        100,               # Joystick Range Minus
        0,                 # CV In Mode
        0,                 # CV In1 Assign
        100,               # CV In1 Range
        0,                 # CV In2 Assign
        100,               # CV In2 Range
        0,                 # Micro Tuning
        12,                # Scale Key
        50,                # Program Tuning
        0,                 # LFO Key Sync
        0,                 # LFO Voice Sync
        0,                 # LFO Target Osc
        64,                # Cutoff Velocity
        64,                # Amp Velocity
        1,                 # Multi Octave
        0,                 # Multi Routing
        0,                 # EG Legato
        0,                 # Portamento Mode
        0,                 # Portamento BPM Sync
        72,                # Program Level
        110,               # VPM Param1
        90,                # VPM Param2
        120,               # VPM Param3
        80,                # VPM Param4
        130,               # VPM Param5
        95,                # VPM Param6
        50,                # User Param1
        60,                # User Param2
        70,                # User Param3
        80,                # User Param4
        90,                # User Param5
        100,               # User Param6
        0,                 # User Param Types
        13,                # Program Transpose
        b'PRED'            # End marker
    )
    return data


@pytest.fixture
def sample_zip_file():
    """Create a sample ZIP file containing binary data"""
    binary_data = sample_binary_data()
    
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zf:
        zf.writestr('Prog_000.prog_bin', binary_data)
    
    zip_buffer.seek(0)
    return zip_buffer.getvalue()


@pytest.fixture
def minimal_program_data():
    """Create minimal ProgramData for basic tests"""
    return ProgramData(
        header="PROG",
        program_name="Minimal",
        program_end_marker="PRED"
    )