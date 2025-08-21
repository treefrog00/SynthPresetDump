import * as Enums from './enums';

export class DisplayHelper {
  static programLevelDecibel(programLevel: number): string {
    // 12~132=-18dB~+6dB - Python formula: (value - 12) / 5.0 - 18.0
    const db = (programLevel - 12) / 5.0 - 18.0;
    const symbol = db === 0 ? "" : db > 0 ? "+" : "";
    
    return `${symbol}${db.toFixed(1)} dB`;
  }

  static pitchCents(value: number): string {
    if (value >= 0 && value <= 4) return "-1200";
    if (value >= 4 && value <= 356) return `${Math.round((value - 356) * 944 / 352 - 256)}`;
    if (value >= 356 && value <= 476) return `${(value - 476) * 2 - 16}`;
    if (value >= 476 && value <= 492) return `${value - 492}`;
    if (value >= 492 && value <= 532) return "0";
    if (value >= 532 && value <= 548) return `+${value - 532}`;
    if (value >= 548 && value <= 668) return `+${(value - 548) * 2 + 16}`;
    if (value >= 668 && value <= 1020) return `+${Math.round((value - 668) * 944 / 352 + 256)}`;
    if (value >= 1020 && value <= 1023) return "+1200";
    return "???";
  }

  static egIntPercent(egIntVal: number): number {
    const valDouble = egIntVal;
    
    if (egIntVal <= 11) return -100;
    if (egIntVal > 11 && egIntVal < 492) {
      return -((492 - valDouble) * (492 - valDouble) * 4641 * 100) / 0x40000000;
    }
    if (egIntVal >= 492 && egIntVal <= 532) return 0;
    if (egIntVal > 532 && egIntVal < 1013) {
      return ((valDouble - 532) * (valDouble - 532) * 4641 * 100) / 0x40000000;
    }
    return 100;
  }

  static lfoRate(lfoRate: number, lfoMode: Enums.LFOMode): string {
    if (lfoMode !== Enums.LFOMode.BPM) {
      return lfoRate.toString();
    }

    if (lfoRate <= 63) return "4";
    if (lfoRate <= 127) return "2";
    if (lfoRate <= 191) return "1";
    if (lfoRate <= 255) return "3/4";
    if (lfoRate <= 319) return "1/2";
    if (lfoRate <= 383) return "3/8";
    if (lfoRate <= 447) return "1/3";
    if (lfoRate <= 511) return "1/4";
    if (lfoRate <= 575) return "3/16";
    if (lfoRate <= 639) return "1/6";
    if (lfoRate <= 703) return "1/8";
    if (lfoRate <= 767) return "1/12";
    if (lfoRate <= 831) return "1/16";
    if (lfoRate <= 895) return "1/24";
    if (lfoRate <= 959) return "1/32";
    if (lfoRate <= 1023) return "1/36";
    return "???";
  }

  static voiceModeDepthLabel(voiceModeType: Enums.VoiceModeType, voiceModeDepth: number): string {
    switch (voiceModeType) {
      case Enums.VoiceModeType.POLY:
        if (voiceModeDepth <= 255) return "Poly";
        return "Duo";
      
      case Enums.VoiceModeType.UNISON:
        return `${Math.round(voiceModeDepth * 50 / 1023 * 10) / 10} Cent`;
      
      case Enums.VoiceModeType.CHORD:
        // Chord type mappings from Python version
        const chordRanges = [
          [0, 73, "5th"],
          [74, 146, "sus2"],
          [147, 219, "m"],
          [220, 292, "Maj"],
          [293, 365, "sus4"],
          [366, 438, "m7"],
          [439, 511, "7"],
          [512, 585, "7sus4"],
          [586, 658, "Maj7"],
          [659, 731, "aug"],
          [732, 804, "dim"],
          [805, 877, "m7b5"],
          [878, 950, "mMaj7"],
          [951, 1023, "Maj7b5"]
        ];
        
        for (const range of chordRanges) {
          const [min, max, label] = range;
          if (voiceModeDepth >= (min as number) && voiceModeDepth <= (max as number)) {
            return label as string;
          }
        }
        return "???";
      
      case Enums.VoiceModeType.ARP:
        // Arp type mappings from Python version
        const arpRanges = [
          [0, 78, "MANUAL 1"],
          [79, 156, "MANUAL 2"],
          [157, 234, "RISE 1"],
          [235, 312, "RISE 2"],
          [313, 390, "FALL 1"],
          [391, 468, "FALL 2"],
          [469, 546, "RISE FALL 1"],
          [547, 624, "RISE FALL 2"],
          [625, 702, "POLY 1"],
          [703, 780, "POLY 2"],
          [781, 858, "RANDOM 1"],
          [859, 936, "RANDOM 2"],
          [937, 1023, "RANDOM 3"]
        ];
        
        for (const range of arpRanges) {
          const [min, max, label] = range;
          if (voiceModeDepth >= (min as number) && voiceModeDepth <= (max as number)) {
            return label as string;
          }
        }
        return "???";
      
      default:
        return voiceModeDepth.toString();
    }
  }

  static minusToPlus100String(value: number): string {
    const signed = value - 100;
    return `${signed}%`;  // No + prefix for positive values to match C#
  }

  static percent1023String(value: number): string {
    const percent = value * 100 / 1023;
    // Round to 1 decimal place to match C# precision
    const rounded = Math.round(percent * 10) / 10;
    return `${rounded}%`;
  }
}