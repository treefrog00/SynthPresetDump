import * as Enums from './enums';

export class ProgramData {
  header?: string;
  programName?: string;
  octave: number = 0;
  portamento: number = 0;
  keyTrig: boolean = false;
  voiceModeDepth: number = 0;
  voiceModeType: Enums.VoiceModeType = Enums.VoiceModeType.NONE;

  // VCO 1
  vco1Wave: Enums.VcoWave = Enums.VcoWave.SQR;
  vco1Octave: number = 0;
  vco1Pitch: number = 0;
  vco1Shape: number = 0;

  // VCO 2
  vco2Wave: Enums.VcoWave = Enums.VcoWave.SQR;
  vco2Octave: number = 0;
  vco2Pitch: number = 0;
  vco2Shape: number = 0;

  oscillatorSync: boolean = false;
  ringMod: boolean = false;
  crossModDepth: number = 0;

  // Multi Engine
  multiOscType: Enums.MultiOscType = Enums.MultiOscType.NOISE;
  selectedMultiOscNoise: Enums.MultiOscNoise = Enums.MultiOscNoise.HIGH;
  selectedMultiOscVpm: Enums.MultiOscVPM = Enums.MultiOscVPM.SIN1;
  selectedMultiOscUser: number = 0;

  shapeNoise: number = 0;
  shapeVpm: number = 0;
  shapeUser: number = 0;
  shiftShapeNoise: number = 0;
  shiftShapeVpm: number = 0;
  shiftShapeUser: number = 0;

  // Mixer
  vco1Level: number = 0;
  vco2Level: number = 0;
  multiLevel: number = 0;

  // Filter
  filterCutoff: number = 0;
  filterResonance: number = 0;
  filterCutoffDrive: number = 0;
  filterCutoffKeyboardTrack: number = 0;

  // Amp EG
  ampEgAttack: number = 0;
  ampEgDecay: number = 0;
  ampEgSustain: number = 0;
  ampEgRelease: number = 0;

  // EG
  egAttack: number = 0;
  egDecay: number = 0;
  egInt: number = 0;
  egTarget: Enums.EGTarget = Enums.EGTarget.CUTOFF;

  // LFO
  lfoWave: Enums.VcoWave = Enums.VcoWave.SQR;
  lfoMode: Enums.LFOMode = Enums.LFOMode.NORMAL;
  lfoRate: number = 0;
  lfoInt: number = 0;
  lfoTarget: Enums.LFOTarget = Enums.LFOTarget.CUTOFF;

  // Mod FX
  modFxOnOff: boolean = false;
  modFxType: Enums.ModFxType = Enums.ModFxType.NONE;
  modFxChorus: Enums.ModFxChorus = Enums.ModFxChorus.STEREO;
  modFxEnsemble: Enums.ModFxEnsemble = Enums.ModFxEnsemble.STEREO;
  modFxPhaser: Enums.ModFxPhaser = Enums.ModFxPhaser.STEREO;
  modFxFlanger: Enums.ModFxFlanger = Enums.ModFxFlanger.STEREO;
  modFxUser: number = 0;
  modFxTime: number = 0;
  modFxDepth: number = 0;

  // Delay FX
  delayOnOff: boolean = false;
  delaySubType: Enums.DelaySubType = Enums.DelaySubType.STEREO;
  delayTime: number = 0;
  delayDepth: number = 0;

  // Reverb FX
  reverbOnOff: boolean = false;
  reverbSubType: Enums.ReverbSubType = Enums.ReverbSubType.HALL;
  reverbTime: number = 0;
  reverbDepth: number = 0;

  // Bend & Joystick
  bendRangePlus: number = 0;
  bendRangeMinus: number = 0;
  joystickAssignPlus: Enums.AssignTarget = Enums.AssignTarget.GATE_TIME;
  joystickRangePlus: number = 0;
  joystickAssignMinus: Enums.AssignTarget = Enums.AssignTarget.GATE_TIME;
  joystickRangeMinus: number = 0;

  // CV In
  cvInMode: Enums.CVInMode = Enums.CVInMode.MODULATION;
  cvIn1Assign: Enums.AssignTarget = Enums.AssignTarget.GATE_TIME;
  cvIn1Range: number = 0;
  cvIn2Assign: Enums.AssignTarget = Enums.AssignTarget.GATE_TIME;
  cvIn2Range: number = 0;

  // Tuning
  microTuning: Enums.MicroTuning = Enums.MicroTuning.EQUAL_TEMP;
  scaleKey: number = 0;
  programTuning: number = 0;

  // LFO Advanced
  lfoKeySync: boolean = false;
  lfoVoiceSync: boolean = false;
  lfoTargetOsc: Enums.LFOTargetOsc = Enums.LFOTargetOsc.ALL;

  // Modulation
  cutoffVelocity: number = 0;
  ampVelocity: number = 0;

  // Multi Engine Advanced
  multiOctave: number = 0;
  multiRouting: Enums.MultiRouting = Enums.MultiRouting.PRE_VCF;

  // EG Advanced
  egLegato: boolean = false;

  // Portamento Advanced
  portamentoMode: Enums.PortamentoMode = Enums.PortamentoMode.AUTO;
  portamentoBpmSync: boolean = false;

  // Program Level
  programLevel: number = 72;

  // VPM Parameters
  vpmParameter1Feedback: number = 100;
  vpmParameter2NoiseDepth: number = 100;
  vpmParameter3ShapeModInt: number = 100;
  vpmParameter4ModAttack: number = 100;
  vpmParameter5ModDecay: number = 100;
  vpmParameter6ModKeyTrack: number = 100;

  // User Parameters
  userParam1: number = 0;
  userParam2: number = 0;
  userParam3: number = 0;
  userParam4: number = 0;
  userParam5: number = 0;
  userParam6: number = 0;
  userParam56Type: number = 0;
  userParam1234Type: number = 0;

  userParam1Type: Enums.UserParamType = Enums.UserParamType.PERCENT_TYPE;
  userParam2Type: Enums.UserParamType = Enums.UserParamType.PERCENT_TYPE;
  userParam3Type: Enums.UserParamType = Enums.UserParamType.PERCENT_TYPE;
  userParam4Type: Enums.UserParamType = Enums.UserParamType.PERCENT_TYPE;
  userParam5Type: Enums.UserParamType = Enums.UserParamType.PERCENT_TYPE;
  userParam6Type: Enums.UserParamType = Enums.UserParamType.PERCENT_TYPE;

  // Program Transpose
  programTranspose: number = 13;

  // Dry/Wet
  delayDryWet: number = 0;
  reverbDryWet: number = 0;

  // MIDI After Touch
  midiAfterTouchAssign: Enums.AssignTarget = Enums.AssignTarget.GATE_TIME;

  programEndMarker?: string;
}