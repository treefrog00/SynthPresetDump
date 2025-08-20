import { ProgramData } from './program-data';
import * as Enums from './enums';

export class BinaryParser {
  static async parseFile(file: File): Promise<ProgramData> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    if (file.name.endsWith('.mnlgxdprog') || file.name.endsWith('.mnlgxdlib')) {
      return this.parseZipFile(uint8Array);
    } else {
      return this.parseBinary(uint8Array);
    }
  }

  private static parseZipFile(data: Uint8Array): ProgramData {
    const dataView = new DataView(data.buffer);
    
    // Look for ZIP signature (PK\x03\x04)
    let zipOffset = -1;
    for (let i = 0; i < data.length - 4; i++) {
      if (data[i] === 0x50 && data[i + 1] === 0x4B && 
          data[i + 2] === 0x03 && data[i + 3] === 0x04) {
        zipOffset = i;
        break;
      }
    }

    if (zipOffset === -1) {
      throw new Error('No ZIP signature found');
    }

    // Simple ZIP parsing - look for .prog_bin files
    let offset = zipOffset + 30; // Skip local file header
    
    while (offset < data.length - 160) {
      // Try to find prog_bin data by looking for the PROG header
      if (data[offset] === 0x50 && data[offset + 1] === 0x52 && 
          data[offset + 2] === 0x4F && data[offset + 3] === 0x47) {
        const progData = data.slice(offset, offset + 160);
        return this.parseBinary(progData);
      }
      offset++;
    }
    
    throw new Error('No program data found in ZIP file');
  }

  static parseBinary(data: Uint8Array): ProgramData {
    if (data.length < 160) {
      throw new Error('Data too short to be a valid Minilogue XD program');
    }

    const dataView = new DataView(data.buffer, data.byteOffset);
    const program = new ProgramData();

    let offset = 0;

    // Header (4 bytes)
    program.header = new TextDecoder('ascii').decode(data.slice(offset, offset + 4)).replace(/\0+$/, '');
    offset += 4;

    // Program name (12 bytes)
    program.programName = new TextDecoder('ascii').decode(data.slice(offset, offset + 12)).replace(/\0+$/, '');
    offset += 12;

    // Basic parameters
    program.octave = dataView.getUint8(offset++);
    program.portamento = dataView.getUint8(offset++);
    program.keyTrig = dataView.getUint8(offset++) !== 0;
    program.voiceModeDepth = dataView.getUint16(offset, true);
    offset += 2;
    program.voiceModeType = dataView.getUint8(offset++) as Enums.VoiceModeType;

    // VCO 1
    program.vco1Wave = dataView.getUint8(offset++) as Enums.VcoWave;
    program.vco1Octave = dataView.getUint8(offset++);
    program.vco1Pitch = dataView.getUint16(offset, true);
    offset += 2;
    program.vco1Shape = dataView.getUint16(offset, true);
    offset += 2;

    // VCO 2
    program.vco2Wave = dataView.getUint8(offset++) as Enums.VcoWave;
    program.vco2Octave = dataView.getUint8(offset++);
    program.vco2Pitch = dataView.getUint16(offset, true);
    offset += 2;
    program.vco2Shape = dataView.getUint16(offset, true);
    offset += 2;

    program.oscillatorSync = dataView.getUint8(offset++) !== 0;
    program.ringMod = dataView.getUint8(offset++) !== 0;
    program.crossModDepth = dataView.getUint16(offset, true);
    offset += 2;

    // Multi Engine
    program.multiOscType = dataView.getUint8(offset++) as Enums.MultiOscType;
    program.selectedMultiOscNoise = dataView.getUint8(offset++) as Enums.MultiOscNoise;
    program.selectedMultiOscVpm = dataView.getUint8(offset++) as Enums.MultiOscVPM;
    program.selectedMultiOscUser = dataView.getUint8(offset++);
    program.shapeNoise = dataView.getUint16(offset, true);
    offset += 2;
    program.shapeVpm = dataView.getUint16(offset, true);
    offset += 2;
    program.shapeUser = dataView.getUint16(offset, true);
    offset += 2;
    program.shiftShapeNoise = dataView.getUint16(offset, true);
    offset += 2;
    program.shiftShapeVpm = dataView.getUint16(offset, true);
    offset += 2;
    program.shiftShapeUser = dataView.getUint16(offset, true);
    offset += 2;

    // Mixer
    program.vco1Level = dataView.getUint8(offset++);
    program.vco2Level = dataView.getUint8(offset++);
    program.multiLevel = dataView.getUint16(offset, true);
    offset += 2;

    // Filter
    program.filterCutoff = dataView.getUint16(offset, true);
    offset += 2;
    program.filterResonance = dataView.getUint8(offset++);
    program.filterCutoffDrive = dataView.getUint8(offset++);
    program.filterCutoffKeyboardTrack = dataView.getUint16(offset, true);
    offset += 2;

    // Amp EG
    program.ampEgAttack = dataView.getUint16(offset, true);
    offset += 2;
    program.ampEgDecay = dataView.getUint16(offset, true);
    offset += 2;
    program.ampEgSustain = dataView.getUint16(offset, true);
    offset += 2;
    program.ampEgRelease = dataView.getUint16(offset, true);
    offset += 2;

    // EG
    program.egAttack = dataView.getUint8(offset++);
    program.egDecay = dataView.getUint8(offset++);
    program.egInt = dataView.getUint16(offset, true);
    offset += 2;
    program.egTarget = dataView.getUint16(offset, true) as Enums.EGTarget;
    offset += 2;

    // LFO
    program.lfoWave = dataView.getUint8(offset++) as Enums.VcoWave;
    program.lfoMode = dataView.getUint8(offset++) as Enums.LFOMode;
    program.lfoRate = dataView.getUint16(offset, true);
    offset += 2;
    program.lfoInt = dataView.getUint16(offset, true);
    offset += 2;
    program.lfoTarget = dataView.getUint8(offset++) as Enums.LFOTarget;

    // Mod FX
    program.modFxOnOff = dataView.getUint8(offset++) !== 0;
    const modFxTypeValue = dataView.getUint8(offset++);
    program.modFxType = modFxTypeValue > 0 ? modFxTypeValue as Enums.ModFxType : Enums.ModFxType.NONE;
    program.modFxChorus = dataView.getUint8(offset++) as Enums.ModFxChorus;
    program.modFxEnsemble = dataView.getUint8(offset++) as Enums.ModFxEnsemble;
    program.modFxPhaser = dataView.getUint8(offset++) as Enums.ModFxPhaser;
    program.modFxFlanger = dataView.getUint8(offset++) as Enums.ModFxFlanger;
    program.modFxUser = dataView.getUint8(offset++);
    program.modFxTime = dataView.getUint16(offset, true);
    offset += 2;
    program.modFxDepth = dataView.getUint16(offset, true);
    offset += 2;

    // Delay FX
    program.delayOnOff = dataView.getUint8(offset++) !== 0;
    program.delaySubType = dataView.getUint8(offset++) as Enums.DelaySubType;
    program.delayTime = dataView.getUint16(offset, true);
    offset += 2;
    program.delayDepth = dataView.getUint16(offset, true);
    offset += 2;

    // Reverb FX
    program.reverbOnOff = dataView.getUint8(offset++) !== 0;
    program.reverbSubType = dataView.getUint8(offset++) as Enums.ReverbSubType;
    program.reverbTime = dataView.getUint16(offset, true);
    offset += 2;
    program.reverbDepth = dataView.getUint16(offset, true);
    offset += 2;

    // Bend & Joystick
    program.bendRangePlus = dataView.getUint8(offset++);
    program.bendRangeMinus = dataView.getUint8(offset++);
    program.joystickAssignPlus = dataView.getUint8(offset++) as Enums.AssignTarget;
    program.joystickRangePlus = dataView.getUint8(offset++);
    program.joystickAssignMinus = dataView.getUint8(offset++) as Enums.AssignTarget;
    program.joystickRangeMinus = dataView.getUint8(offset++);

    // CV In
    program.cvInMode = dataView.getUint8(offset++) as Enums.CVInMode;
    program.cvIn1Assign = dataView.getUint8(offset++) as Enums.AssignTarget;
    program.cvIn1Range = dataView.getUint8(offset++);
    program.cvIn2Assign = dataView.getUint8(offset++) as Enums.AssignTarget;
    program.cvIn2Range = dataView.getUint8(offset++);

    // Tuning & Advanced
    program.microTuning = dataView.getUint8(offset++) as Enums.MicroTuning;
    program.scaleKey = dataView.getUint8(offset++);
    program.programTuning = dataView.getUint16(offset, true);
    offset += 2;
    program.lfoKeySync = dataView.getUint8(offset++) !== 0;
    program.lfoVoiceSync = dataView.getUint8(offset++) !== 0;
    program.lfoTargetOsc = dataView.getUint8(offset++) as Enums.LFOTargetOsc;
    program.cutoffVelocity = dataView.getUint8(offset++);
    program.ampVelocity = dataView.getUint8(offset++);
    program.multiOctave = dataView.getUint8(offset++);
    program.multiRouting = dataView.getUint8(offset++) as Enums.MultiRouting;
    program.egLegato = dataView.getUint8(offset++) !== 0;
    program.portamentoMode = dataView.getUint8(offset++) as Enums.PortamentoMode;
    program.portamentoBpmSync = dataView.getUint8(offset++) !== 0;
    program.programLevel = dataView.getUint8(offset++);

    // VPM Parameters
    program.vpmParameter1Feedback = dataView.getUint16(offset, true);
    offset += 2;
    program.vpmParameter2NoiseDepth = dataView.getUint16(offset, true);
    offset += 2;
    program.vpmParameter3ShapeModInt = dataView.getUint16(offset, true);
    offset += 2;
    program.vpmParameter4ModAttack = dataView.getUint16(offset, true);
    offset += 2;
    program.vpmParameter5ModDecay = dataView.getUint8(offset++);
    program.vpmParameter6ModKeyTrack = dataView.getUint8(offset++);

    // User Parameters
    program.userParam1 = dataView.getUint8(offset++);
    program.userParam2 = dataView.getUint8(offset++);
    program.userParam3 = dataView.getUint8(offset++);
    program.userParam4 = dataView.getUint8(offset++);
    program.userParam5 = dataView.getUint8(offset++);
    program.userParam6 = dataView.getUint8(offset++);

    // User param types are encoded in a packed format
    const userParamTypes = dataView.getUint8(offset++);
    program.userParam1234Type = userParamTypes;

    // Extract individual parameter types (2 bits each)
    program.userParam1Type = (userParamTypes & 0x3) as Enums.UserParamType;
    program.userParam2Type = ((userParamTypes >> 2) & 0x3) as Enums.UserParamType;
    program.userParam3Type = ((userParamTypes >> 4) & 0x3) as Enums.UserParamType;
    program.userParam4Type = ((userParamTypes >> 6) & 0x3) as Enums.UserParamType;

    if (data.length > 148) {
      try {
        const userParam56Type = dataView.getUint8(148);
        program.userParam56Type = userParam56Type;
        program.userParam5Type = (userParam56Type & 0x3) as Enums.UserParamType;
        program.userParam6Type = ((userParam56Type >> 2) & 0x3) as Enums.UserParamType;
      } catch (e) {
        // Ignore errors for missing data
      }
    }

    // Additional fields
    program.programTranspose = dataView.getUint8(offset++);

    if (data.length >= 160) {
      try {
        program.delayDryWet = dataView.getUint16(151, true);
        program.reverbDryWet = dataView.getUint16(153, true);
        program.midiAfterTouchAssign = dataView.getUint8(155) as Enums.AssignTarget;
      } catch (e) {
        // Ignore errors for missing data
      }
    }

    // Program end marker (4 bytes at the end)
    if (data.length >= 160) {
      program.programEndMarker = new TextDecoder('ascii').decode(data.slice(156, 160)).replace(/\0+$/, '');
    }

    return program;
  }
}