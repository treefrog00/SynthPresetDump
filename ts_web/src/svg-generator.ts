import { ProgramData } from './program-data';
import * as Enums from './enums';

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

  static generate(programData: ProgramData): string {
    const viewboxWidth = this.SYNTH_WIDTH + this.PADDING * 2;
    const viewboxHeight = this.SYNTH_HEIGHT + this.PADDING * 2;
    
    const svgElements: string[] = [];
    
    // SVG root element
    svgElements.push(`<svg xmlns="${this.SVG_NAMESPACE}" version="1.1" width="1900" preserveAspectRatio="xMidYMid meet" viewBox="0 0 ${viewboxWidth} ${viewboxHeight}">`);
    
    // Background rectangle
    svgElements.push(`<rect x="${this.PADDING}" y="${this.PADDING}" width="${this.SYNTH_WIDTH}" height="${this.SYNTH_HEIGHT}" stroke="${this.STROKE_COLOR}" stroke-width="${this.PADDING}" fill="${this.BACKGROUND_COLOR}" rx="30" ry="30"/>`);
    
    // Program title
    svgElements.push(this.createText(`Program: ${programData.programName || 'Untitled'}`, 30, 30, "3em", "bold"));
    
    // Logo placeholder
    svgElements.push(this.createText("minilogue xd", 35 + this.PADDING, 890 + this.PADDING, "2em", "bold"));
    svgElements.push(this.createText("POLYPHONIC ANALOGUE SYNTHESIZER", 35 + this.PADDING, 930 + this.PADDING, "1.2em"));
    
    // Add main sections
    svgElements.push(...this.addVoiceModeSection(programData, 75));
    svgElements.push(...this.addOscillatorSection(programData, 400));
    svgElements.push(...this.addMixerSection(programData, 1070));
    svgElements.push(...this.addFilterSection(programData, 1215));
    svgElements.push(...this.addEnvelopeSection(programData, 1360));
    svgElements.push(...this.addEffectsSection(programData, 1860));
    
    svgElements.push('</svg>');
    
    return svgElements.join('\n');
  }

  private static createText(text: string, x: number, y: number, fontSize: string = "1.2em", fontWeight: string = "normal", textAnchor: string = "start"): string {
    const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}" dominant-baseline="hanging" fill="${this.STROKE_COLOR}">${escapedText}</text>`;
  }

  private static createKnob(label: string, x: number, y: number, percent: number): string[] {
    const elements: string[] = [];
    const cx = x + this.KNOB_RADIUS;
    const cy = y + this.KNOB_RADIUS;
    
    // Knob circle
    elements.push(`<circle cx="${cx}" cy="${cy}" r="${this.KNOB_RADIUS}" stroke="${this.STROKE_COLOR}" stroke-width="${this.STROKE_WIDTH}" fill="transparent"/>`);
    
    // Knob indicator
    if (percent >= 0 && percent <= 100) {
      const angle = this.percentToDegree(percent);
      elements.push(`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + this.KNOB_RADIUS}" stroke="${this.STROKE_COLOR}" stroke-width="${this.STROKE_WIDTH}" transform="rotate(${angle} ${cx} ${cy})"/>`);
    }
    
    // Label
    if (label) {
      const escapedLabel = label.replace(/\n/g, ' ').replace(/\\/g, '');
      elements.push(this.createText(escapedLabel, cx, cy + this.KNOB_DIAMETER, "1.2em", "normal", "middle"));
    }
    
    return elements;
  }

  private static createSwitch(label: string, x: number, y: number, selectedIndex: number, options: string[]): string[] {
    const elements: string[] = [];
    const cx = x + this.LED_RADIUS;
    let currentY = y + this.LED_RADIUS;
    const yIncr = (this.LED_RADIUS * 3) + 2;
    
    // Options (in reverse order to match Python code)
    for (let i = options.length - 1; i >= 0; i--) {
      const option = options[i];
      if (option) {
        const fill = i === selectedIndex ? this.SWITCH_ACTIVE_COLOR : "transparent";
        
        // LED circle
        elements.push(`<circle cx="${cx}" cy="${currentY}" r="${this.LED_RADIUS}" stroke="${this.STROKE_COLOR}" stroke-width="${this.STROKE_WIDTH}" fill="${fill}"/>`);
        
        // Option label
        const labelX = cx + this.LED_RADIUS + 4;
        elements.push(this.createText(option, labelX, currentY - 8));
      }
      currentY += yIncr;
    }
    
    // Main label
    if (label) {
      const labelX = cx + this.LED_RADIUS + 8;
      elements.push(this.createText(label, labelX, currentY - 8, "1.2em", "normal", "middle"));
    }
    
    return elements;
  }

  private static addVoiceModeSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];
    
    // Octave switch
    elements.push(...this.addOctaveSwitch(programData, x - 20, this.FIRST_ROW_Y));
    
    // Portamento knob
    const portamentoPercent = this.percentFromValue(programData.portamento, 0, 127);
    elements.push(...this.createKnob(`PORTAMENTO ${portamentoPercent.toFixed(1)}%`, x + 180, this.FIRST_ROW_Y, portamentoPercent));
    
    // Voice mode depth knob
    const vmDepthPercent = this.percentFromValue(programData.voiceModeDepth, 0, 1023);
    elements.push(...this.createKnob(`VOICE MODE DEPTH ${vmDepthPercent.toFixed(1)}%`, x + 180, this.FIRST_ROW_Y + this.ROW_SPACING, vmDepthPercent));
    
    // Voice mode type switch
    const voiceModes = ["ARP/LATCH", "CHORD", "UNISON", "POLY"];
    elements.push(...this.createSwitch("", x + 170, this.FIRST_ROW_Y + this.ROW_SPACING * 2, programData.voiceModeType - 1, voiceModes));
    
    return elements;
  }

  private static addOctaveSwitch(programData: ProgramData, x: number, y: number): string[] {
    const elements: string[] = [];
    const cx = x + this.LED_RADIUS;
    const cy = y + this.LED_RADIUS;
    
    for (let i = 0; i < 5; i++) {
      const offset = i * ((this.LED_RADIUS + 2) * 2);
      const fill = programData.octave === i ? this.SWITCH_ACTIVE_COLOR : "transparent";
      
      elements.push(`<circle cx="${cx + offset}" cy="${cy}" r="${this.LED_RADIUS}" stroke="${this.STROKE_COLOR}" stroke-width="${this.STROKE_WIDTH}" fill="${fill}"/>`);
    }
    
    const octaveDisplay = programData.octave - 2;
    const sign = octaveDisplay >= 0 ? "+" : "";
    elements.push(this.createText(`OCTAVE (${sign}${octaveDisplay})`, x + 58, y + 40, "1.2em", "normal", "middle"));
    
    return elements;
  }

  private static addOscillatorSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];
    
    // VCO 1
    elements.push(this.createText("**VCO 1", x + 315, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em"));
    
    const pitch1Percent = this.percentFromValue(programData.vco1Pitch, 0, 1023);
    elements.push(...this.createKnob(`PITCH ${pitch1Percent.toFixed(1)}%`, x + 200, this.FIRST_ROW_Y, pitch1Percent));
    
    const shape1Percent = this.percentFromValue(programData.vco1Shape, 0, 1023);
    elements.push(...this.createKnob(`SHAPE ${shape1Percent.toFixed(1)}%`, x + 355, this.FIRST_ROW_Y, shape1Percent));
    
    // VCO 1 wave and octave switches
    const waveOptions = ["", "SQR", "TRI", "SAW"];
    elements.push(...this.createSwitch("WAVE", x, this.FIRST_ROW_Y, programData.vco1Wave, waveOptions));
    
    const octaveOptions = ["16'", "8'", "4'", "2'"];
    elements.push(...this.createSwitch("OCTAVE", x + 100, this.FIRST_ROW_Y, programData.vco1Octave, octaveOptions));
    
    // VCO 2
    const secondRowY = this.FIRST_ROW_Y + this.ROW_SPACING;
    elements.push(this.createText("**VCO 2", x + 315, secondRowY - this.HEADER_OFFSET, "1.6em"));
    
    const pitch2Percent = this.percentFromValue(programData.vco2Pitch, 0, 1023);
    elements.push(...this.createKnob(`PITCH ${pitch2Percent.toFixed(1)}%`, x + 200, secondRowY, pitch2Percent));
    
    const shape2Percent = this.percentFromValue(programData.vco2Shape, 0, 1023);
    elements.push(...this.createKnob(`SHAPE ${shape2Percent.toFixed(1)}%`, x + 355, secondRowY, shape2Percent));
    
    const crossModPercent = this.percentFromValue(programData.crossModDepth, 0, 1023);
    elements.push(...this.createKnob(`CROSS MOD DEPTH ${crossModPercent.toFixed(1)}%`, x + 510, secondRowY, crossModPercent));
    
    // VCO 2 wave and octave switches
    elements.push(...this.createSwitch("WAVE", x, secondRowY, programData.vco2Wave, waveOptions));
    elements.push(...this.createSwitch("OCTAVE", x + 100, secondRowY, programData.vco2Octave, octaveOptions));
    
    // Sync and Ring switches
    const syncOptions = ["Off", "On"];
    elements.push(...this.createSwitch("SYNC", x + 490, this.FIRST_ROW_Y, programData.oscillatorSync ? 1 : 0, syncOptions));
    elements.push(...this.createSwitch("RING", x + 580, this.FIRST_ROW_Y, programData.ringMod ? 1 : 0, syncOptions));
    
    return elements;
  }

  private static addMixerSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];
    
    elements.push(this.createText("**MIXER", x + this.KNOB_RADIUS, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em"));
    
    const vco1Percent = this.percentFromValue(programData.vco1Level, 0, 1023);
    elements.push(...this.createKnob(`VCO 1 ${vco1Percent.toFixed(1)}%`, x, this.FIRST_ROW_Y, vco1Percent));
    
    const vco2Percent = this.percentFromValue(programData.vco2Level, 0, 1023);
    elements.push(...this.createKnob(`VCO 2 ${vco2Percent.toFixed(1)}%`, x, this.FIRST_ROW_Y + this.ROW_SPACING, vco2Percent));
    
    const multiPercent = this.percentFromValue(programData.multiLevel, 0, 1023);
    elements.push(...this.createKnob(`MULTI ${multiPercent.toFixed(1)}%`, x, this.FIRST_ROW_Y + this.ROW_SPACING * 2, multiPercent));
    
    return elements;
  }

  private static addFilterSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];
    
    elements.push(this.createText("**FILTER", x + this.KNOB_RADIUS, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em"));
    
    const cutoffPercent = this.percentFromValue(programData.filterCutoff, 0, 1023);
    elements.push(...this.createKnob(`CUTOFF ${cutoffPercent.toFixed(1)}%`, x, this.FIRST_ROW_Y, cutoffPercent));
    
    const resonancePercent = this.percentFromValue(programData.filterResonance, 0, 1023);
    elements.push(...this.createKnob(`RESONANCE ${resonancePercent.toFixed(1)}%`, x, this.FIRST_ROW_Y + this.ROW_SPACING, resonancePercent));
    
    // Drive and Key Track switches
    const driveOptions = ["0%", "50%", "100%"];
    elements.push(...this.createSwitch("DRIVE", x - this.KNOB_RADIUS - 5, this.FIRST_ROW_Y + this.ROW_SPACING * 2, programData.filterCutoffDrive, driveOptions));
    elements.push(...this.createSwitch("KEY TRACK", x + this.KNOB_RADIUS + 5, this.FIRST_ROW_Y + this.ROW_SPACING * 2, programData.filterCutoffKeyboardTrack, driveOptions));
    
    return elements;
  }

  private static addEnvelopeSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];
    const spacing = 120;
    
    // Amp EG
    elements.push(this.createText("**AMP EG", x + 220, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em"));
    
    const ampAttackPercent = this.percentFromValue(programData.ampEgAttack, 0, 1023);
    elements.push(...this.createKnob(`ATTACK ${ampAttackPercent.toFixed(1)}%`, x, this.FIRST_ROW_Y, ampAttackPercent));
    
    const ampDecayPercent = this.percentFromValue(programData.ampEgDecay, 0, 1023);
    elements.push(...this.createKnob(`DECAY ${ampDecayPercent.toFixed(1)}%`, x + spacing, this.FIRST_ROW_Y, ampDecayPercent));
    
    const ampSustainPercent = this.percentFromValue(programData.ampEgSustain, 0, 1023);
    elements.push(...this.createKnob(`SUSTAIN ${ampSustainPercent.toFixed(1)}%`, x + spacing * 2, this.FIRST_ROW_Y, ampSustainPercent));
    
    const ampReleasePercent = this.percentFromValue(programData.ampEgRelease, 0, 1023);
    elements.push(...this.createKnob(`RELEASE ${ampReleasePercent.toFixed(1)}%`, x + spacing * 3, this.FIRST_ROW_Y, ampReleasePercent));
    
    // EG
    const secondRowY = this.FIRST_ROW_Y + this.ROW_SPACING;
    elements.push(this.createText("**EG", x + 220, secondRowY - this.HEADER_OFFSET, "1.6em"));
    
    const egAttackPercent = this.percentFromValue(programData.egAttack, 0, 1023);
    elements.push(...this.createKnob(`ATTACK ${egAttackPercent.toFixed(1)}%`, x, secondRowY, egAttackPercent));
    
    const egDecayPercent = this.percentFromValue(programData.egDecay, 0, 1023);
    elements.push(...this.createKnob(`DECAY ${egDecayPercent.toFixed(1)}%`, x + spacing, secondRowY, egDecayPercent));
    
    const egIntPercent = this.percentFromValue(programData.egInt, 0, 1023);
    elements.push(...this.createKnob(`EG INT ${egIntPercent.toFixed(1)}%`, x + spacing * 2, secondRowY, egIntPercent));
    
    // EG Target switch
    const egTargets = ["Cutoff", "Pitch 2", "Pitch"];
    elements.push(...this.createSwitch("TARGET", x + spacing * 3, secondRowY, programData.egTarget, egTargets));
    
    // LFO
    const thirdRowY = this.FIRST_ROW_Y + this.ROW_SPACING * 2 + 20;
    elements.push(this.createText("**LFO", x + 220, thirdRowY - this.HEADER_OFFSET, "1.6em"));
    
    const lfoWaveOptions = ["SQR", "TRI", "SAW"];
    elements.push(...this.createSwitch("WAVE", x, thirdRowY, programData.lfoWave, lfoWaveOptions));
    
    const lfoModeOptions = ["1-Shot", "Normal", "BPM"];
    elements.push(...this.createSwitch("MODE", x + 90, thirdRowY, programData.lfoMode, lfoModeOptions));
    
    const lfoRatePercent = this.percentFromValue(programData.lfoRate, 0, 1023);
    elements.push(...this.createKnob(`RATE ${lfoRatePercent.toFixed(1)}%`, x + 200, thirdRowY, lfoRatePercent));
    
    const lfoIntPercent = this.percentFromValue(programData.lfoInt, 0, 1023);
    elements.push(...this.createKnob(`INT ${lfoIntPercent.toFixed(1)}%`, x + 300, thirdRowY, lfoIntPercent));
    
    const lfoTargets = ["Cutoff", "Shape", "Pitch"];
    elements.push(...this.createSwitch("TARGET", x + 400, thirdRowY, programData.lfoTarget, lfoTargets));
    
    return elements;
  }

  private static addEffectsSection(programData: ProgramData, x: number): string[] {
    const elements: string[] = [];
    
    elements.push(this.createText("**EFFECTS", x + 120, this.FIRST_ROW_Y - this.HEADER_OFFSET, "1.6em"));
    
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
}