"""Enums for Minilogue XD program data"""

from enum import Enum, IntEnum


class VoiceModeType(IntEnum):
    """*note P3 (VOICE MODE TYPE)"""
    NONE = 0
    ARP = 1
    CHORD = 2
    UNISON = 3
    POLY = 4


class VcoWave(IntEnum):
    """*note P4 (VCO1 WAVE, VCO2 WAVE, LFO WAVE)"""
    SQR = 0
    TRI = 1
    SAW = 2


class MultiOscType(IntEnum):
    NOISE = 0
    VPM = 1
    USER = 2


class MultiOscNoise(IntEnum):
    """*note P6 (SELECT NOISE)"""
    HIGH = 0
    LOW = 1
    PEAK = 2
    DECIM = 3


class MultiOscVPM(IntEnum):
    """*note P7 (SELECT VPM)"""
    SIN1 = 0
    SIN2 = 1
    SIN3 = 2
    SIN4 = 3
    SAW1 = 4
    SAW2 = 5
    SQU1 = 6
    SQU2 = 7
    FAT1 = 8
    FAT2 = 9
    AIR1 = 10
    AIR2 = 11
    DECAY1 = 12
    DECAY2 = 13
    CREEP = 14
    THROAT = 15


class EGTarget(IntEnum):
    CUTOFF = 0
    PITCH2 = 1
    PITCH = 2


class ModFxType(IntEnum):
    """*note P12 (MOD FX TYPE)"""
    NONE = 0
    CHORUS = 1
    ENSEMBLE = 2
    PHASER = 3
    FLANGER = 4
    USER = 5


class ModFxChorus(IntEnum):
    """*note P13 (MOD FX CHORUS)"""
    STEREO = 0
    LIGHT = 1
    DEEP = 2
    TRIPHASE = 3
    HARMONIC = 4
    MONO = 5
    FEEDBACK = 6
    VIBRATO = 7


class ModFxEnsemble(IntEnum):
    """*note P14 (MOD FX ENSEMBLE)"""
    STEREO = 0
    LIGHT = 1
    MONO = 2


class ModFxPhaser(IntEnum):
    """*note P15 (MOD FX PHASER)"""
    STEREO = 0
    FAST = 1
    ORANGE = 2
    SMALL = 3
    SMALL_RESO = 4
    BLACK = 5
    FORMANT = 6
    TWINKLE = 7


class ModFxFlanger(IntEnum):
    """*note P16 (MOD FX FLANGER)"""
    STEREO = 0
    LIGHT = 1
    MONO = 2
    HIGH_SWEEP = 3
    MID_SWEEP = 4
    PAN_SWEEP = 5
    MONO_SWEEP = 6
    TRIPHASE = 7


class DelaySubType(IntEnum):
    """*note P17 (DELAY SUB TYPE)"""
    STEREO = 0
    MONO = 1
    PING_PONG = 2
    HIPASS = 3
    TAPE = 4
    ONE_TAP = 5
    STEREO_BPM = 6
    MONO_BPM = 7
    PING_BPM = 8
    HIPASS_BPM = 9
    TAPE_BPM = 10
    DOUBLING = 11
    USER1 = 12
    USER2 = 13
    USER3 = 14
    USER4 = 15
    USER5 = 16
    USER6 = 17
    USER7 = 18
    USER8 = 19


class ReverbSubType(IntEnum):
    """*note P18 (REVERB SUB TYPE)"""
    HALL = 0
    SMOOTH = 1
    ARENA = 2
    PLATE = 3
    ROOM = 4
    EARLY_REF = 5
    SPACE = 6
    RISER = 7
    SUBMARINE = 8
    HORROR = 9
    USER1 = 10
    USER2 = 11
    USER3 = 12
    USER4 = 13
    USER5 = 14
    USER6 = 15
    USER7 = 16
    USER8 = 17


class AssignTarget(IntEnum):
    """*note P19 (JOYSTICK ASSIGN, CN IN ASSIGN, MIDI AFTER TOUCH ASSIGN)"""
    GATE_TIME = 0
    PORTAMENTO = 1
    VM_DEPTH = 2
    VCO1_PITCH = 3
    VCO1_SHAPE = 4
    VCO2_PITCH = 5
    VCO2_SHAPE = 6
    CROSS_MOD = 7
    MULTI_SHAPE = 8
    VCO1_LEVEL = 9
    VCO2_LEVEL = 10
    MULTI_LEVEL = 11
    FILTER_CUTOFF = 12
    FILTER_RESONANCE = 13
    AMP_EG_ATTACK = 14
    AMP_EG_DECAY = 15
    AMP_EG_SUSTAIN = 16
    AMP_EG_RELEASE = 17
    EG_ATTACK = 18
    EG_DECAY = 19
    EG_INT = 20
    LFO_RATE = 21
    LFO_INT = 22
    MOD_FX_SPEED = 23
    MOD_FX_DEPTH = 24
    REVERB_TIME = 25
    REVERB_DEPTH = 26
    DELAY_TIME = 27
    DELAY_DEPTH = 28


class CVInMode(IntEnum):
    """*note P20 (CV IN MODE)"""
    MODULATION = 0
    CV_GATE_PLUS = 1  # CV/Gate(+)
    CV_GATE_MINUS = 2  # CV/Gate(-)


class MicroTuning(IntEnum):
    """*note P21 (MICRO TUNING)"""
    EQUAL_TEMP = 0
    PURE_MAJOR = 1
    PURE_MINOR = 2
    PYTHAGOREAN = 3
    WERCKMEISTER = 4
    KIRNBURGER = 5
    SLENDRO = 6
    PELOG = 7
    IONIAN = 8
    DORIAN = 9
    AEOLIAN = 10
    MAJOR_PENTA = 11
    MINOR_PENTA = 12
    REVERSE = 13
    AFX001 = 14
    AFX002 = 15
    AFX003 = 16
    AFX004 = 17
    AFX005 = 18
    AFX006 = 19
    DC001 = 20
    DC002 = 21
    DC003 = 22
    USER_SCALE1 = 128
    USER_SCALE2 = 129
    USER_SCALE3 = 130
    USER_SCALE4 = 131
    USER_SCALE5 = 132
    USER_SCALE6 = 133
    USER_OCTAVE1 = 134
    USER_OCTAVE2 = 135
    USER_OCTAVE3 = 136
    USER_OCTAVE4 = 137
    USER_OCTAVE5 = 138
    USER_OCTAVE6 = 139


class LFOTargetOsc(IntEnum):
    """*note P22 (LFO TARGET OSC)"""
    ALL = 0
    VCO1_AND_2 = 1
    VCO2 = 2
    MULTI = 3


class LFOMode(IntEnum):
    ONE_SHOT = 0
    NORMAL = 1
    BPM = 2


class LFOTarget(IntEnum):
    CUTOFF = 0
    SHAPE = 1
    PITCH = 2


class MultiRouting(IntEnum):
    PRE_VCF = 0
    POST_VCF = 1


class PortamentoMode(IntEnum):
    AUTO = 0
    ON = 1


class UserParamType(IntEnum):
    """*note P24 (USER PARAM1~6)"""
    PERCENT_TYPE = 0  # (USER PARAMETER : 0~101 :    0 ~ 100%)
    PERCENT_BIPOLAR = 1  # (USER PARAMETER : 0~200 : -100 ~ 100)
    SELECT = 2  # (USER PARAMETER : 0~100 :    1 ~ 101)
    COUNT = 3