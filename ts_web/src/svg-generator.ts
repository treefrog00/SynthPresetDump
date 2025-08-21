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

    return svgElements.join('\n');
  }

  private static createText(text: string, x: number, y: number, fontSize: string = "1.2em", fontWeight: string = "normal", textAnchor: string = "start"): string {
    const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const fontWeightAttr = fontWeight !== "normal" ? ` font-weight="${fontWeight}"` : "";
    return `<text x="${x}" y="${y}" dominant-baseline="hanging" text-anchor="${textAnchor}" font-family="Arial, sans-serif" font-size="${fontSize}"${fontWeightAttr} fill="${this.STROKE_COLOR}">${escapedText}</text>`;
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

    return elements;
  }

  private static createSwitch(label: string, x: number, y: number, selectedIndex: number, options: string[]): string[] {

    const elements: string[] = [];
    const cx = x + this.LED_RADIUS;
    let currentY = y + this.LED_RADIUS;
    const yIncr = (this.LED_RADIUS * 3) + 2;

    elements.push('<g>');

    // Options (in reverse order to match Python code)
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
      elements.push(this.createText(label, labelX, currentY - 8, "1.2em", "normal", "middle"));
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

    // Group for portamento knob
    elements.push('<g>');

    // Portamento knob with detailed info
    const portamentoPercent = Math.round(this.percentFromValue(programData.portamento, 0, 127) * 100) / 100;
    const portamentoLabel = [
      "PORTAMENTO",
      `${portamentoPercent}%`,
      `Raw: ${programData.portamento}`,
      `Mode: ${Enums.PortamentoMode[programData.portamentoMode] || programData.portamentoMode}`,
      `BPM Sync: ${programData.portamentoBpmSync ? "On" : "Off"}`
    ].join('\n');
    elements.push(...this.createKnob(portamentoLabel, secondX, this.FIRST_ROW_Y, portamentoPercent));

    // Close portamento group
    elements.push('</g>');

    // Group for voice mode depth knob
    elements.push('<g>');

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

    // Close voice mode depth group
    elements.push('</g>');

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
    elements.push('<g>');
    const pitch1Percent = this.percentFromValue(programData.vco1Pitch, 0, 1023);
    elements.push(...this.createKnob(`PITCH\n${this.pitchCents(programData.vco1Pitch)} Cent\nRaw: ${programData.vco1Pitch}\n(${this.percent1023String(programData.vco1Pitch)})`, x + 200, this.FIRST_ROW_Y, pitch1Percent));
    elements.push('</g>');

    elements.push('<g>');
    const shape1Percent = this.percentFromValue(programData.vco1Shape, 0, 1023);
    elements.push(...this.createKnob(`SHAPE\nRaw: ${programData.vco1Shape}\n(${this.percent1023String(programData.vco1Shape)})`, x + 355, this.FIRST_ROW_Y, shape1Percent));
    elements.push('</g>');

    // VCO 1 wave and octave switches
    const waveOptions = ["SQR", "TRI", "SAW"];
    elements.push(...this.createSwitch("WAVE", x, this.FIRST_ROW_Y, programData.vco1Wave, waveOptions));

    const octaveOptions = ["16'", "8'", "4'", "2'"];
    elements.push(...this.createSwitch("OCTAVE", x + 100, this.FIRST_ROW_Y, programData.vco1Octave, octaveOptions));
    elements.push('</g>');
    // VCO 2

    elements.push('<g>');
    const pitch2Percent = this.percentFromValue(programData.vco2Pitch, 0, 1023);
    elements.push(...this.createKnob(`PITCH\n${this.pitchCents(programData.vco2Pitch)} Cent\nRaw: ${programData.vco2Pitch}\n(${this.percent1023String(programData.vco2Pitch)})`, x + 200, secondRowY, pitch2Percent));

    const shape2Percent = this.percentFromValue(programData.vco2Shape, 0, 1023);
    elements.push(...this.createKnob(`SHAPE\nRaw: ${programData.vco2Shape}\n(${this.percent1023String(programData.vco2Shape)})`, x + 355, secondRowY, shape2Percent));

    const crossModPercent = this.percentFromValue(programData.crossModDepth, 0, 1023);
    elements.push(...this.createKnob(`CROSS MOD DEPTH ${crossModPercent.toFixed(1)}%`, x + 510, secondRowY, crossModPercent));

    // VCO 2 wave and octave switches
    elements.push('<g>');
    elements.push(...this.createSwitch("WAVE", x, secondRowY, programData.vco2Wave, waveOptions));
    elements.push(...this.createSwitch("OCTAVE", x + 100, secondRowY, programData.vco2Octave, octaveOptions));
    elements.push('</g>');

        // Sync and Ring switches
    const syncOptions = ["Off", "On"];
    elements.push(...this.createSwitch("SYNC", x + 490, this.FIRST_ROW_Y, programData.oscillatorSync ? 1 : 0, syncOptions));
    elements.push(...this.createSwitch("RING", x + 580, this.FIRST_ROW_Y, programData.ringMod ? 1 : 0, syncOptions));
    elements.push('</g>');

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

    // Multi Engine Title
    let title = "???";
    if (programData.multiOscType === Enums.MultiOscType.USER) {
      title = `User (#${programData.selectedMultiOscUser + 1})`;
    } else if (programData.multiOscType === Enums.MultiOscType.VPM) {
      title = `VPM / ${Enums.MultiOscVPM[programData.selectedMultiOscVpm] || programData.selectedMultiOscVpm}`;
    } else if (programData.multiOscType === Enums.MultiOscType.NOISE) {
      title = `Noise / ${Enums.MultiOscNoise[programData.selectedMultiOscNoise] || programData.selectedMultiOscNoise}`;
    }

    elements.push(this.createText(`MULTI ENGINE: ${title}`, x + 315, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20 - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    // Multi Engine Knobs based on type
    if (programData.multiOscType === Enums.MultiOscType.USER) {
      // User oscillator knobs
      const shiftShapePercent = this.percentFromValue(programData.shiftShapeUser, 0, 1023);
      elements.push(...this.createKnob(`SHIFT+SHAPE\nRaw: ${programData.shiftShapeUser}\n(${this.percent1023String(programData.shiftShapeUser)})`, x + 355, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shiftShapePercent));

      const shapePercent = this.percentFromValue(programData.shapeUser, 0, 1023);
      elements.push(...this.createKnob(`SHAPE\nRaw: ${programData.shapeUser}\n(${this.percent1023String(programData.shapeUser)})`, x + 510, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shapePercent));
    } else if (programData.multiOscType === Enums.MultiOscType.VPM) {
      // VPM oscillator knobs
      const shapePercent = this.percentFromValue(programData.shapeVpm, 0, 1023);
      elements.push(...this.createKnob(`SHAPE\nMOD DEPTH\nRaw: ${programData.shapeVpm}\n(${this.percent1023String(programData.shapeVpm)})`, x + 510, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shapePercent));

      const shiftShapePercent = this.percentFromValue(programData.shiftShapeVpm, 0, 1023);
      elements.push(...this.createKnob(`SHIFT+SHAPE\nRATIO OFFSET\nRaw: ${programData.shiftShapeVpm}\n(${this.percent1023String(programData.shiftShapeVpm)})`, x + 355, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shiftShapePercent));
    } else if (programData.multiOscType === Enums.MultiOscType.NOISE) {
      // Noise oscillator knobs
      const shiftShapePercent = this.percentFromValue(programData.shiftShapeNoise, 0, 1023);
      elements.push(...this.createKnob(`SHIFT+SHAPE\nKEY TRACK\nRaw: ${programData.shiftShapeNoise}\n(${this.percent1023String(programData.shiftShapeNoise)})`, x + 355, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shiftShapePercent));

      const shapePercent = this.percentFromValue(programData.shapeNoise, 0, 1023);
      let shapeLabel = "RATE";
      if (programData.selectedMultiOscNoise === Enums.MultiOscNoise.PEAK) {
        shapeLabel = "BANDWIDTH";
      } else if (programData.selectedMultiOscNoise !== Enums.MultiOscNoise.DECIM) {
        shapeLabel = "CUTOFF";
      }
      elements.push(...this.createKnob(`SHAPE\n${shapeLabel}\nRaw: ${programData.shapeNoise}\n(${this.percent1023String(programData.shapeNoise)})`, x + 510, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, shapePercent));
    }

    // Add divider line
    elements.push(...this.createDividerLine(x + 650));

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
    elements.push(...this.createKnob(`VCO 1 ${vco1Percent.toFixed(1)}%`, x, this.FIRST_ROW_Y, vco1Percent));

    const vco2Percent = this.percentFromValue(programData.vco2Level, 0, 1023);
    elements.push(...this.createKnob(`VCO 2 ${vco2Percent.toFixed(1)}%`, x, this.FIRST_ROW_Y + this.ROW_SPACING, vco2Percent));

    const multiPercent = this.percentFromValue(programData.multiLevel, 0, 1023);
    elements.push(...this.createKnob(`MULTI\nRaw: ${programData.multiLevel}\n(${this.percent1023String(programData.multiLevel)})`, x, this.FIRST_ROW_Y + this.ROW_SPACING * 2, multiPercent));

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
    elements.push(...this.createKnob(`CUTOFF ${cutoffPercent.toFixed(1)}%`, x, this.FIRST_ROW_Y, cutoffPercent));

    const resonancePercent = this.percentFromValue(programData.filterResonance, 0, 1023);
    elements.push(...this.createKnob(`RESONANCE ${resonancePercent.toFixed(1)}%`, x, this.FIRST_ROW_Y + this.ROW_SPACING, resonancePercent));

    // Drive and Key Track switches
    const driveOptions = ["0%", "50%", "100%"];
    elements.push(...this.createSwitch("DRIVE", x - this.KNOB_RADIUS - 5, this.FIRST_ROW_Y + this.ROW_SPACING * 2, programData.filterCutoffDrive, driveOptions));
    elements.push(...this.createSwitch("KEY TRACK", x + this.KNOB_RADIUS + 5, this.FIRST_ROW_Y + this.ROW_SPACING * 2, programData.filterCutoffKeyboardTrack, driveOptions));

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
    elements.push(...this.createKnob(`ATTACK ${ampAttackPercent.toFixed(1)}%`, x, this.FIRST_ROW_Y, ampAttackPercent));

    const ampDecayPercent = this.percentFromValue(programData.ampEgDecay, 0, 1023);
    elements.push(...this.createKnob(`DECAY ${ampDecayPercent.toFixed(1)}%`, x + spacing, this.FIRST_ROW_Y, ampDecayPercent));

    const ampSustainPercent = this.percentFromValue(programData.ampEgSustain, 0, 1023);
    elements.push(...this.createKnob(`SUSTAIN ${ampSustainPercent.toFixed(1)}%`, x + spacing * 2, this.FIRST_ROW_Y, ampSustainPercent));

    const ampReleasePercent = this.percentFromValue(programData.ampEgRelease, 0, 1023);
    elements.push(...this.createKnob(`RELEASE ${ampReleasePercent.toFixed(1)}%`, x + spacing * 3, this.FIRST_ROW_Y, ampReleasePercent));

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
    elements.push(...this.createKnob(`ATTACK ${egAttackPercent.toFixed(1)}%`, x, secondRowY, egAttackPercent));

    const egDecayPercent = this.percentFromValue(programData.egDecay, 0, 1023);
    elements.push(...this.createKnob(`DECAY ${egDecayPercent.toFixed(1)}%`, x + spacing, secondRowY, egDecayPercent));

    const egIntPercent = this.percentFromValue(programData.egInt, 0, 1023);
    elements.push(...this.createKnob(`EG INT\n${egIntPercent.toFixed(1)}%\nRaw: ${programData.egInt}`, x + spacing * 2, secondRowY, egIntPercent));

    // EG Target switch
    const egTargets = ["Cutoff", "Pitch 2", "Pitch"];
    elements.push(...this.createSwitch("TARGET", x + spacing * 3, secondRowY, programData.egTarget, egTargets));

    // EG Program Edit Information
    const egProgramEditInfo = [
      `Program Edit / Modulation / EG Cutoff Velocity: ${programData.cutoffVelocity}`,
      `Program Edit / Other / EG Legato: ${programData.egLegato ? "On" : "Off"}`
    ];

    egProgramEditInfo.forEach((line, index) => {
      const yPos = secondRowY + this.KNOB_DIAMETER + 110 + (index * 20);
      elements.push(this.createText(line, x, yPos, "1.2em", "normal", "start"));
    });



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
    elements.push(...this.createKnob(`RATE\n${lfoRatePercent.toFixed(1)}%\nRaw: ${programData.lfoRate}`, x + 200, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, lfoRatePercent));

    // LFO Int Knob
    const lfoIntPercent = this.percentFromValue(programData.lfoInt, 0, 1023);
    elements.push(...this.createKnob(`INT\n${programData.lfoInt - 512}\nRaw: ${programData.lfoInt}`, x + 300, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, lfoIntPercent));

    // LFO Target Switch
    const lfoTargets = ["Cutoff", "Shape", "Pitch"];
    elements.push(...this.createSwitch("TARGET", x + 400, this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20, programData.lfoTarget, lfoTargets));

    // LFO Program Edit Information
    const lfoProgramEditInfo = [
      "**Program Edit / LFO",
      `LFO Target Osc: ${programData.lfoTargetOsc}`,
      `LFO Key Sync: ${programData.lfoKeySync ? "On" : "Off"}`,
      `LFO Voice Sync: ${programData.lfoVoiceSync ? "On" : "Off"}`
    ];

    lfoProgramEditInfo.forEach((line, index) => {
      const yPos = this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20 + this.KNOB_DIAMETER + 100 + (index * 20);
      const fontWeight = line.startsWith('**') ? 'bold' : 'normal';
      const cleanedLine = line.startsWith('**') ? line.substring(2) : line;
      elements.push(this.createText(cleanedLine, x, yPos, "1.2em", fontWeight, "start"));
    });

    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static createDividerLine(y: number): string[] {
    const elements: string[] = [];
    elements.push(`<line stroke="${this.STROKE_COLOR}" stroke-width="2" x1="0" y1="${y}" x2="${this.SYNTH_WIDTH}" y2="${y}" />`);
    return elements;
  }

  private static addEffectsSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Outer group wrapper for entire effects section
    elements.push('<g>');

    elements.push(this.createText("EFFECTS", x + 120, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    // Mod FX
    const modFxStatus = programData.modFxOnOff ? "On" : "Off";
    const modFxType = Enums.ModFxType[programData.modFxType] || programData.modFxType.toString();
    elements.push(this.createText(`MOD FX (${modFxStatus}): ${modFxType}`, x, this.FIRST_ROW_Y, "1.6em"));

    const modFxTimePercent = this.percentFromValue(programData.modFxTime, 0, 1023);
    elements.push(...this.createKnob(`MOD FX TIME ${modFxTimePercent.toFixed(1)}%`, x + 20, this.FIRST_ROW_Y + 40, modFxTimePercent));

    const modFxDepthPercent = this.percentFromValue(programData.modFxDepth, 0, 1023);
    elements.push(...this.createKnob(`MOD FX DEPTH ${modFxDepthPercent.toFixed(1)}%`, x + 140, this.FIRST_ROW_Y + 40, modFxDepthPercent));

    // Reverb FX
    const secondRowY = this.FIRST_ROW_Y + this.ROW_SPACING;
    const reverbStatus = programData.reverbOnOff ? "On" : "Off";
    const reverbType = Enums.ReverbSubType[programData.reverbSubType] || programData.reverbSubType.toString();
    elements.push(this.createText(`REVERB FX (${reverbStatus}): ${reverbType}`, x, secondRowY, "1.6em"));

    const reverbTimePercent = this.percentFromValue(programData.reverbTime, 0, 1023);
    elements.push(...this.createKnob(`REVERB FX TIME ${reverbTimePercent.toFixed(1)}%`, x + 20, secondRowY + 40, reverbTimePercent));

    const reverbDepthPercent = this.percentFromValue(programData.reverbDepth, 0, 1023);
    elements.push(...this.createKnob(`REVERB FX DEPTH ${reverbDepthPercent.toFixed(1)}%`, x + 140, secondRowY + 40, reverbDepthPercent));

    // Delay FX
    const thirdRowY = this.FIRST_ROW_Y + this.ROW_SPACING * 2;
    const delayStatus = programData.delayOnOff ? "On" : "Off";
    const delayType = Enums.DelaySubType[programData.delaySubType] || programData.delaySubType.toString();
    elements.push(this.createText(`DELAY FX (${delayStatus}): ${delayType}`, x, thirdRowY, "1.6em"));

    const delayTimePercent = this.percentFromValue(programData.delayTime, 0, 1023);
    elements.push(...this.createKnob(`DELAY FX TIME ${delayTimePercent.toFixed(1)}%`, x + 20, thirdRowY + 40, delayTimePercent));

    const delayDepthPercent = this.percentFromValue(programData.delayDepth, 0, 1023);
    elements.push(...this.createKnob(`DELAY FX DEPTH ${delayDepthPercent.toFixed(1)}%`, x + 140, thirdRowY + 40, delayDepthPercent));

    // Close outer group wrapper
    elements.push('</g>');

    return elements;
  }

  private static addMiscSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];

    // Misc Section
    elements.push(this.createText("MISC", x + 120, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em", "bold", "middle"));

    // CV Input and Program Edit Info
    const cvInputInfo = [
      "**Program Edit / CV Input",
      `CV IN Mode: ${Enums.CVInMode[programData.cvInMode] || programData.cvInMode}`,
      `CV IN 1 Assign: ${Enums.AssignTarget[programData.cvIn1Assign] || programData.cvIn1Assign} | Range: ${DisplayHelper.minusToPlus100String(programData.cvIn1Range)}`,
      `CV IN 2 Assign: ${Enums.AssignTarget[programData.cvIn2Assign] || programData.cvIn2Assign} | Range: ${DisplayHelper.minusToPlus100String(programData.cvIn2Range)}`,
      `Modulation / MIDI Aftertouch: ${Enums.AssignTarget[programData.midiAfterTouchAssign] || programData.midiAfterTouchAssign}`,
      `Key Trigger Transpose (SHIFT+PLAY): ${programData.keyTrig ? "On" : "Off"}`
    ];

    cvInputInfo.forEach((line, index) => {
      const yPos = this.SYNTH_HEIGHT - 130 + (index * 20);
      const fontWeight = line.startsWith('**') ? 'bold' : 'normal';
      const cleanedLine = line.startsWith('**') ? line.substring(2) : line;
      elements.push(this.createText(cleanedLine, x, yPos, "1.2em", fontWeight, "start"));
    });

    // Close Misc Section
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
    return `${this.percentFromValue(value, 0, 1023).toFixed(2)}%`;
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
}