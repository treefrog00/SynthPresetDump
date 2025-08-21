import { ProgramData } from './program-data';

export class JsonGenerator {
  static generate(programData: ProgramData): string {
    const serialized = this.serializeProgramData(programData);
    return JSON.stringify(serialized, null, 2);
  }

  private static serializeProgramData(programData: ProgramData): Record<string, any> {
    const programResult: Record<string, any> = {};

    for (const [key, value] of Object.entries(programData)) {
      if (typeof value === 'object' && value !== null && 'valueOf' in value) {
        // Handle enum types
        programResult[key] = value.valueOf();
      } else {
        // Handle primitive types
        programResult[key] = value;
      }
    }

    const sequencerResult: Record<string, any> = {};
    const userUnitDescriptions: Record<string, any> = {};
    const userUnitMappings: Record<string, any> = {};

    return {
      "program": programResult,
      "sequencerV2": sequencerResult,
      "userUnitDescriptions": userUnitDescriptions,
      "userUnitMappings": userUnitMappings
    };
  }
}