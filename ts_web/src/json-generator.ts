import { ProgramData } from './program-data';

export class JsonGenerator {
  static generate(programData: ProgramData): string {
    const serialized = this.serializeProgramData(programData);
    return JSON.stringify(serialized, null, 2);
  }

  private static serializeProgramData(programData: ProgramData): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(programData)) {
      if (typeof value === 'object' && value !== null && 'valueOf' in value) {
        // Handle enum types
        result[key] = value.valueOf();
      } else {
        // Handle primitive types
        result[key] = value;
      }
    }

    return result;
  }
}