"""Program data structure for Minilogue XD"""

from dataclasses import dataclass
from typing import Optional
from .enums import *


@dataclass
class ProgramData:
    """
    Adapted from the Minilogue XD MIDI Implementation Guide: 
    https://www.korg.com/us/support/download/manual/0/811/4440/
    Revision 1.01 (2020.2.10)
    """
    
    # Must be "PROG"
    header: Optional[str] = None
    
    # Up to 12 ASCII Characters for the Program Name
    program_name: Optional[str] = None
    
    # Octave: -2 to +2 (stored as 0-4)
    octave: int = 0
    
    portamento: int = 0
    
    # Key Trig On or Off (added in Firmware 2.0)
    key_trig: bool = False
    
    voice_mode_depth: int = 0
    voice_mode_type: VoiceModeType = VoiceModeType.NONE
    
    # VCO 1
    vco1_wave: VcoWave = VcoWave.SQR
    vco1_octave: int = 0  # 0~3=16',8',4',2'
    vco1_pitch: int = 0
    vco1_shape: int = 0
    
    # VCO 2
    vco2_wave: VcoWave = VcoWave.SQR
    vco2_octave: int = 0  # 0~3=16',8',4',2'
    vco2_pitch: int = 0
    vco2_shape: int = 0
    
    oscillator_sync: bool = False
    ring_mod: bool = False
    cross_mod_depth: int = 0
    
    # Multi Engine
    multi_osc_type: MultiOscType = MultiOscType.NOISE
    selected_multi_osc_noise: MultiOscNoise = MultiOscNoise.HIGH
    selected_multi_osc_vpm: MultiOscVPM = MultiOscVPM.SIN1
    selected_multi_osc_user: int = 0  # 0-15
    
    shape_noise: int = 0
    shape_vpm: int = 0
    shape_user: int = 0
    shift_shape_noise: int = 0
    shift_shape_vpm: int = 0
    shift_shape_user: int = 0
    
    # Mixer
    vco1_level: int = 0
    vco2_level: int = 0
    multi_level: int = 0
    
    # Filter
    filter_cutoff: int = 0
    filter_resonance: int = 0
    filter_cutoff_drive: int = 0  # 0-2
    filter_cutoff_keyboard_track: int = 0  # 0-2
    
    # Amp EG
    amp_eg_attack: int = 0
    amp_eg_decay: int = 0
    amp_eg_sustain: int = 0
    amp_eg_release: int = 0
    
    # EG
    eg_attack: int = 0
    eg_decay: int = 0
    eg_int: int = 0
    eg_target: EGTarget = EGTarget.CUTOFF
    
    # LFO
    lfo_wave: VcoWave = VcoWave.SQR
    lfo_mode: LFOMode = LFOMode.NORMAL
    lfo_rate: int = 0
    lfo_int: int = 0
    lfo_target: LFOTarget = LFOTarget.CUTOFF
    
    # Mod FX
    mod_fx_on_off: bool = False
    mod_fx_type: ModFxType = ModFxType.NONE
    mod_fx_chorus: ModFxChorus = ModFxChorus.STEREO
    mod_fx_ensemble: ModFxEnsemble = ModFxEnsemble.STEREO
    mod_fx_phaser: ModFxPhaser = ModFxPhaser.STEREO
    mod_fx_flanger: ModFxFlanger = ModFxFlanger.STEREO
    mod_fx_user: int = 0  # 0-15
    mod_fx_time: int = 0
    mod_fx_depth: int = 0
    
    # Delay FX
    delay_on_off: bool = False
    delay_sub_type: DelaySubType = DelaySubType.STEREO
    delay_time: int = 0
    delay_depth: int = 0
    
    # Reverb FX
    reverb_on_off: bool = False
    reverb_sub_type: ReverbSubType = ReverbSubType.HALL
    reverb_time: int = 0
    reverb_depth: int = 0
    
    # Bend & Joystick
    bend_range_plus: int = 0  # OFF~+12Note
    bend_range_minus: int = 0  # OFF~-12Note
    joystick_assign_plus: AssignTarget = AssignTarget.GATE_TIME
    joystick_range_plus: int = 0  # 0~200=-100%~+100%
    joystick_assign_minus: AssignTarget = AssignTarget.GATE_TIME
    joystick_range_minus: int = 0  # 0~200=-100%~+100%
    
    # CV In
    cv_in_mode: CVInMode = CVInMode.MODULATION
    cv_in1_assign: AssignTarget = AssignTarget.GATE_TIME
    cv_in1_range: int = 0  # 0~200=-100%~+100%
    cv_in2_assign: AssignTarget = AssignTarget.GATE_TIME
    cv_in2_range: int = 0  # 0~200=-100%~+100%
    
    # Tuning
    micro_tuning: MicroTuning = MicroTuning.EQUAL_TEMP
    scale_key: int = 0  # 0~24=-12Note~+12Note
    program_tuning: int = 0  # 0~100=-50Cent~+50Cent
    
    # LFO Advanced
    lfo_key_sync: bool = False
    lfo_voice_sync: bool = False
    lfo_target_osc: LFOTargetOsc = LFOTargetOsc.ALL
    
    # Modulation
    cutoff_velocity: int = 0
    amp_velocity: int = 0
    
    # Multi Engine Advanced
    multi_octave: int = 0  # 0~3=16',8',4',2'
    multi_routing: MultiRouting = MultiRouting.PRE_VCF
    
    # EG Advanced
    eg_legato: bool = False
    
    # Portamento Advanced
    portamento_mode: PortamentoMode = PortamentoMode.AUTO
    portamento_bpm_sync: bool = False
    
    # Program Level
    program_level: int = 72  # 12~132=-18dB~+6dB
    
    # VPM Parameters (0~200=-100%~+100%)
    vpm_parameter1_feedback: int = 100
    vpm_parameter2_noise_depth: int = 100
    vpm_parameter3_shape_mod_int: int = 100
    vpm_parameter4_mod_attack: int = 100
    vpm_parameter5_mod_decay: int = 100
    vpm_parameter6_mod_key_track: int = 100
    
    # User Parameters
    user_param1: int = 0
    user_param2: int = 0
    user_param3: int = 0
    user_param4: int = 0
    user_param5: int = 0
    user_param6: int = 0
    user_param56_type: int = 0
    user_param1234_type: int = 0
    
    user_param1_type: UserParamType = UserParamType.PERCENT_TYPE
    user_param2_type: UserParamType = UserParamType.PERCENT_TYPE
    user_param3_type: UserParamType = UserParamType.PERCENT_TYPE
    user_param4_type: UserParamType = UserParamType.PERCENT_TYPE
    user_param5_type: UserParamType = UserParamType.PERCENT_TYPE
    user_param6_type: UserParamType = UserParamType.PERCENT_TYPE
    
    # Program Transpose
    program_transpose: int = 13  # -12~+12 Note (stored as 1-25)
    
    # Dry/Wet
    delay_dry_wet: int = 0
    reverb_dry_wet: int = 0
    
    # MIDI After Touch
    midi_after_touch_assign: AssignTarget = AssignTarget.GATE_TIME
    
    # Must be "PRED"
    program_end_marker: Optional[str] = None