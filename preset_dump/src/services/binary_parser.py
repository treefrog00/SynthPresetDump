"""Binary parser for Minilogue XD preset files"""

import struct
import zipfile
from typing import Union, BinaryIO, Optional
from io import BytesIO

from .program_data import ProgramData
from .enums import *


class ProgramParser:
    """Parser for Minilogue XD program binary data"""
    
    @staticmethod
    def parse_file(file_path: str, program_number: int = 0) -> ProgramData:
        """Parse a Minilogue XD file (either .mnlgxdprog or .mnlgxdlib)"""
        try:
            with zipfile.ZipFile(file_path, 'r') as zf:
                # For library files, use program_number to select which program
                prog_filename = f'Prog_{program_number:03d}.prog_bin'
                try:
                    file_content = zf.read(prog_filename)
                except KeyError:
                    # Single program file
                    files = zf.namelist()
                    if files:
                        file_content = zf.read(files[0])
                    else:
                        raise ValueError("No program files found in archive")
                
                return ProgramParser.parse_binary(file_content)
        except zipfile.BadZipFile:
            # Try reading as raw binary
            with open(file_path, 'rb') as f:
                return ProgramParser.parse_binary(f.read())
    
    @staticmethod
    def parse_binary(data: Union[bytes, BinaryIO]) -> ProgramData:
        """Parse binary program data"""
        if hasattr(data, 'read'):
            data = data.read()
        
        if len(data) < 160:
            raise ValueError("Data too short to be a valid Minilogue XD program")
        
        # Unpack using the file structure from mnlgxd.py
        try:
            result = struct.unpack('<4s12sBBBHBBBHHBBHHBBHBBBBHHHHHHHHBBHHBBHHHHHBBBBHHHHBBBBHBHBBBBBBBHHBBBBBBBHHBHBBBBBHHHHHBBBHHB4s', data[:160])
        except struct.error as e:
            raise ValueError(f"Failed to parse binary data: {e}")
        
        # Create ProgramData object from parsed values
        program = ProgramData()
        
        # Map parsed values to program data fields
        program.header = result[0].decode('ascii').rstrip('\x00')
        program.program_name = result[1].decode('ascii').rstrip('\x00')
        program.octave = result[2]
        program.portamento = result[3]
        program.key_trig = bool(result[4])
        program.voice_mode_depth = result[5]
        program.voice_mode_type = VoiceModeType(result[6])
        
        # VCO 1
        program.vco1_wave = VcoWave(result[7])
        program.vco1_octave = result[8]
        program.vco1_pitch = result[9]
        program.vco1_shape = result[10]
        
        # VCO 2
        program.vco2_wave = VcoWave(result[11])
        program.vco2_octave = result[12]
        program.vco2_pitch = result[13]
        program.vco2_shape = result[14]
        
        program.oscillator_sync = bool(result[15])
        program.ring_mod = bool(result[16])
        program.cross_mod_depth = result[17]
        
        # Multi Engine
        program.multi_osc_type = MultiOscType(result[18])
        program.selected_multi_osc_noise = MultiOscNoise(result[19])
        program.selected_multi_osc_vpm = MultiOscVPM(result[20])
        program.selected_multi_osc_user = result[21]
        program.shape_noise = result[22]
        program.shape_vpm = result[23]
        program.shape_user = result[24]
        program.shift_shape_noise = result[25]
        program.shift_shape_vpm = result[26]
        program.shift_shape_user = result[27]
        
        # Mixer
        program.vco1_level = result[28]
        program.vco2_level = result[29]
        program.multi_level = result[30]
        
        # Filter
        program.filter_cutoff = result[31]
        program.filter_resonance = result[32]
        program.filter_cutoff_drive = result[33]
        program.filter_cutoff_keyboard_track = result[34]
        
        # Amp EG
        program.amp_eg_attack = result[35]
        program.amp_eg_decay = result[36]
        program.amp_eg_sustain = result[37]
        program.amp_eg_release = result[38]
        
        # EG
        program.eg_attack = result[39]
        program.eg_decay = result[40]
        program.eg_int = result[41]
        program.eg_target = EGTarget(result[42])
        
        # LFO
        program.lfo_wave = VcoWave(result[43])
        program.lfo_mode = LFOMode(result[44])
        program.lfo_rate = result[45]
        program.lfo_int = result[46]
        program.lfo_target = LFOTarget(result[47])
        
        # Mod FX
        program.mod_fx_on_off = bool(result[48])
        program.mod_fx_type = ModFxType(result[49]) if result[49] > 0 else ModFxType.NONE
        program.mod_fx_chorus = ModFxChorus(result[50])
        program.mod_fx_ensemble = ModFxEnsemble(result[51])
        program.mod_fx_phaser = ModFxPhaser(result[52])
        program.mod_fx_flanger = ModFxFlanger(result[53])
        program.mod_fx_user = result[54]
        program.mod_fx_time = result[55]
        program.mod_fx_depth = result[56]
        
        # Delay FX
        program.delay_on_off = bool(result[57])
        program.delay_sub_type = DelaySubType(result[58])
        program.delay_time = result[59]
        program.delay_depth = result[60]
        
        # Reverb FX
        program.reverb_on_off = bool(result[61])
        program.reverb_sub_type = ReverbSubType(result[62])
        program.reverb_time = result[63]
        program.reverb_depth = result[64]
        
        # Bend & Joystick
        program.bend_range_plus = result[65]
        program.bend_range_minus = result[66]
        program.joystick_assign_plus = AssignTarget(result[67])
        program.joystick_range_plus = result[68]
        program.joystick_assign_minus = AssignTarget(result[69])
        program.joystick_range_minus = result[70]
        
        # CV In
        program.cv_in_mode = CVInMode(result[71])
        program.cv_in1_assign = AssignTarget(result[72])
        program.cv_in1_range = result[73]
        program.cv_in2_assign = AssignTarget(result[74])
        program.cv_in2_range = result[75]
        
        # Tuning & Advanced
        program.micro_tuning = MicroTuning(result[76])
        program.scale_key = result[77]
        program.program_tuning = result[78]
        program.lfo_key_sync = bool(result[79])
        program.lfo_voice_sync = bool(result[80])
        program.lfo_target_osc = LFOTargetOsc(result[81])
        program.cutoff_velocity = result[82]
        program.amp_velocity = result[83]
        program.multi_octave = result[84]
        program.multi_routing = MultiRouting(result[85])
        program.eg_legato = bool(result[86])
        program.portamento_mode = PortamentoMode(result[87])
        program.portamento_bpm_sync = bool(result[88])
        program.program_level = result[89]
        
        # VPM Parameters
        program.vpm_parameter1_feedback = result[90]
        program.vpm_parameter2_noise_depth = result[91]
        program.vpm_parameter3_shape_mod_int = result[92]
        program.vpm_parameter4_mod_attack = result[93]
        program.vpm_parameter5_mod_decay = result[94]
        program.vpm_parameter6_mod_key_track = result[95]
        
        # User Parameters
        program.user_param1 = result[96]
        program.user_param2 = result[97]
        program.user_param3 = result[98]
        program.user_param4 = result[99]
        program.user_param5 = result[100]
        program.user_param6 = result[101]
        
        # User param types are encoded in a packed format
        user_param_types = result[102]
        program.user_param1234_type = user_param_types
        
        # Extract individual parameter types (2 bits each)
        program.user_param1_type = UserParamType(user_param_types & 0x3)
        program.user_param2_type = UserParamType((user_param_types >> 2) & 0x3)
        program.user_param3_type = UserParamType((user_param_types >> 4) & 0x3)
        program.user_param4_type = UserParamType((user_param_types >> 6) & 0x3)
        
        if len(data) > 148:
            # User param 5 & 6 types are in a separate byte
            try:
                user_param56_type = struct.unpack('<B', data[148:149])[0]
                program.user_param56_type = user_param56_type
                program.user_param5_type = UserParamType(user_param56_type & 0x3)
                program.user_param6_type = UserParamType((user_param56_type >> 2) & 0x3)
            except:
                pass
        
        # Additional fields
        program.program_transpose = result[103]
        
        if len(data) >= 160:
            # Parse remaining fields if available
            try:
                remaining = struct.unpack('<HHB', data[151:156])
                program.delay_dry_wet = remaining[0]
                program.reverb_dry_wet = remaining[1] 
                program.midi_after_touch_assign = AssignTarget(remaining[2])
            except:
                pass
        
        # Program end marker
        program.program_end_marker = result[104].decode('ascii').rstrip('\x00')
        
        return program
    
    @staticmethod
    def parse_from_upload(file_content: bytes) -> ProgramData:
        """Parse program data from uploaded file content"""
        try:
            # Try as ZIP first
            with zipfile.ZipFile(BytesIO(file_content), 'r') as zf:
                files = zf.namelist()
                if files:
                    # Get first program file
                    prog_files = [f for f in files if f.endswith('.prog_bin')]
                    if prog_files:
                        binary_data = zf.read(prog_files[0])
                    else:
                        binary_data = zf.read(files[0])
                    return ProgramParser.parse_binary(binary_data)
        except zipfile.BadZipFile:
            # Try as raw binary
            return ProgramParser.parse_binary(file_content)


class DisplayHelper:
    """Helper functions for converting raw values to display strings (ported from C#)"""
    
    @staticmethod
    def pitch_cents(value: int) -> str:
        """Convert pitch value to cents display"""
        if 0 <= value <= 4:
            return '-1200C'
        elif 4 <= value <= 356:  # -1200 ~ -256 (Cent)
            return f"{(value - 356) * 944 / 352 - 256:.0f}C"
        elif 356 <= value <= 476:  # -256 ~ -16 (Cent)
            return f"{(value - 476) * 2 - 16:.0f}C"
        elif 476 <= value <= 492:  # -16 ~ 0 (Cent)
            return f"{value - 492}C"
        elif 492 <= value <= 532:  # 0 (Cent)
            return '0C'
        elif 532 <= value <= 548:  # 0 ~ 16 (Cent)
            return f"{value - 532}C"
        elif 548 <= value <= 668:  # 16 ~ 256 (Cent)
            return f"{(value - 548) * 2 + 16:.0f}C"
        elif 668 <= value <= 1020:  # 256 ~ 1200 (Cent)
            return f"{(value - 668) * 944 / 352 + 256:.0f}C"
        elif 1020 <= value <= 1023:  # 1200 (Cent)
            return '1200C'
        else:
            return f"{value}C"
    
    @staticmethod
    def eg_int_percent(value: int) -> float:
        """Convert EG INT value to percentage"""
        if 0 <= value <= 11:
            return -100.0
        elif 11 <= value <= 492:
            return -((492 - value) * (492 - value) * 4641 * 100) / 0x40000000
        elif 492 <= value <= 532:
            return 0.0
        elif 532 <= value <= 1013:
            return ((value - 532) * (value - 532) * 4641 * 100) / 0x40000000
        elif 1013 <= value <= 1023:
            return 100.0
        else:
            return 0.0
    
    @staticmethod
    def voice_mode_depth_label(vm_type: VoiceModeType, value: int) -> str:
        """Get voice mode depth label based on type and value"""
        if vm_type == VoiceModeType.ARP:
            arp_ranges = [
                (0, 78, "MANUAL 1"),
                (79, 156, "MANUAL 2"), 
                (157, 234, "RISE 1"),
                (235, 312, "RISE 2"),
                (313, 390, "FALL 1"),
                (391, 468, "FALL 2"),
                (469, 546, "RISE FALL 1"),
                (547, 624, "RISE FALL 2"),
                (625, 702, "POLY 1"),
                (703, 780, "POLY 2"),
                (781, 858, "RANDOM 1"),
                (859, 936, "RANDOM 2"),
                (937, 1023, "RANDOM 3")
            ]
            for min_val, max_val, label in arp_ranges:
                if min_val <= value <= max_val:
                    return label
                    
        elif vm_type == VoiceModeType.UNISON:
            return f"{value * 50 / 1023:.1f} Cent"
            
        elif vm_type == VoiceModeType.CHORD:
            chord_ranges = [
                (0, 73, "5th"),
                (74, 146, "sus2"),
                (147, 219, "m"),
                (220, 292, "Maj"),
                (293, 365, "sus4"),
                (366, 438, "m7"),
                (439, 511, "7"),
                (512, 585, "7sus4"),
                (586, 658, "Maj7"),
                (659, 731, "aug"),
                (732, 804, "dim"),
                (805, 877, "m7b5"),
                (878, 950, "mMaj7"),
                (951, 1023, "Maj7b5")
            ]
            for min_val, max_val, label in chord_ranges:
                if min_val <= value <= max_val:
                    return label
                    
        elif vm_type == VoiceModeType.POLY:
            return 'Poly' if value < 256 else f'Duo {value * 50 / 1023:.1f}'
        
        return str(value)
    
    @staticmethod
    def lfo_rate(value: int, mode: LFOMode) -> str:
        """Get LFO rate display string"""
        if mode == LFOMode.BPM:
            # BPM rate mappings
            bpm_ranges = [
                (0, 63, "4"),
                (64, 127, "2"), 
                (128, 191, "1"),
                (192, 255, "3/4"),
                (256, 319, "1/2"),
                (320, 383, "3/8"),
                (384, 447, "1/3"),
                (448, 511, "1/4"),
                (512, 575, "3/16"),
                (576, 639, "1/6"),
                (640, 703, "1/8"),
                (704, 767, "1/12"),
                (768, 831, "1/16"),
                (832, 895, "1/24"),
                (896, 959, "1/32"),
                (960, 1023, "1/36")
            ]
            for min_val, max_val, label in bpm_ranges:
                if min_val <= value <= max_val:
                    return label
        
        return str(value)
    
    @staticmethod
    def program_level_decibel(value: int) -> str:
        """Convert program level to decibel string"""
        db = (value - 12) / 5.0 - 18.0
        sign = "+" if db > 0 else ""
        return f"{sign}{db:.1f}dB"
    
    @staticmethod
    def minus_to_plus_100_string(value: int) -> str:
        """Convert 0-200 value to -100% to +100% string"""
        percent = value - 100
        sign = "+" if percent > 0 else ""
        return f"{sign}{percent}%"