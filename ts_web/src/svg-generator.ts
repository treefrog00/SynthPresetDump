import { ProgramData } from './program-data';
import * as Enums from './enums';
import { DisplayHelper } from './display-helper';

export class SvgGenerator {
  private static readonly SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  private static readonly PADDING = 10;
  private static readonly STROKE_WIDTH = 3;

  // Colors
  private static readonly BACKGROUND_COLOR = "white";
  private static readonly STROKE_COLOR = "black";
  private static readonly SWITCH_ACTIVE_COLOR = "red";

  // Component dimensions
  private static readonly KNOB_DIAMETER = 70;
  private static readonly KNOB_RADIUS = this.KNOB_DIAMETER / 2;
  private static readonly LED_DIAMETER = 20;
  private static readonly LED_RADIUS = this.LED_DIAMETER / 2;

  // Layout dimensions
  private static readonly SYNTH_WIDTH = 2300;
  private static readonly SYNTH_HEIGHT = 970;
  private static readonly HEADER_OFFSET = 35;
  private static readonly ROW_SPACING = 255;
  private static readonly FIRST_ROW_Y = 90;

  private static formatEnumForDisplay(enumValue: string): string {
    // Convert SNAKE_CASE to PascalCase for display (e.g., EQUAL_TEMP -> EqualTemp)
    // Special handling for certain abbreviations to match C# format
    const formatted = enumValue
      .split('_')
      .map(word => {
        const lower = word.toLowerCase();
        if (lower === 'lfo') return 'LFO';  // Keep LFO in all caps
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    return formatted;
  }

  private static formatAssignTarget(assignTarget: number): string {
    // Format AssignTarget enum values to match C# version
    switch (assignTarget) {
      case Enums.AssignTarget.VCO1_SHAPE:
        return "Vco1Shape";
      case Enums.AssignTarget.FILTER_CUTOFF:
        return "FilterCutoff";
      case Enums.AssignTarget.GATE_TIME:
        return "GateTime";
      default:
        return Enums.AssignTarget[assignTarget] || assignTarget.toString();
    }
  }

  private static formatUserParamValue(type: Enums.UserParamType, value: number): string {
    if (type === Enums.UserParamType.PERCENT_BIPOLAR) {
      const signed = value - 100;
      return `${signed}%`;
    } else if (type === Enums.UserParamType.PERCENT_TYPE) {
      return `${value}%`;
    } else if (type === Enums.UserParamType.SELECT || type === Enums.UserParamType.COUNT) {
      return value.toString();
    }
    return value.toString();
  }

  private static getMultiEngineProgramEditLabel(programData: ProgramData): string {
    const octaveStr = ["16'", "8'", "4'", "2'"][programData.multiOctave] || `??? (Raw: ${programData.multiOctave})`;
    return `\n**Program Edit / Other\nMulti Octave: ${octaveStr}\nMulti Routing: ${programData.multiRouting === Enums.MultiRouting.PRE_VCF ? "PreVCF" : "PostVCF"}`;
  }

  private static createMultiEngineUserSection(programData: ProgramData, x: number): { elements: string[], title: string } {
    const elements: string[] = [];
    const title = `User (#${programData.selectedMultiOscUser + 1})`;

    elements.push('<g>');

    // SHIFT+SHAPE
    const shiftShapePercent = this.percentFromValue(programData.shiftShapeUser, 0, 1023);
    elements.push(...this.createKnob(`SHIFT+SHAPE\nRaw: ${programData.shiftShapeUser}`, x + 355, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shiftShapePercent));

    // SHAPE
    const shapePercent = this.percentFromValue(programData.shapeUser, 0, 1023);
    elements.push(...this.createKnob(`SHAPE\nRaw: ${programData.shapeUser}`, x + 510, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shapePercent));

    // User parameters (using generic labels for now since we don't have userOscillatorDescriptions.json)
    const userParams = [
      "**Program Edit / Multi Engine",
      `Param 1: ${this.formatUserParamValue(programData.userParam1Type, programData.userParam1)}`,
      `Param 2: ${this.formatUserParamValue(programData.userParam2Type, programData.userParam2)}`,
      `Param 3: ${this.formatUserParamValue(programData.userParam3Type, programData.userParam3)}`,
      `Param 4: ${this.formatUserParamValue(programData.userParam4Type, programData.userParam4)}`,
      `Param 5: ${this.formatUserParamValue(programData.userParam5Type, programData.userParam5)}`,
      `Param 6: ${this.formatUserParamValue(programData.userParam6Type, programData.userParam6)}`,
      this.getMultiEngineProgramEditLabel(programData)
    ];

    userParams.forEach((line, index) => {
      const yPos = this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 40 + (index * 20);
      const fontWeight = line.startsWith('**') ? 'bold' : 'normal';
      const cleanedLine = line.startsWith('**') ? line.substring(2) : line;
      elements.push(this.createText(cleanedLine, x + 80, yPos, "1.2em", fontWeight, "start"));
    });

    elements.push('</g>');
    return { elements, title };
  }

  private static createMultiEngineVPMSection(programData: ProgramData, x: number): { elements: string[], title: string } {
    const elements: string[] = [];
    const title = `VPM / ${Enums.MultiOscVPM[programData.selectedMultiOscVpm] || programData.selectedMultiOscVpm}`;

    elements.push('<g>');

    // SHAPE: MOD DEPTH
    const shapePercent = this.percentFromValue(programData.shapeVpm, 0, 1023);
    elements.push(...this.createKnob(`SHAPE\nMOD DEPTH\nRaw: ${programData.shapeVpm}\n(${this.percent1023String(programData.shapeVpm)})`, x + 510, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shapePercent));

    // SHIFT+SHAPE: RATIO OFFSET
    const shiftShapePercent = this.percentFromValue(programData.shiftShapeVpm, 0, 1023);
    elements.push(...this.createKnob(`SHIFT+SHAPE\nRATIO OFFSET\nRaw: ${programData.shiftShapeVpm}\n(${this.percent1023String(programData.shiftShapeVpm)})`, x + 355, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shiftShapePercent));

    // VPM settings
    const vpmSettings = [
      "**Program Edit / Multi Engine",
      `Feedback: ${DisplayHelper.minusToPlus100String(programData.vpmParameter1Feedback)}`,
      `Noise Depth: ${DisplayHelper.minusToPlus100String(programData.vpmParameter2NoiseDepth)}`,
      `Shape Mod Int: ${DisplayHelper.minusToPlus100String(programData.vpmParameter3ShapeModInt)}`,
      `Mod Attack: ${DisplayHelper.minusToPlus100String(programData.vpmParameter4ModAttack)}`,
      `Mod Decay: ${DisplayHelper.minusToPlus100String(programData.vpmParameter5ModDecay)}`,
      `Mod Key Track: ${DisplayHelper.minusToPlus100String(programData.vpmParameter6ModKeyTrack)}`,
      this.getMultiEngineProgramEditLabel(programData)
    ];

    vpmSettings.forEach((line, index) => {
      const yPos = this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 40 + (index * 20);
      const fontWeight = line.startsWith('**') ? 'bold' : 'normal';
      const cleanedLine = line.startsWith('**') ? line.substring(2) : line;
      elements.push(this.createText(cleanedLine, x + 80, yPos, "1.2em", fontWeight, "start"));
    });

    elements.push('</g>');
    return { elements, title };
  }

  private static createMultiEngineNoiseSection(programData: ProgramData, x: number): { elements: string[], title: string } {
    const elements: string[] = [];
    const title = `Noise / ${this.formatEnumForDisplay(Enums.MultiOscNoise[programData.selectedMultiOscNoise]) || programData.selectedMultiOscNoise}`;

    elements.push('<g>');

    // Determine shape label based on noise type
    let shapeLabel: string;
    if (programData.selectedMultiOscNoise === Enums.MultiOscNoise.DECIM) {
      // SHIFT+SHAPE: KEY TRACK
      const shiftShapePercent = this.percentFromValue(programData.shiftShapeNoise, 0, 1023);
      elements.push(...this.createKnob(`SHIFT+SHAPE\nKEY TRACK\nRaw: ${programData.shiftShapeNoise}\n(${this.percent1023String(programData.shiftShapeNoise)})`, x + 355, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shiftShapePercent));

      // SHAPE: RATE [240Hz...48.0kHz]
      shapeLabel = "RATE";
    } else if (programData.selectedMultiOscNoise === Enums.MultiOscNoise.PEAK) {
      // SHAPE: BANDWIDTH [110.0Hz...880.0Hz]
      shapeLabel = "BANDWIDTH";
    } else {
      // SHAPE: CUTOFF [10.0Hz...21.0kHz]
      shapeLabel = "CUTOFF";
    }

    // SHAPE knob
    const shapePercent = this.percentFromValue(programData.shapeNoise, 0, 1023);
    elements.push(...this.createKnob(`SHAPE\n${shapeLabel}\nRaw: ${programData.shapeNoise}\n(${this.percent1023String(programData.shapeNoise)})`, x + 510, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shapePercent));

    // Program Edit information
    const noiseSettings = this.getMultiEngineProgramEditLabel(programData);
    const lines = noiseSettings.split('\n');
    let lineIndex = 0;
    elements.push('<g>');
    lines.forEach((line) => {
      if (line.trim()) {
        const yPos = this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20 + (lineIndex * 20);
        const fontWeight = line.startsWith('**') ? 'bold' : 'normal';
        const cleanedLine = line.startsWith('**') ? line.substring(2) : line;
        elements.push(this.createText(cleanedLine, x + 80, yPos, "1.2em", fontWeight, "start"));
        lineIndex++;
      }
    });
    elements.push('</g>');

    elements.push('</g>');
    return { elements, title };
  }

  static generate(programData: ProgramData): string {
    const viewboxWidth = this.SYNTH_WIDTH + this.PADDING * 2;
    const viewboxHeight = this.SYNTH_HEIGHT + this.PADDING * 2;

    const svgElements: string[] = [];

    // XML declaration
    svgElements.push('<?xml version="1.0" encoding="utf-8"?>');

    // SVG root element
    svgElements.push(`<svg version="1.1" width="1900" preserveAspectRatio="xMidYMid meet" viewBox="0 0 ${viewboxWidth} ${viewboxHeight}" xmlns="${this.SVG_NAMESPACE}">`);

    // Background rectangle
    svgElements.push(`<rect x="${this.PADDING}" y="${this.PADDING}" width="${this.SYNTH_WIDTH}" height="${this.SYNTH_HEIGHT}" stroke="${this.STROKE_COLOR}" stroke-width="${this.PADDING}" fill="${this.BACKGROUND_COLOR}" rx="30" ry="30" />`);

    // Program title
    svgElements.push(this.createText(`Program: ${programData.programName || 'Untitled'}`, 30, 30, "3em", "bold"));

    // Korg Logo
    svgElements.push(...this.createLogo(35, 890));

    // Add main sections
    svgElements.push(...this.addVoiceModeSection(programData, 75));
    svgElements.push(...this.addOscillatorSection(programData, 400));
    svgElements.push(...this.addMultiEngineSection(programData, 400));
    svgElements.push(...this.addMixerSection(programData, 1070));
    svgElements.push(...this.addFilterSection(programData, 1215));
    svgElements.push(...this.addEnvelopeSection(programData, 1360));
    svgElements.push(...this.addLFOSection(programData, 1360));
    svgElements.push(...this.createDividerLine(1850));
    svgElements.push(...this.addEffectsSection(programData, 1860));
    svgElements.push(...this.addMiscSection(programData, 1860));

    svgElements.push('</svg>');

    return this.formatWithIndentation(svgElements);
  }

  private static createText(text: string, x: number, y: number, fontSize: string = "1.2em", fontWeight: string = "normal", textAnchor: string = "start"): string {
    // Handle newlines by creating multiple text elements
    if (text.includes('\n')) {
      const lines = text.split('\n');
      const elements: string[] = [];
      elements.push('<g>');
      lines.forEach((line, index) => {
        const yPos = y + (index * 20);
        const escapedLine = line.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const fontWeightAttr = fontWeight !== "normal" ? ` font-weight="${fontWeight}"` : "";
        elements.push(`<text x="${x}" y="${yPos}" dominant-baseline="hanging" text-anchor="${textAnchor}" font-family="Arial, sans-serif" font-size="${fontSize}"${fontWeightAttr} fill="${this.STROKE_COLOR}">${escapedLine}</text>`);
      });
      elements.push('</g>');
      return elements.join('');
    } else {
      const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const fontWeightAttr = fontWeight !== "normal" ? ` font-weight="${fontWeight}"` : "";
      return `<text x="${x}" y="${y}" dominant-baseline="hanging" text-anchor="${textAnchor}" font-family="Arial, sans-serif" font-size="${fontSize}"${fontWeightAttr} fill="${this.STROKE_COLOR}">${escapedText}</text>`;
    }
  }

  private static createLogo(x: number, y: number): string[] {
    const elements: string[] = [];

    // Korg logo SVG path (complex path from C# version)
    const korgPath = 'm 156.03997,1.1862376 h -22.7358 c -11.0293,0 -11.80454,10.7904014 -11.80454,10.7904014 v 29.967888 c 0.0158,9.625935 10.98025,10.864769 10.98025,10.864769 h 23.56009 V 24.833357 c 2.7055,0 2.51565,-5.045541 0,-5.045541 -2.27832,0 -14.98314,0 -14.98314,0 v 19.115786 c 0,3.553547 -5.1579,3.553547 -5.1579,0 0,-3.605772 0,-23.76737 0,-23.76737 0,-2.300473 2.57895,-2.58368 2.57895,-2.58368 h 17.56209 V 1.1862376 M 100.25106,19.272028 c 0,3.058334 -5.173688,3.395337 -5.173688,0 V 14.10466 c -0.142421,-3.547227 5.189508,-3.608932 5.173688,0 z m 12.3884,9.298415 -6.20209,-1.548945 c 4.84143,-1.272067 7.48364,-3.933277 7.56277,-8.300066 V 8.6604112 c 0,-1.7087456 -2.16758,-7.2162787 -9.11331,-7.4725899 H 80.616341 V 52.856765 H 95.077372 V 33.220439 c -0.332261,-1.015754 2.325808,-3.297241 3.069421,-0.314849 l 4.161107,19.951175 h 16.02737 L 112.63946,28.570443 M 59.935799,38.903602 c 0,3.229202 -5.157884,3.284585 -5.157884,0 v -23.76737 c 0,-3.251356 5.157884,-3.227625 5.157884,0 0,3.229212 0,20.541319 0,23.76737 z M 74.3652,11.884876 c 0,0 -0.506308,-10.4423256 -11.834646,-10.95811384 H 52.198982 C 50.869954,0.88093668 40.441876,2.391852 40.299476,12.812027 v 29.366664 c 0,0 0.901838,10.909063 11.899506,10.932794 h 10.331572 c 0,0 11.897916,-0.403469 11.88211,-11.880517 L 74.365184,11.884876 M 0,52.855174 V 1.1862376 H 14.476856 V 20.302021 c 0.237329,2.596339 2.879553,1.442938 3.069413,0.246819 L 20.678968,1.1862376 H 36.69211 l -5.679986,23.7673634 -6.202115,1.547361 6.708407,1.552111 5.695813,24.802101 H 21.186844 L 17.546269,31.921477 c -0.174043,-1.62014 -3.021944,-1.634381 -3.069413,0.265806 -0.04749,1.897023 0,20.667891 0,20.667891 H 0';

    elements.push(`<g>`);
    elements.push(`<path d="${korgPath}" stroke="none" fill="${this.STROKE_COLOR}" fill-rule="nonzero" transform="translate(${this.PADDING + x}, ${this.PADDING + y})" />`);
    elements.push(this.createText("minilogue xd", x + 190, y + 2, "3em", "bold"));
    elements.push(this.createText("POLYPHONIC ANALOGUE SYNTHESIZER", x + 190, y + 50, "1.5em"));
    elements.push(`</g>`);

    return elements;
  }

  private static createKnob(label: string, x: number, y: number, percent: number): string[] {
    const elements: string[] = [];
    const cx = x + this.KNOB_RADIUS;
    const cy = y + this.KNOB_RADIUS;

    // Wrap entire knob in group to match C# structure
    elements.push('<g>');

    // Knob circle
    elements.push(`<circle cx="${cx}" cy="${cy}" r="${this.KNOB_RADIUS}" stroke="${this.STROKE_COLOR}" fill="transparent" stroke-width="${this.STROKE_WIDTH}" />`);

    // Knob indicator
    if (percent >= 0 && percent <= 100) {
      const angle = this.percentToDegree(percent);
      elements.push(`<line stroke="${this.STROKE_COLOR}" stroke-width="${this.STROKE_WIDTH}" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + this.KNOB_RADIUS}" transform="rotate(${angle} ${cx} ${cy})" />`);
    }

    // Group for knob labels (to match C# structure)
    if (label) {
      elements.push('<g>');
      // Split label into separate lines and create individual text elements
      const lines = label.split('\n');
      lines.forEach((line, index) => {
        const yPos = cy + this.KNOB_DIAMETER + (index * 20);
        // Include empty lines to match C# structure
        elements.push(this.createText(line.trim(), cx, yPos, "1.2em", "normal", "middle"));
      });
      elements.push('</g>');
    }

    // Close entire knob group
    elements.push('</g>');

    return elements;
  }

  private static createSwitch(label: string, x: number, y: number, selectedIndex: number, options: string[]): string[] {

    const elements: string[] = [];
    const cx = x + this.LED_RADIUS;
    let currentY = y + this.LED_RADIUS;
    const yIncr = (this.LED_RADIUS * 3) + 2;

    elements.push('<g>');

    // Options (in reverse order to match C# code)
    for (let i = options.length - 1; i >= 0; i--) {
      const option = options[i];
      if (option) {
        const fill = i === selectedIndex ? this.SWITCH_ACTIVE_COLOR : "transparent";

        // LED circle
        elements.push(`<circle cx="${cx}" cy="${currentY}" r="${this.LED_RADIUS}" stroke="${this.STROKE_COLOR}" fill="${fill}" stroke-width="${this.STROKE_WIDTH}" />`);

        // Option label (handle multiline text)
        const labelX = cx + this.LED_RADIUS + 4;
        if (option.includes('\n')) {
          elements.push('<g>');
          const lines = option.split('\n');
          lines.forEach((line, index) => {
            const yPos = currentY - 8 + (index * 20);
            elements.push(this.createText(line.trim(), labelX, yPos));
          });
          elements.push('</g>');
        } else {
          elements.push(this.createText(option, labelX, currentY - 8));
        }
      }
      currentY += yIncr;
    }

    // Main label
    if (label) {
      const labelX = cx + this.LED_RADIUS + 8;
      if (label.includes('\n')) {
        elements.push('<g>');
        const lines = label.split('\n');
        lines.forEach((line, index) => {
          const yPos = currentY - 8 + (index * 20);
          elements.push(this.createText(line.trim(), labelX, yPos, "1.2em", "normal", "middle"));
        });
        elements.push('</g>');
      } else {
        elements.push(this.createText(label, labelX, currentY - 8, "1.2em", "normal", "middle"));
      }
    }

    elements.push('</g>');

    return elements;
  }

  private static addVoiceModeSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Outer group wrapper for entire voice mode section
    elements.push('<g>');

    // Octave switch
    elements.push(...this.addOctaveSwitch(programData, x - 20, this.FIRST_ROW_Y));

    // Vertical divider line
    elements.push(`<line stroke="${this.STROKE_COLOR}" stroke-width="2" x1="${x + 130}" y1="${this.FIRST_ROW_Y}" x2="${x + 130}" y2="${this.SYNTH_HEIGHT - 100}" />`);

    // Group for program level text section
    elements.push('<g>');

    // Helper function for signed values
    const scaleKeyToStr = (val: number, offset: number): string => {
      const valTransposed = val - offset;
      return valTransposed > 0 ? `+${valTransposed}` : valTransposed.toString();
    };

    // Left column - Program settings text
    const leftColumnText = [
      "Program Level",
      DisplayHelper.programLevelDecibel(programData.programLevel),
      "",
      "**ProgEdit / Pitch",
      "Microtuning",
      this.formatEnumForDisplay(Enums.MicroTuning[programData.microTuning]) || programData.microTuning.toString(),
      "",
      "Scale Key",
      scaleKeyToStr(programData.scaleKey, 12) + " Note(s)",
      "",
      "Program Tuning",
      scaleKeyToStr(programData.programTuning, 50) + " Cent",
      "",
      "Program Transpose",
      scaleKeyToStr(programData.programTranspose, 13) + " Note(s)",
      "",
      "**ProgEdit / Joystick",
      "X+ Bend Range",
      programData.bendRangePlus === 0 ? "Off" : `${programData.bendRangePlus} Note(s)`,
      "",
      "X- Bend Range",
      programData.bendRangeMinus === 0 ? "Off" : `${programData.bendRangeMinus} Note(s)`,
      "",
      "Y+ Assign",
      this.formatEnumForDisplay(Enums.AssignTarget[programData.joystickAssignPlus]) || programData.joystickAssignPlus.toString(),
      "",
      "Y+ Range",
      DisplayHelper.minusToPlus100String(programData.joystickRangePlus),
      "",
      "Y- Assign",
      this.formatEnumForDisplay(Enums.AssignTarget[programData.joystickAssignMinus]) || programData.joystickAssignMinus.toString(),
      "",
      "Y- Range",
      DisplayHelper.minusToPlus100String(programData.joystickRangeMinus)
    ];

    // Add left column text
    leftColumnText.forEach((line, index) => {
      const yPos = this.FIRST_ROW_Y + 90 + (index * 20);
      const fontWeight = line.startsWith('**') ? 'bold' : 'normal';
      const cleanedLine = line.startsWith('**') ? line.substring(2) : line;  // Remove ** prefix
      const textAnchor = "middle";  // Fix text alignment to match C#
      elements.push(this.createText(cleanedLine, x + 38, yPos, "1.2em", fontWeight, textAnchor));
    });

    // Close program level text section group
    elements.push('</g>');

    const secondX = x + 180;

    // Another vertical divider line
    elements.push(`<line stroke="${this.STROKE_COLOR}" stroke-width="2" x1="${secondX + 125}" y1="${this.FIRST_ROW_Y}" x2="${secondX + 125}" y2="${this.SYNTH_HEIGHT - 100}" />`);

    // Portamento knob with detailed info
    const portamentoPercent = Math.round(this.percentFromValue(programData.portamento, 0, 127) * 100) / 100;
    const portamentoLabel = [
      "PORTAMENTO",
      `${portamentoPercent}%`,
      `Raw: ${programData.portamento}`,
      `Mode: ${this.formatEnumForDisplay(Enums.PortamentoMode[programData.portamentoMode]) || programData.portamentoMode}`,
      `BPM Sync: ${programData.portamentoBpmSync ? "On" : "Off"}`
    ].join('\n');
    elements.push(...this.createKnob(portamentoLabel, secondX, this.FIRST_ROW_Y, portamentoPercent));

    // Voice mode depth knob with detailed info
    const secondRowY = this.FIRST_ROW_Y + this.ROW_SPACING;
    const vmDepthPercent = this.percentFromValue(programData.voiceModeDepth, 0, 1023);
    const vmDepthLabel = DisplayHelper.voiceModeDepthLabel(programData.voiceModeType, programData.voiceModeDepth);
    const vmDepthKnobLabel = [
      "VOICE MODE",
      "DEPTH",
      "",
      vmDepthLabel,
      `Raw: ${programData.voiceModeDepth}`,
      `(${DisplayHelper.percent1023String(programData.voiceModeDepth)})`
    ].join('\n');
    elements.push(...this.createKnob(vmDepthKnobLabel, secondX, secondRowY, vmDepthPercent));

    // Voice mode type switch
    const thirdRowY = this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20;
    const voiceModes = ["ARP/\nLATCH", "CHORD", "UNISON", "POLY"];
    elements.push(...this.createSwitch("", secondX - 10, thirdRowY, programData.voiceModeType - 1, voiceModes));
    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static addOctaveSwitch(programData: ProgramData, x: number, y: number): string[] {
    const elements: string[] = [];

    // Inner group wrapper for octave circles and text
    elements.push('<g>');

    const cx = x + this.LED_RADIUS;
    const cy = y + this.LED_RADIUS;

    for (let i = 0; i < 5; i++) {
      const offset = i * ((this.LED_RADIUS + 2) * 2);
      const fill = programData.octave === i ? this.SWITCH_ACTIVE_COLOR : "transparent";

      elements.push(`<circle cx="${cx + offset}" cy="${cy}" r="${this.LED_RADIUS}" stroke="${this.STROKE_COLOR}" fill="${fill}" stroke-width="${this.STROKE_WIDTH}" />`);
    }

    // Group for octave text labels
    elements.push('<g>');

    const octaveDisplay = programData.octave - 2;
    const sign = octaveDisplay >= 0 && octaveDisplay > 0 ? "+" : "";  // Fixed: no + for 0
    elements.push(this.createText("OCTAVE", x + 58, y + 40, "1.2em", "normal", "middle"));
    elements.push(this.createText(`(${sign}${octaveDisplay})`, x + 58, y + 60, "1.2em", "normal", "middle"));

    // Close octave text group
    elements.push('</g>');

    // Close inner group wrapper
    elements.push('</g>');

    return elements;
  }

  private static addOscillatorSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Outer group wrapper for entire oscillator section
    elements.push('<g>');

    elements.push(this.createText("VCO 1", x + 315, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em", "bold", "middle"));
    const secondRowY = this.FIRST_ROW_Y + this.ROW_SPACING;
    elements.push(this.createText("VCO 2", x + 315, secondRowY - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    // VCO 1
    const pitch1Percent = this.percentFromValue(programData.vco1Pitch, 0, 1023);
    elements.push(...this.createKnob(`PITCH\n${this.pitchCents(programData.vco1Pitch)} Cent\nRaw: ${programData.vco1Pitch}\n(${this.percent1023String(programData.vco1Pitch)})`, x + 200, this.FIRST_ROW_Y, pitch1Percent));

    const shape1Percent = this.percentFromValue(programData.vco1Shape, 0, 1023);
    elements.push(...this.createKnob(`SHAPE\nRaw: ${programData.vco1Shape}\n(${this.percent1023String(programData.vco1Shape)})`, x + 355, this.FIRST_ROW_Y, shape1Percent));

    // VCO 1 wave and octave switches
    elements.push('<g>');
    const waveOptions = ["SQR", "TRI", "SAW"];
    elements.push(...this.createSwitch("WAVE", x, this.FIRST_ROW_Y, programData.vco1Wave, waveOptions));

    const octaveOptions = ["16'", "8'", "4'", "2'"];
    elements.push(...this.createSwitch("OCTAVE", x + 100, this.FIRST_ROW_Y, programData.vco1Octave, octaveOptions));
    elements.push('</g>');
    // VCO 2

    const pitch2Percent = this.percentFromValue(programData.vco2Pitch, 0, 1023);
    elements.push(...this.createKnob(`PITCH\n${this.pitchCents(programData.vco2Pitch)} Cent\nRaw: ${programData.vco2Pitch}\n(${this.percent1023String(programData.vco2Pitch)})`, x + 200, secondRowY, pitch2Percent));

    const shape2Percent = this.percentFromValue(programData.vco2Shape, 0, 1023);
    elements.push(...this.createKnob(`SHAPE\nRaw: ${programData.vco2Shape}\n(${this.percent1023String(programData.vco2Shape)})`, x + 355, secondRowY, shape2Percent));

    const crossModPercent = this.percentFromValue(programData.crossModDepth, 0, 1023);
    const crossModLabel = [
      "CROSS MOD",
      "DEPTH",
      `Raw: ${programData.crossModDepth}`,
      `(${this.percent1023String(programData.crossModDepth)})`
    ].join('\n');
    elements.push(...this.createKnob(crossModLabel, x + 510, secondRowY, crossModPercent));

    // VCO 2 wave and octave switches
    elements.push('<g>');
    elements.push(...this.createSwitch("WAVE", x, secondRowY, programData.vco2Wave, waveOptions));
    elements.push(...this.createSwitch("OCTAVE", x + 100, secondRowY, programData.vco2Octave, octaveOptions));
    elements.push('</g>');

        // Sync and Ring switches
    const syncOptions = ["Off", "On"];
    elements.push(...this.createSwitch("SYNC", x + 490, this.FIRST_ROW_Y, programData.oscillatorSync ? 1 : 0, syncOptions));
    elements.push(...this.createSwitch("RING", x + 580, this.FIRST_ROW_Y, programData.ringMod ? 1 : 0, syncOptions));

    // Add divider line
    elements.push(...this.createDividerLine(x + 650));

    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static addMultiEngineSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Outer group wrapper for entire multi-engine section
    elements.push('<g>');

    // Multi Engine Type Switch
    const multiOscTypes = ["Noise", "VPM", "USR"];
    elements.push(...this.createSwitch("", x, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, programData.multiOscType, multiOscTypes));

    // Multi Engine knobs - create separate group for each type like C# does
    let title = "???";
    if (programData.multiOscType === Enums.MultiOscType.USER) {
      const { elements: userElements, title: userTitle } = this.createMultiEngineUserSection(programData, x);
      elements.push(...userElements);
      title = userTitle;
    } else if (programData.multiOscType === Enums.MultiOscType.VPM) {
      const { elements: vpmElements, title: vpmTitle } = this.createMultiEngineVPMSection(programData, x);
      elements.push(...vpmElements);
      title = vpmTitle;
    } else if (programData.multiOscType === Enums.MultiOscType.NOISE) {
      const { elements: noiseElements, title: noiseTitle } = this.createMultiEngineNoiseSection(programData, x);
      elements.push(...noiseElements);
      title = noiseTitle;
    }

    // Multi Engine Title
    elements.push(this.createText(`MULTI ENGINE: ${title}`, x + 315, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20 - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static addMixerSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Outer group wrapper for entire mixer section
    elements.push('<g>');

    elements.push(this.createText("MIXER", x + this.KNOB_RADIUS, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    const vco1Percent = this.percentFromValue(programData.vco1Level, 0, 1023);
    elements.push(...this.createKnob(`VCO 1\nRaw: ${programData.vco1Level}\n(${this.percent1023String(programData.vco1Level)})`, x, this.FIRST_ROW_Y, vco1Percent));

    const vco2Percent = this.percentFromValue(programData.vco2Level, 0, 1023);
    elements.push(...this.createKnob(`VCO 2\nRaw: ${programData.vco2Level}\n(${this.percent1023String(programData.vco2Level)})`, x, this.FIRST_ROW_Y + this.ROW_SPACING, vco2Percent));

    const multiPercent = this.percentFromValue(programData.multiLevel, 0, 1023);
    elements.push(...this.createKnob(`MULTI\nRaw: ${programData.multiLevel}\n(${this.percent1023String(programData.multiLevel)})`, x, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, multiPercent));

    // Add divider line
    elements.push(...this.createDividerLine(x + 90));

    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static addFilterSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Outer group wrapper for entire filter section
    elements.push('<g>');

    elements.push(this.createText("FILTER", x + this.KNOB_RADIUS, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    const cutoffPercent = this.percentFromValue(programData.filterCutoff, 0, 1023);
    elements.push(...this.createKnob(`CUTOFF\nRaw: ${programData.filterCutoff}\n(${this.percent1023String(programData.filterCutoff)})`, x, this.FIRST_ROW_Y, cutoffPercent));

    const resonancePercent = this.percentFromValue(programData.filterResonance, 0, 1023);
    elements.push(...this.createKnob(`RESONANCE\nRaw: ${programData.filterResonance}\n(${this.percent1023String(programData.filterResonance)})`, x, this.FIRST_ROW_Y + this.ROW_SPACING, resonancePercent));

    // Drive and Key Track switches
    const driveOptions = ["0%", "50%", "100%"];
    elements.push(...this.createSwitch("DRIVE", x - this.KNOB_RADIUS - 5, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, programData.filterCutoffDrive, driveOptions));
    elements.push(...this.createSwitch("KEY\nTRACK", x + this.KNOB_RADIUS + 5, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, programData.filterCutoffKeyboardTrack, driveOptions));

    // Add divider line
    elements.push(...this.createDividerLine(x + 125));

    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static addEnvelopeSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];
    const spacing = 120;

    // Outer group wrapper for entire envelope section
    elements.push('<g>');

    // Amp EG
    elements.push(this.createText("AMP EG", x + 220, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    const ampAttackPercent = this.percentFromValue(programData.ampEgAttack, 0, 1023);
    elements.push(...this.createKnob(`ATTACK\nRaw: ${programData.ampEgAttack}`, x, this.FIRST_ROW_Y, ampAttackPercent));

    const ampDecayPercent = this.percentFromValue(programData.ampEgDecay, 0, 1023);
    elements.push(...this.createKnob(`DECAY\nRaw: ${programData.ampEgDecay}`, x + spacing, this.FIRST_ROW_Y, ampDecayPercent));

    const ampSustainPercent = this.percentFromValue(programData.ampEgSustain, 0, 1023);
    elements.push(...this.createKnob(`SUSTAIN\nRaw: ${programData.ampEgSustain}`, x + spacing * 2, this.FIRST_ROW_Y, ampSustainPercent));

    const ampReleasePercent = this.percentFromValue(programData.ampEgRelease, 0, 1023);
    elements.push(...this.createKnob(`RELEASE\nRaw: ${programData.ampEgRelease}`, x + spacing * 3, this.FIRST_ROW_Y, ampReleasePercent));

    // Amp EG Program Edit Information
    const ampEgProgramEditInfo = [
      `Program Edit / Modulation / Amp Velocity: ${programData.ampVelocity}`
    ];

    ampEgProgramEditInfo.forEach((line, index) => {
      const yPos = this.FIRST_ROW_Y + this.KNOB_DIAMETER + 110 + (index * 20);
      elements.push(this.createText(line, x, yPos, "1.2em", "normal", "start"));
    });

    // EG
    const secondRowY = this.FIRST_ROW_Y + this.ROW_SPACING;
    elements.push(this.createText("EG", x + 220, secondRowY - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    const egAttackPercent = this.percentFromValue(programData.egAttack, 0, 1023);
    elements.push(...this.createKnob(`ATTACK\nRaw: ${programData.egAttack}`, x, secondRowY, egAttackPercent));

    const egDecayPercent = this.percentFromValue(programData.egDecay, 0, 1023);
    elements.push(...this.createKnob(`DECAY\nRaw: ${programData.egDecay}`, x + spacing, secondRowY, egDecayPercent));

    const egIntPercent = this.percentFromValue(programData.egInt, 0, 1023);
    const egIntPercentValue = DisplayHelper.egIntPercent(programData.egInt);
    // Format EG INT percentage to match C# version (remove decimal for whole numbers)
    const egIntDisplay = Math.abs(egIntPercentValue) < 0.1 ? "0%" : `${egIntPercentValue.toFixed(1)}%`;
    elements.push(...this.createKnob(`EG INT\n${egIntDisplay}\nRaw: ${programData.egInt}`, x + spacing * 2, secondRowY, egIntPercent));

    // EG Target switch
    const egTargets = ["Cutoff", "Pitch 2", "Pitch"];
    elements.push(...this.createSwitch("TARGET", x + spacing * 3, secondRowY, programData.egTarget, egTargets));

    // EG Program Edit Information - create separate text elements to match C# structure
    const egProgramEditY = secondRowY + this.KNOB_DIAMETER + 110;
    elements.push('<g>');
    elements.push(this.createText(`Program Edit / Modulation / EG Cutoff Velocity: ${programData.cutoffVelocity}`, x, egProgramEditY, "1.2em", "normal", "start"));
    elements.push(this.createText(`Program Edit / Other / EG Legato: ${programData.egLegato ? "On" : "Off"}`, x, egProgramEditY + 20, "1.2em", "normal", "start"));
    elements.push('</g>');



    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static addLFOSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Outer group wrapper for entire LFO section
    elements.push('<g>');

    // LFO Section
    elements.push(this.createText("LFO", x + 220, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20 - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    // LFO Wave Switch
    const lfoWaveOptions = ["SQR", "TRI", "SAW"];
    elements.push(...this.createSwitch("WAVE", x, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, programData.lfoWave, lfoWaveOptions));

    // LFO Mode Switch
    const lfoModeOptions = ["1-Shot", "Normal", "BPM"];
    elements.push(...this.createSwitch("MODE", x + 90, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, programData.lfoMode, lfoModeOptions));

    // LFO Rate Knob
    const lfoRatePercent = this.percentFromValue(programData.lfoRate, 0, 1023);
    const lfoRateString = DisplayHelper.lfoRate(programData.lfoRate, programData.lfoMode);
    elements.push(...this.createKnob(`RATE\n${lfoRateString}\nRaw: ${programData.lfoRate}`, x + 200, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, lfoRatePercent));

    // LFO Int Knob
    const lfoIntPercent = this.percentFromValue(programData.lfoInt, 0, 1023);
    elements.push(...this.createKnob(`INT\n${programData.lfoInt - 512}\nRaw: ${programData.lfoInt}`, x + 300, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, lfoIntPercent));

    // LFO Target Switch
    const lfoTargets = ["Cutoff", "Shape", "Pitch"];
    elements.push(...this.createSwitch("TARGET", x + 400, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, programData.lfoTarget, lfoTargets));

    // LFO Program Edit Information - wrap in group to match C# structure
    elements.push('<g>');
    const lfoProgramEditInfo = [
      "**Program Edit / LFO",
      `LFO Target Osc: ${programData.lfoTargetOsc === 0 ? "All" : programData.lfoTargetOsc}`,
      `LFO Key Sync: ${programData.lfoKeySync ? "On" : "Off"}`,
      `LFO Voice Sync: ${programData.lfoVoiceSync ? "On" : "Off"}`
    ];

    lfoProgramEditInfo.forEach((line, index) => {
      const yPos = this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20 + this.KNOB_DIAMETER + 100 + (index * 20);
      const fontWeight = line.startsWith('**') ? 'bold' : 'normal';
      const cleanedLine = line.startsWith('**') ? line.substring(2) : line;
      elements.push(this.createText(cleanedLine, x, yPos, "1.2em", fontWeight, "start"));
    });
    elements.push('</g>');

    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static createDividerLine(x: number): string[] {
    const elements: string[] = [];
    const lineY1 = this.FIRST_ROW_Y;
    const lineY2 = this.SYNTH_HEIGHT - 100;
    elements.push(`<line stroke="${this.STROKE_COLOR}" stroke-width="2" x1="${x}" y1="${lineY1}" x2="${x}" y2="${lineY2}" />`);
    return elements;
  }

  private static addEffectsSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Outer group wrapper for entire effects section
    elements.push('<g>');

    elements.push(this.createText("EFFECTS", x + 120, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em", "bold", "start"));

    // Add each effect section wrapped in its own group to match C# structure
    elements.push(...this.createModFxSection(programData, x, this.FIRST_ROW_Y));
    elements.push(...this.createReverbFxSection(programData, x, this.FIRST_ROW_Y + this.ROW_SPACING));
    elements.push(...this.createDelayFxSection(programData, x, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20));

    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static createModFxSection(programData: ProgramData, x: number, y: number): string[] {
    const elements: string[] = [];

    // Wrap MOD FX section in group to match C# structure
    elements.push('<g>');

    const modFxStatus = programData.modFxOnOff ? "On" : "Off";
    let modFxType = Enums.ModFxType[programData.modFxType] || programData.modFxType.toString();

    // Format MOD FX type to match C# version (e.g., "Chorus / Stereo")
    if (programData.modFxType === Enums.ModFxType.CHORUS) {
      modFxType = "Chorus / Stereo";
    } else if (programData.modFxType === Enums.ModFxType.ENSEMBLE) {
      modFxType = "Ensemble / Stereo";
    } else if (programData.modFxType === Enums.ModFxType.FLANGER) {
      modFxType = "Flanger / Stereo";
    } else if (programData.modFxType === Enums.ModFxType.PHASER) {
      modFxType = "Phaser / Stereo";
    }

    elements.push(this.createText(`MOD FX (${modFxStatus}): ${modFxType}`, x, y, "1.6em"));

    const modFxTimePercent = this.percentFromValue(programData.modFxTime, 0, 1023);
    elements.push(...this.createKnob(`MOD FX\nTIME\nRaw: ${programData.modFxTime}`, x + 20, y + 40, modFxTimePercent));

    const modFxDepthPercent = this.percentFromValue(programData.modFxDepth, 0, 1023);
    elements.push(...this.createKnob(`MOD FX\nDEPTH\nRaw: ${programData.modFxDepth}`, x + 140, y + 40, modFxDepthPercent));

    // Close MOD FX group
    elements.push('</g>');

    return elements;
  }

  private static createReverbFxSection(programData: ProgramData, x: number, y: number): string[] {
    const elements: string[] = [];

    // Wrap REVERB FX section in group to match C# structure
    elements.push('<g>');

    const reverbStatus = programData.reverbOnOff ? "On" : "Off";
    let reverbType = Enums.ReverbSubType[programData.reverbSubType] || programData.reverbSubType.toString();

    // Format REVERB FX type to match C# version (e.g., "Hall")
    if (programData.reverbSubType === Enums.ReverbSubType.HALL) {
      reverbType = "Hall";
    }

    elements.push(this.createText(`REVERB FX (${reverbStatus}): ${reverbType}`, x, y, "1.6em"));

    const reverbTimePercent = this.percentFromValue(programData.reverbTime, 0, 1023);
    elements.push(...this.createKnob(`REVERB FX\nTIME\nRaw: ${programData.reverbTime}`, x + 20, y + 40, reverbTimePercent));

    const reverbDepthPercent = this.percentFromValue(programData.reverbDepth, 0, 1023);
    elements.push(...this.createKnob(`REVERB FX\nDEPTH\nRaw: ${programData.reverbDepth}`, x + 140, y + 40, reverbDepthPercent));

    // Add REVERB FX DRY/WET knob
    const reverbDryWetPercent = this.percentFromValue(programData.reverbDryWet, 0, 1024);
    elements.push(...this.createKnob(`REVERB FX\nDRY/WET\nRaw: ${programData.reverbDryWet}`, x + 260, y + 40, reverbDryWetPercent));

    // Close REVERB FX group
    elements.push('</g>');

    return elements;
  }

  private static createDelayFxSection(programData: ProgramData, x: number, y: number): string[] {
    const elements: string[] = [];

    // Wrap DELAY FX section in group to match C# structure
    elements.push('<g>');

    const delayStatus = programData.delayOnOff ? "On" : "Off";
    let delayType = Enums.DelaySubType[programData.delaySubType] || programData.delaySubType.toString();

    // Format DELAY FX type to match C# version (e.g., "Stereo")
    if (programData.delaySubType === Enums.DelaySubType.STEREO) {
      delayType = "Stereo";
    }

    elements.push(this.createText(`DELAY FX (${delayStatus}): ${delayType}`, x, y, "1.6em"));

    const delayTimePercent = this.percentFromValue(programData.delayTime, 0, 1023);
    elements.push(...this.createKnob(`DELAY FX\nTIME\nRaw: ${programData.delayTime}`, x + 20, y + 40, delayTimePercent));

    const delayDepthPercent = this.percentFromValue(programData.delayDepth, 0, 1023);
    elements.push(...this.createKnob(`DELAY FX\nDEPTH\nRaw: ${programData.delayDepth}`, x + 140, y + 40, delayDepthPercent));

    // Add DELAY FX DRY/WET knob
    const delayDryWetPercent = this.percentFromValue(programData.delayDryWet, 0, 1024);
    elements.push(...this.createKnob(`DELAY FX\nDRY/WET\nRaw: ${programData.delayDryWet}`, x + 260, y + 40, delayDryWetPercent));

    // Close DELAY FX group
    elements.push('</g>');

    return elements;
  }

  private static addMiscSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Misc Section - wrap in a group
    elements.push('<g>');

    // CV Input and Program Edit Info - wrap in its own group to match C# structure
    elements.push('<g>');
    const cvInputInfo = [
      "**Program Edit / CV Input",
      `CV IN Mode: ${this.formatEnumForDisplay(Enums.CVInMode[programData.cvInMode] || programData.cvInMode.toString())}`,
      `CV IN 1 Assign: ${this.formatAssignTarget(programData.cvIn1Assign)} | Range: ${DisplayHelper.minusToPlus100String(programData.cvIn1Range)}`,
      `CV IN 2 Assign: ${this.formatAssignTarget(programData.cvIn2Assign)} | Range: ${DisplayHelper.minusToPlus100String(programData.cvIn2Range)}`,
      `Modulation / MIDI Aftertouch: ${this.formatAssignTarget(programData.midiAfterTouchAssign)}`,
      `Key Trigger Transpose (SHIFT+PLAY): ${programData.keyTrig ? "On" : "Off"}`
    ];

    cvInputInfo.forEach((line, index) => {
      const yPos = this.SYNTH_HEIGHT - 130 + (index * 20);
      const fontWeight = line.startsWith('**') ? 'bold' : 'normal';
      const cleanedLine = line.startsWith('**') ? line.substring(2) : line;
      elements.push(this.createText(cleanedLine, x, yPos, "1.2em", fontWeight, "start"));
    });
    elements.push('</g>');

    elements.push('</g>');

    return elements;
  }

  private static percentFromValue(value: number, minVal: number, maxVal: number): number {
    if (maxVal === minVal) {
      return 0.0;
    }
    const flooredValue = value - minVal;
    const rangeVal = maxVal - minVal;
    const percentFactor = rangeVal / 100.0;
    return flooredValue / percentFactor;
  }

  private static percentToDegree(percent: number): number {
    percent = Math.max(0, Math.min(100, percent));

    // Knob rotation range (matches Python implementation)
    const minAngle = 35;
    const maxAngle = 360 - minAngle;
    const steps = (maxAngle - minAngle) / 100.0;
    const result = minAngle + (steps * percent);
    return Math.round(result * 100) / 100;
  }

  private static percent1023String(value: number): string {
    const percent = this.percentFromValue(value, 0, 1023);
    // Format like C# - show no decimals for integers, up to 2 decimals for non-integers
    return percent % 1 === 0 ? `${percent}%` : `${percent.toFixed(2)}%`;
  }

  private static pitchCents(value: number): string {
    // comment copied from C# version:

    /// Korg lists the same value as the end of one and start of the next section,
    /// so that's not a mistake here.
    ///
    ///    0 ~    4 : -1200        (Cent)
    ///    4 ~  356 : -1200 ~ -256 (Cent)
    ///  356 ~  476 :  -256 ~  -16 (Cent)
    ///  476 ~  492 :   -16 ~    0 (Cent)
    ///  492 ~  532 :     0        (Cent)
    ///  532 ~  548 :     0 ~   16 (Cent)
    ///  548 ~  668 :    16 ~  256 (Cent)
    ///  668 ~ 1020 :   256 ~ 1200 (Cent)
    /// 1020 ~ 1023 :  1200        (Cent)
    ///
    /// Thanks to gekart on GitHub:
    /// https://gist.github.com/gekart/b187d3c16e6160571ccfcf6c597fea3f#file-mnlgxd-py-L386
    ///
    /// That said, I'm not sure if those values are really correct in the Korg manual.
    /// For example, the Replicant XD Preset has a VCO2 Pitch of 553 (0x2902) which
    /// is +26 Cent according to the table, but the display on the Minilogue XD shows
    /// it's more like +10 Cent.
    ///
    /// So, need to do some more testing to see if the values in the MIDI Implementation
    /// Manual are wrong/outdated.
    if (value >= 0 && value <= 4) return "-1200";
    if (value >= 4 && value <= 356) return `${((value - 356) * 944 / 352 - 256).toFixed(0)}`;
    if (value >= 356 && value <= 476) return `${((value - 476) * 2 - 16).toFixed(0)}`;
    if (value >= 476 && value <= 492) return `${value - 492}`;
    if (value >= 492 && value <= 532) return "0";
    if (value >= 532 && value <= 548) return `+${value - 532}`;
    if (value >= 548 && value <= 668) return `+${((value - 548) * 2 + 16).toFixed(0)}`;
    if (value >= 668 && value <= 1020) return `+${((value - 668) * 944 / 352 + 256).toFixed(0)}`;
    if (value >= 1020 && value <= 1023) return "+1200";
    return "???";
  }

  private static formatWithIndentation(elements: string[]): string {
    const lines: string[] = [];
    let indentLevel = 0;
    const indentSize = '  '; // 2 spaces

    for (const element of elements) {
      const trimmed = element.trim();
      if (!trimmed) continue;

      // Handle closing tags
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add the element with proper indentation
      const indent = indentSize.repeat(indentLevel);
      lines.push(indent + trimmed);

      // Handle opening tags (but not self-closing ones or XML declaration)
      if (trimmed.startsWith('<') &&
          !trimmed.startsWith('</') &&
          !trimmed.endsWith('/>') &&
          !trimmed.startsWith('<?')) {
        // Special handling: only increase indent for actual group tags, not text/svg elements
        if (trimmed.startsWith('<g>') ||
            trimmed.startsWith('<svg ') ||
            (trimmed.includes('<g') && !trimmed.includes('>'))) {
          indentLevel++;
        }
      }
    }

    return lines.join('\n');
  }
}