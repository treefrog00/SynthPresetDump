export enum VoiceModeType {
  NONE = 0,
  ARP = 1,
  CHORD = 2,
  UNISON = 3,
  POLY = 4
}

export enum VcoWave {
  SQR = 0,
  TRI = 1,
  SAW = 2
}

export enum MultiOscType {
  NOISE = 0,
  VPM = 1,
  USER = 2
}

export enum MultiOscNoise {
  HIGH = 0,
  LOW = 1,
  PEAK = 2,
  DECIM = 3
}

export enum MultiOscVPM {
  SIN1 = 0,
  SIN2 = 1,
  SIN3 = 2,
  SIN4 = 3,
  SAW1 = 4,
  SAW2 = 5,
  SQU1 = 6,
  SQU2 = 7,
  FAT1 = 8,
  FAT2 = 9,
  AIR1 = 10,
  AIR2 = 11,
  DECAY1 = 12,
  DECAY2 = 13,
  CREEP = 14,
  THROAT = 15
}

export enum EGTarget {
  CUTOFF = 0,
  PITCH2 = 1,
  PITCH = 2
}

export enum ModFxType {
  NONE = 0,
  CHORUS = 1,
  ENSEMBLE = 2,
  PHASER = 3,
  FLANGER = 4,
  USER = 5
}

export enum ModFxChorus {
  STEREO = 0,
  LIGHT = 1,
  DEEP = 2,
  TRIPHASE = 3,
  HARMONIC = 4,
  MONO = 5,
  FEEDBACK = 6,
  VIBRATO = 7
}

export enum ModFxEnsemble {
  STEREO = 0,
  LIGHT = 1,
  MONO = 2
}

export enum ModFxPhaser {
  STEREO = 0,
  FAST = 1,
  ORANGE = 2,
  SMALL = 3,
  SMALL_RESO = 4,
  BLACK = 5,
  FORMANT = 6,
  TWINKLE = 7
}

export enum ModFxFlanger {
  STEREO = 0,
  LIGHT = 1,
  MONO = 2,
  HIGH_SWEEP = 3,
  MID_SWEEP = 4,
  PAN_SWEEP = 5,
  MONO_SWEEP = 6,
  TRIPHASE = 7
}

export enum DelaySubType {
  STEREO = 0,
  MONO = 1,
  PING_PONG = 2,
  HIPASS = 3,
  TAPE = 4,
  ONE_TAP = 5,
  STEREO_BPM = 6,
  MONO_BPM = 7,
  PING_BPM = 8,
  HIPASS_BPM = 9,
  TAPE_BPM = 10,
  DOUBLING = 11,
  USER1 = 12,
  USER2 = 13,
  USER3 = 14,
  USER4 = 15,
  USER5 = 16,
  USER6 = 17,
  USER7 = 18,
  USER8 = 19
}

export enum ReverbSubType {
  HALL = 0,
  SMOOTH = 1,
  ARENA = 2,
  PLATE = 3,
  ROOM = 4,
  EARLY_REF = 5,
  SPACE = 6,
  RISER = 7,
  SUBMARINE = 8,
  HORROR = 9,
  USER1 = 10,
  USER2 = 11,
  USER3 = 12,
  USER4 = 13,
  USER5 = 14,
  USER6 = 15,
  USER7 = 16,
  USER8 = 17
}

export enum AssignTarget {
  GATE_TIME = 0,
  PORTAMENTO = 1,
  VM_DEPTH = 2,
  VCO1_PITCH = 3,
  VCO1_SHAPE = 4,
  VCO2_PITCH = 5,
  VCO2_SHAPE = 6,
  CROSS_MOD = 7,
  MULTI_SHAPE = 8,
  VCO1_LEVEL = 9,
  VCO2_LEVEL = 10,
  MULTI_LEVEL = 11,
  FILTER_CUTOFF = 12,
  FILTER_RESONANCE = 13,
  AMP_EG_ATTACK = 14,
  AMP_EG_DECAY = 15,
  AMP_EG_SUSTAIN = 16,
  AMP_EG_RELEASE = 17,
  EG_ATTACK = 18,
  EG_DECAY = 19,
  EG_INT = 20,
  LFO_RATE = 21,
  LFO_INT = 22,
  MOD_FX_SPEED = 23,
  MOD_FX_DEPTH = 24,
  REVERB_TIME = 25,
  REVERB_DEPTH = 26,
  DELAY_TIME = 27,
  DELAY_DEPTH = 28
}

export enum CVInMode {
  MODULATION = 0,
  CV_GATE_PLUS = 1,
  CV_GATE_MINUS = 2
}

export enum MicroTuning {
  EQUAL_TEMP = 0,
  PURE_MAJOR = 1,
  PURE_MINOR = 2,
  PYTHAGOREAN = 3,
  WERCKMEISTER = 4,
  KIRNBURGER = 5,
  SLENDRO = 6,
  PELOG = 7,
  IONIAN = 8,
  DORIAN = 9,
  AEOLIAN = 10,
  MAJOR_PENTA = 11,
  MINOR_PENTA = 12,
  REVERSE = 13,
  AFX001 = 14,
  AFX002 = 15,
  AFX003 = 16,
  AFX004 = 17,
  AFX005 = 18,
  AFX006 = 19,
  DC001 = 20,
  DC002 = 21,
  DC003 = 22,
  USER_SCALE1 = 128,
  USER_SCALE2 = 129,
  USER_SCALE3 = 130,
  USER_SCALE4 = 131,
  USER_SCALE5 = 132,
  USER_SCALE6 = 133,
  USER_OCTAVE1 = 134,
  USER_OCTAVE2 = 135,
  USER_OCTAVE3 = 136,
  USER_OCTAVE4 = 137,
  USER_OCTAVE5 = 138,
  USER_OCTAVE6 = 139
}

export enum LFOTargetOsc {
  ALL = 0,
  VCO1_AND_2 = 1,
  VCO2 = 2,
  MULTI = 3
}

export enum LFOMode {
  ONE_SHOT = 0,
  NORMAL = 1,
  BPM = 2
}

export enum LFOTarget {
  CUTOFF = 0,
  SHAPE = 1,
  PITCH = 2
}

export enum MultiRouting {
  PRE_VCF = 0,
  POST_VCF = 1
}

export enum PortamentoMode {
  AUTO = 0,
  ON = 1
}

export enum UserParamType {
  PERCENT_TYPE = 0,
  PERCENT_BIPOLAR = 1,
  SELECT = 2,
  COUNT = 3
}