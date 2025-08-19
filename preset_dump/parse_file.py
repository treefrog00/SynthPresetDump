"""Simple CLI script to parse Minilogue XD files - matches the original mnlgxd.py functionality"""

import sys
from src.services.binary_parser import ProgramParser, DisplayHelper
from src.services.enums import *


def print_program_info(program_data):
    """Print program information in a readable format"""
    print(f"PROGRAM NAME: {program_data.program_name}")
    print(f"OCTAVE: {program_data.octave - 2}")
    print(f"PORTAMENTO: {program_data.portamento}")
    print(f"KEY TRIG: {'On' if program_data.key_trig else 'Off'}")
    print(f"VOICE MODE DEPTH: {DisplayHelper.voice_mode_depth_label(program_data.voice_mode_type, program_data.voice_mode_depth)}")
    print(f"VOICE MODE TYPE: {program_data.voice_mode_type.name}")
    
    # VCOs
    print(f"VCO 1 WAVE: {program_data.vco1_wave.name}")
    print(f"VCO 1 OCTAVE: {['16\'', '8\'', '4\'', '2\''][program_data.vco1_octave]}")
    print(f"VCO 1 PITCH: {DisplayHelper.pitch_cents(program_data.vco1_pitch)}")
    print(f"VCO 1 SHAPE: {program_data.vco1_shape}")
    
    print(f"VCO 2 WAVE: {program_data.vco2_wave.name}")
    print(f"VCO 2 OCTAVE: {['16\'', '8\'', '4\'', '2\''][program_data.vco2_octave]}")
    print(f"VCO 2 PITCH: {DisplayHelper.pitch_cents(program_data.vco2_pitch)}")
    print(f"VCO 2 SHAPE: {program_data.vco2_shape}")
    
    print(f"SYNC: {'On' if program_data.oscillator_sync else 'Off'}")
    print(f"RING: {'On' if program_data.ring_mod else 'Off'}")
    print(f"CROSS MOD DEPTH: {program_data.cross_mod_depth}")
    
    # Multi Engine
    print(f"MULTI TYPE: {program_data.multi_osc_type.name}")
    if program_data.multi_osc_type == MultiOscType.NOISE:
        print(f"SELECT NOISE: {program_data.selected_multi_osc_noise.name}")
    elif program_data.multi_osc_type == MultiOscType.VPM:
        print(f"SELECT VPM: {program_data.selected_multi_osc_vpm.name}")
    elif program_data.multi_osc_type == MultiOscType.USER:
        print(f"SELECT USER: USER{program_data.selected_multi_osc_user + 1}")
    
    # Mixer
    print(f"VCO 1 LEVEL: {program_data.vco1_level}")
    print(f"VCO 2 LEVEL: {program_data.vco2_level}")
    print(f"MULTI LEVEL: {program_data.multi_level}")
    
    # Filter
    print(f"CUTOFF: {program_data.filter_cutoff}")
    print(f"RESONANCE: {program_data.filter_resonance}")
    print(f"CUTOFF DRIVE: {['0%', '50%', '100%'][program_data.filter_cutoff_drive]}")
    print(f"CUTOFF KEYBOARD TRACK: {['0%', '50%', '100%'][program_data.filter_cutoff_keyboard_track]}")
    
    # Envelopes
    print(f"AMP EG ATTACK: {program_data.amp_eg_attack}")
    print(f"AMP EG DECAY: {program_data.amp_eg_decay}")
    print(f"AMP EG SUSTAIN: {program_data.amp_eg_sustain}")
    print(f"AMP EG RELEASE: {program_data.amp_eg_release}")
    
    print(f"EG ATTACK: {program_data.eg_attack}")
    print(f"EG DECAY: {program_data.eg_decay}")
    print(f"EG INT: {DisplayHelper.eg_int_percent(program_data.eg_int):.1f}%")
    print(f"EG TARGET: {program_data.eg_target.name}")
    
    # LFO
    print(f"LFO WAVE: {program_data.lfo_wave.name}")
    print(f"LFO MODE: {program_data.lfo_mode.name}")
    print(f"LFO RATE: {DisplayHelper.lfo_rate(program_data.lfo_rate, program_data.lfo_mode)}")
    print(f"LFO INT: {program_data.lfo_int}")
    print(f"LFO TARGET: {program_data.lfo_target.name}")
    
    # Effects
    print(f"MOD FX ON OFF: {'On' if program_data.mod_fx_on_off else 'Off'}")
    print(f"MOD FX TYPE: {program_data.mod_fx_type.name}")
    print(f"MOD FX TIME: {program_data.mod_fx_time}")
    print(f"MOD FX DEPTH: {program_data.mod_fx_depth}")
    
    print(f"DELAY FX ON OFF: {'On' if program_data.delay_on_off else 'Off'}")
    print(f"DELAY SUB TYPE: {program_data.delay_sub_type.name}")
    print(f"DELAY TIME: {program_data.delay_time}")
    print(f"DELAY DEPTH: {program_data.delay_depth}")
    
    print(f"REVERB FX ON OFF: {'On' if program_data.reverb_on_off else 'Off'}")
    print(f"REVERB SUB TYPE: {program_data.reverb_sub_type.name}")
    print(f"REVERB TIME: {program_data.reverb_time}")
    print(f"REVERB DEPTH: {program_data.reverb_depth}")
    
    # Program level
    print(f"PROGRAM LEVEL: {DisplayHelper.program_level_decibel(program_data.program_level)}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python parse_file.py <filename> [program_number]")
        print("Example: python parse_file.py test.mnlgxdprog")
        print("Example: python parse_file.py test.mnlgxdlib 1")
        sys.exit(1)
    
    filename = sys.argv[1]
    program_number = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    
    try:
        program_data = ProgramParser.parse_file(filename, program_number)
        print_program_info(program_data)
    except Exception as e:
        print(f"Error parsing file: {e}")
        sys.exit(2)


if __name__ == "__main__":
    main()