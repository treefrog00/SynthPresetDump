import { ProgramData } from './program-data';
import * as Enums from './enums';
import JSZip from 'jszip';

export interface LibraryData {
  type: 'single' | 'library';
  programs: ProgramData[];
  originalFile: File;
}

export class BinaryParser {
  static async parseFile(file: File): Promise<LibraryData> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    if (file.name.endsWith('.prog_bin')) {
      const program = this.parseBinary(uint8Array);
      return {
        type: 'single',
        programs: [program],
        originalFile: file
      };
    } else if (file.name.endsWith('.mnlgxdprog')) {
      return await this.parseZipFile(uint8Array, file);
    } else if (file.name.endsWith('.mnlgxdlib')) {
      return await this.parseLibraryFile(uint8Array, file);
    } else {
      throw new Error('File must be either a ZIP file containing .prog_bin files or a direct .prog_bin file');
    }
  }

  private static async parseZipFile(data: Uint8Array, file: File): Promise<LibraryData> {
    try {
      const zip = new JSZip();
      await zip.loadAsync(data);

      // Look for .prog_bin files
      const progFiles = Object.keys(zip.files).filter(name => name.endsWith('.prog_bin'));

      if (progFiles.length === 0) {
        throw new Error('No .prog_bin files found in ZIP');
      }

      // Use the first .prog_bin file
      const progFile = zip.files[progFiles[0]];
      const progData = await progFile.async('uint8array');
      const program = this.parseBinary(progData);

      return {
        type: 'single',
        programs: [program],
        originalFile: file
      };
    } catch (error) {
      throw new Error(`Failed to parse ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async parseLibraryFile(data: Uint8Array, file: File): Promise<LibraryData> {
    try {
      const zip = new JSZip();
      await zip.loadAsync(data);

      // Look for all .prog_bin files
      const progFiles = Object.keys(zip.files).filter(name => name.endsWith('.prog_bin'));

      if (progFiles.length === 0) {
        throw new Error('No .prog_bin files found in library');
      }

      // Parse all programs
      const programs: ProgramData[] = [];
      for (const fileName of progFiles) {
        try {
          const progFile = zip.files[fileName];
          const progData = await progFile.async('uint8array');
          const program = this.parseBinary(progData);
          programs.push(program);
        } catch (error) {
          console.warn(`Failed to parse program ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (programs.length === 0) {
        throw new Error('No valid programs could be parsed from library');
      }

      return {
        type: 'library',
        programs: programs,
        originalFile: file
      };
    } catch (error) {
      throw new Error(`Failed to parse library file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static parseBinary(data: Uint8Array): ProgramData {
    if (data.length < 160) {
      throw new Error('Data too short to be a valid Minilogue XD program');
    }

    const dataView = new DataView(data.buffer, data.byteOffset);
    const program = new ProgramData();

    // Define field structure based on C# ProgramData offsets
    const fields = [
      { name: 'header', offset: 0, type: 'string', length: 4 },
      { name: 'programName', offset: 4, type: 'string', length: 12 },
      { name: 'octave', offset: 16, type: 'uint8' },
      { name: 'portamento', offset: 17, type: 'uint8' },
      { name: 'keyTrig', offset: 18, type: 'bool' },
      { name: 'voiceModeDepth', offset: 19, type: 'uint16' },
      { name: 'voiceModeType', offset: 21, type: 'uint8', enum: 'VoiceModeType' },
      { name: 'vco1Wave', offset: 22, type: 'uint8', enum: 'VcoWave' },
      { name: 'vco1Octave', offset: 23, type: 'uint8' },
      { name: 'vco1Pitch', offset: 24, type: 'uint16' },
      { name: 'vco1Shape', offset: 26, type: 'uint16' },
      { name: 'vco2Wave', offset: 28, type: 'uint8', enum: 'VcoWave' },
      { name: 'vco2Octave', offset: 29, type: 'uint8' },
      { name: 'vco2Pitch', offset: 30, type: 'uint16' },
      { name: 'vco2Shape', offset: 32, type: 'uint16' },
      { name: 'oscillatorSync', offset: 34, type: 'bool' },
      { name: 'ringMod', offset: 35, type: 'bool' },
      { name: 'crossModDepth', offset: 36, type: 'uint16' },
      { name: 'multiOscType', offset: 38, type: 'uint8', enum: 'MultiOscType' },
      { name: 'selectedMultiOscNoise', offset: 39, type: 'uint8', enum: 'MultiOscNoise' },
      { name: 'selectedMultiOscVpm', offset: 40, type: 'uint8', enum: 'MultiOscVPM' },
      { name: 'selectedMultiOscUser', offset: 41, type: 'uint8' },
      { name: 'shapeNoise', offset: 42, type: 'uint16' },
      { name: 'shapeVpm', offset: 44, type: 'uint16' },
      { name: 'shapeUser', offset: 46, type: 'uint16' },
      { name: 'shiftShapeNoise', offset: 48, type: 'uint16' },
      { name: 'shiftShapeVpm', offset: 50, type: 'uint16' },
      { name: 'shiftShapeUser', offset: 52, type: 'uint16' },
      { name: 'vco1Level', offset: 54, type: 'uint16' },
      { name: 'vco2Level', offset: 56, type: 'uint16' },
      { name: 'multiLevel', offset: 58, type: 'uint16' },
      { name: 'filterCutoff', offset: 60, type: 'uint16' },
      { name: 'filterResonance', offset: 62, type: 'uint16' },
      { name: 'filterCutoffDrive', offset: 64, type: 'uint8' },
      { name: 'filterCutoffKeyboardTrack', offset: 65, type: 'uint8' },
      { name: 'ampEgAttack', offset: 66, type: 'uint16' },
      { name: 'ampEgDecay', offset: 68, type: 'uint16' },
      { name: 'ampEgSustain', offset: 70, type: 'uint16' },
      { name: 'ampEgRelease', offset: 72, type: 'uint16' },
      { name: 'egAttack', offset: 74, type: 'uint16' },
      { name: 'egDecay', offset: 76, type: 'uint16' },
      { name: 'egInt', offset: 78, type: 'uint16' },
      { name: 'egTarget', offset: 80, type: 'uint8', enum: 'EGTarget' },
      { name: 'lfoWave', offset: 81, type: 'uint8', enum: 'VcoWave' },
      { name: 'lfoMode', offset: 82, type: 'uint8', enum: 'LFOMode' },
      { name: 'lfoRate', offset: 83, type: 'uint16' },
      { name: 'lfoInt', offset: 85, type: 'uint16' },
      { name: 'lfoTarget', offset: 87, type: 'uint8', enum: 'LFOTarget' },
      { name: 'modFxOnOff', offset: 88, type: 'bool' },
      { name: 'modFxType', offset: 89, type: 'uint8', enum: 'ModFxType' },
      { name: 'modFxChorus', offset: 90, type: 'uint8', enum: 'ModFxChorus' },
      { name: 'modFxEnsemble', offset: 91, type: 'uint8', enum: 'ModFxEnsemble' },
      { name: 'modFxPhaser', offset: 92, type: 'uint8', enum: 'ModFxPhaser' },
      { name: 'modFxFlanger', offset: 93, type: 'uint8', enum: 'ModFxFlanger' },
      { name: 'modFxUser', offset: 94, type: 'uint8' },
      { name: 'modFxTime', offset: 95, type: 'uint16' },
      { name: 'modFxDepth', offset: 97, type: 'uint16' },
      { name: 'delayOnOff', offset: 99, type: 'bool' },
      { name: 'delaySubType', offset: 100, type: 'uint8', enum: 'DelaySubType' },
      { name: 'delayTime', offset: 101, type: 'uint16' },
      { name: 'delayDepth', offset: 103, type: 'uint16' },
      { name: 'reverbOnOff', offset: 105, type: 'bool' },
      { name: 'reverbSubType', offset: 106, type: 'uint8', enum: 'ReverbSubType' },
      { name: 'reverbTime', offset: 107, type: 'uint16' },
      { name: 'reverbDepth', offset: 109, type: 'uint16' },
      { name: 'bendRangePlus', offset: 111, type: 'uint8' },
      { name: 'bendRangeMinus', offset: 112, type: 'uint8' },
      { name: 'joystickAssignPlus', offset: 113, type: 'uint8', enum: 'AssignTarget' },
      { name: 'joystickRangePlus', offset: 114, type: 'uint8' },
      { name: 'joystickAssignMinus', offset: 115, type: 'uint8', enum: 'AssignTarget' },
      { name: 'joystickRangeMinus', offset: 116, type: 'uint8' },
      { name: 'cvInMode', offset: 117, type: 'uint8', enum: 'CVInMode' },
      { name: 'cvIn1Assign', offset: 118, type: 'uint8', enum: 'AssignTarget' },
      { name: 'cvIn1Range', offset: 119, type: 'uint8' },
      { name: 'cvIn2Assign', offset: 120, type: 'uint8', enum: 'AssignTarget' },
      { name: 'cvIn2Range', offset: 121, type: 'uint8' },
      { name: 'microTuning', offset: 122, type: 'uint8', enum: 'MicroTuning' },
      { name: 'scaleKey', offset: 123, type: 'uint8' },
      { name: 'programTuning', offset: 124, type: 'uint8' },
      { name: 'lfoKeySync', offset: 125, type: 'bool' },
      { name: 'lfoVoiceSync', offset: 126, type: 'bool' },
      { name: 'lfoTargetOsc', offset: 127, type: 'uint8', enum: 'LFOTargetOsc' },
      { name: 'cutoffVelocity', offset: 128, type: 'uint8' },
      { name: 'ampVelocity', offset: 129, type: 'uint8' },
      { name: 'multiOctave', offset: 130, type: 'uint8' },
      { name: 'multiRouting', offset: 131, type: 'uint8', enum: 'MultiRouting' },
      { name: 'egLegato', offset: 132, type: 'bool' },
      { name: 'portamentoMode', offset: 133, type: 'uint8', enum: 'PortamentoMode' },
      { name: 'portamentoBpmSync', offset: 134, type: 'bool' },
      { name: 'programLevel', offset: 135, type: 'uint8' },
      { name: 'vpmParameter1Feedback', offset: 136, type: 'uint8' },
      { name: 'vpmParameter2NoiseDepth', offset: 137, type: 'uint8' },
      { name: 'vpmParameter3ShapeModInt', offset: 138, type: 'uint8' },
      { name: 'vpmParameter4ModAttack', offset: 139, type: 'uint8' },
      { name: 'vpmParameter5ModDecay', offset: 140, type: 'uint8' },
      { name: 'vpmParameter6ModKeyTrack', offset: 141, type: 'uint8' },
      { name: 'userParam1', offset: 142, type: 'uint8' },
      { name: 'userParam2', offset: 143, type: 'uint8' },
      { name: 'userParam3', offset: 144, type: 'uint8' },
      { name: 'userParam4', offset: 145, type: 'uint8' },
      { name: 'userParam5', offset: 146, type: 'uint8' },
      { name: 'userParam6', offset: 147, type: 'uint8' },
      { name: 'userParam56Type', offset: 148, type: 'uint8' },
      { name: 'userParam1234Type', offset: 149, type: 'uint8' },
      { name: 'programTranspose', offset: 150, type: 'uint8' },
      { name: 'delayDryWet', offset: 151, type: 'uint16' },
      { name: 'reverbDryWet', offset: 153, type: 'uint16' },
      { name: 'midiAfterTouchAssign', offset: 155, type: 'uint8', enum: 'AssignTarget' },
      { name: 'programEndMarker', offset: 156, type: 'string', length: 4 }
    ];

    // Parse each field based on its definition
    for (const field of fields) {
      if (field.offset >= data.length) break;

      try {
        let value: any;

        switch (field.type) {
          case 'uint8':
            value = dataView.getUint8(field.offset);
            if (field.enum && (Enums as any)[field.enum]) {
              value = value as any;
            }
            break;
          case 'uint16':
            if (field.offset + 1 >= data.length) break;
            value = dataView.getUint16(field.offset, true);
            if (field.enum && (Enums as any)[field.enum]) {
              value = value as any;
            }
            break;
          case 'bool':
            value = dataView.getUint8(field.offset) !== 0;
            break;
          case 'string':
            if (field.offset + (field.length || 1) > data.length) break;
            value = new TextDecoder('ascii')
              .decode(data.slice(field.offset, field.offset + (field.length || 1)))
              .replace(/\0+$/, '');
            break;
        }

        (program as any)[field.name] = value;
      } catch (e) {
        // Ignore errors for missing data
      }
    }

    // Handle special cases for user param type extraction
    if (program.userParam1234Type !== undefined) {
      program.userParam1Type = (program.userParam1234Type & 0x3) as Enums.UserParamType;
      program.userParam2Type = ((program.userParam1234Type >> 2) & 0x3) as Enums.UserParamType;
      program.userParam3Type = ((program.userParam1234Type >> 4) & 0x3) as Enums.UserParamType;
      program.userParam4Type = ((program.userParam1234Type >> 6) & 0x3) as Enums.UserParamType;
    }

    if (program.userParam56Type !== undefined) {
      program.userParam5Type = (program.userParam56Type & 0x3) as Enums.UserParamType;
      program.userParam6Type = ((program.userParam56Type >> 2) & 0x3) as Enums.UserParamType;
    }

    // Parse extended sequencer data if available
    if (data.length > 160) {
      this.parseSequencerData(data, program);
    }

    // Add stub data for user oscillators and effects (these would be parsed from additional sections)
    this.addUserOscillatorData(program);
    this.addUserEffectsData(program);

    return program;
  }

  private static parseSequencerData(data: Uint8Array, program: any): void {
    const dataView = new DataView(data.buffer, data.byteOffset);

    // Check if this is V2 sequencer data (starts with "SQ") or V1 data (starts with "SEQD")
    if (data.length > 161) {
      const sqHeader = new TextDecoder('ascii').decode(data.slice(160, 162));
      if (sqHeader === "SQ") {
        // V2 format
        program.sq = sqHeader;

        // Parse active step bits from bytes 162 and 163
        const activeStep1 = dataView.getUint8(162);
        const activeStep2 = dataView.getUint8(163);

        program.step1ActiveStepOnOff = (activeStep1 & 0x01) !== 0;
        program.step2ActiveStepOnOff = (activeStep1 & 0x02) !== 0;
        program.step3ActiveStepOnOff = (activeStep1 & 0x04) !== 0;
        program.step4ActiveStepOnOff = (activeStep1 & 0x08) !== 0;
        program.step5ActiveStepOnOff = (activeStep1 & 0x10) !== 0;
        program.step6ActiveStepOnOff = (activeStep1 & 0x20) !== 0;
        program.step7ActiveStepOnOff = (activeStep1 & 0x40) !== 0;
        program.step8ActiveStepOnOff = (activeStep1 & 0x80) !== 0;

        program.step9ActiveStepOnOff = (activeStep2 & 0x01) !== 0;
        program.step10ActiveStepOnOff = (activeStep2 & 0x02) !== 0;
        program.step11ActiveStepOnOff = (activeStep2 & 0x04) !== 0;
        program.step12ActiveStepOnOff = (activeStep2 & 0x08) !== 0;
        program.step13ActiveStepOnOff = (activeStep2 & 0x10) !== 0;
        program.step14ActiveStepOnOff = (activeStep2 & 0x20) !== 0;
        program.step15ActiveStepOnOff = (activeStep2 & 0x40) !== 0;
        program.step16ActiveStepOnOff = (activeStep2 & 0x80) !== 0;

        // Parse sequencer data starting at offset 164
        this.parseSequencerDataStructure(data, program, 164);

        // Parse ARP gate time and rate at end of structure
        if (data.length > 1022) {
          program.arpGateTime = dataView.getUint8(1022);
        }
        if (data.length > 1023) {
          program.arpRate = dataView.getUint8(1023);
        }
      } else if (data.length > 163) {
        const seqdHeader = new TextDecoder('ascii').decode(data.slice(160, 164));
        if (seqdHeader === "SEQD") {
          // V1 format - set all active steps to true (default)
          program.sq = "SQ"; // Convert to V2 format
          program.step1ActiveStepOnOff = true;
          program.step2ActiveStepOnOff = true;
          program.step3ActiveStepOnOff = true;
          program.step4ActiveStepOnOff = true;
          program.step5ActiveStepOnOff = true;
          program.step6ActiveStepOnOff = true;
          program.step7ActiveStepOnOff = true;
          program.step8ActiveStepOnOff = true;
          program.step9ActiveStepOnOff = true;
          program.step10ActiveStepOnOff = true;
          program.step11ActiveStepOnOff = true;
          program.step12ActiveStepOnOff = true;
          program.step13ActiveStepOnOff = true;
          program.step14ActiveStepOnOff = true;
          program.step15ActiveStepOnOff = true;
          program.step16ActiveStepOnOff = true;

          // Parse sequencer data starting at offset 164
          this.parseSequencerDataStructure(data, program, 164);

          // V1 doesn't have ARP data, use defaults
          program.arpGateTime = 55; // 75%
          program.arpRate = 4; // Sixteen
        }
      }
    }
  }

  private static parseSequencerDataStructure(data: Uint8Array, program: any, offset: number): void {
    const dataView = new DataView(data.buffer, data.byteOffset);

    // Create sequencer data object similar to C# structure
    const sequencerData: any = {};

    try {
      if (offset + 2 < data.length) sequencerData.bpm = dataView.getUint16(offset, true);
      if (offset + 3 < data.length) sequencerData.stepLength = dataView.getUint8(offset + 2);
      if (offset + 4 < data.length) sequencerData.stepResolution = dataView.getUint8(offset + 3);
      if (offset + 5 < data.length) sequencerData.swing = dataView.getUint8(offset + 4);
      if (offset + 6 < data.length) sequencerData.defaultGateTime = dataView.getUint8(offset + 5);

      // Parse step on/off data (16 bits starting at offset + 6)
      if (offset + 8 < data.length) {
        const stepData = dataView.getUint16(offset + 6, true);
        for (let i = 1; i <= 16; i++) {
          sequencerData[`step${i}StepOnOff`] = (stepData & (1 << (i - 1))) !== 0;
        }
      }

      // Parse motion on/off data (16 bits starting at offset + 8)
      if (offset + 10 < data.length) {
        const motionData = dataView.getUint16(offset + 8, true);
        for (let i = 1; i <= 16; i++) {
          sequencerData[`step${i}MotionOnOff`] = (motionData & (1 << (i - 1))) !== 0;
        }
      }

      // Parse motion slot parameters (simplified - would need full C# structure for complete implementation)
      const motionSlotFields = [
        'motionSlot1Parameter_MotionOnOff',
        'motionSlot1Parameter_SmoothOnOff',
        'motionSlot1ParameterId',
        'motionSlot2Parameter_MotionOnOff',
        'motionSlot2Parameter_SmoothOnOff',
        'motionSlot2ParameterId',
        'motionSlot3Parameter_MotionOnOff',
        'motionSlot3Parameter_SmoothOnOff',
        'motionSlot3ParameterId',
        'motionSlot4Parameter_MotionOnOff',
        'motionSlot4Parameter_SmoothOnOff',
        'motionSlot4ParameterId'
      ];

      let motionOffset = offset + 10;
      for (let i = 0; i < motionSlotFields.length && motionOffset < data.length; i++) {
        const field = motionSlotFields[i];
        if (field.includes('OnOff')) {
          sequencerData[field] = dataView.getUint8(motionOffset) !== 0;
          motionOffset += 1;
        } else if (field.includes('Id')) {
          sequencerData[field] = dataView.getUint8(motionOffset);
          motionOffset += 1;
        }
      }

      // Add step data for all 4 motion slots and 16 steps (simplified)
      for (let slot = 1; slot <= 4; slot++) {
        for (let step = 1; step <= 16; step++) {
          sequencerData[`motionSlot${slot}Step${step}OnOff`] = false; // Default to false
        }
      }

    } catch (e) {
      // Ignore parsing errors
    }

    program.sequencerData = sequencerData;
  }

  private static addUserOscillatorData(program: any): void {
    // Add user oscillator data structure
    const userOscillators: any = {};
    for (let i = 1; i <= 16; i++) {
      userOscillators[`userOscillator${i}`] = 'USER OSC';
    }
    program.userOscillators = userOscillators;

    // Add individual user oscillator fields for compatibility
    for (let i = 1; i <= 16; i++) {
      program[`userOscillator${i}`] = 'USER OSC';
    }
  }

  private static addUserEffectsData(program: any): void {
    // Add user mod effects data (16 slots)
    for (let i = 1; i <= 16; i++) {
      program[`userModFx${i}`] = 'USER MOD FX';
    }

    // Add user delay effects data (8 slots)
    for (let i = 1; i <= 8; i++) {
      program[`userDelayFx${i}`] = 'USER DELAY FX';
    }

    // Add user reverb effects data (8 slots)
    for (let i = 1; i <= 8; i++) {
      program[`userReverbFx${i}`] = 'USER REVERB FX';
    }
  }

  /**
   * Parse binary data directly from a Uint8Array
   * This method is useful when you already have the binary data in memory
   * or for testing purposes
   */
  static parseBinaryData(data: Uint8Array): ProgramData {
    return this.parseBinary(data);
  }
}