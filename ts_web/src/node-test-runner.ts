// Node.js test runner for TypeScript parser
import * as fs from 'fs';
import { BinaryParser } from './binary-parser';
import { JsonGenerator } from './json-generator';
import { SvgGenerator } from './svg-generator';

// Mock File class for Node.js environment
class MockFile {
    name: string;
    private data: Uint8Array;

    constructor(data: Buffer, name: string) {
        this.data = new Uint8Array(data);
        this.name = name;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        const buffer = this.data.buffer.slice(this.data.byteOffset, this.data.byteOffset + this.data.byteLength);
        return buffer as ArrayBuffer;
    }
}

export async function parseFileForTest(filePath: string): Promise<{ json: string, svg: string }> {
    const data = fs.readFileSync(filePath);
    const fileName = filePath.split('/').pop() || 'unknown';
    
    const mockFile = new MockFile(data, fileName);
    
    try {
        // Parse the file using our TypeScript parser
        const programData = await BinaryParser.parseFile(mockFile as any);
        
        // Generate outputs
        const jsonOutput = JsonGenerator.generate(programData);
        const svgOutput = SvgGenerator.generate(programData);
        
        return {
            json: jsonOutput,
            svg: svgOutput
        };
    } catch (error) {
        throw new Error(`Failed to parse ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Export for use in test script
if (require.main === module) {
    const filePath = process.argv[2];
    const outputDir = process.argv[3];
    
    if (!filePath || !outputDir) {
        console.error('Usage: node node-test-runner.js <input-file> <output-dir>');
        process.exit(1);
    }
    
    parseFileForTest(filePath)
        .then(({ json, svg }) => {
            fs.mkdirSync(outputDir, { recursive: true });
            fs.writeFileSync(`${outputDir}/output.json`, json);
            fs.writeFileSync(`${outputDir}/output.svg`, svg);
            console.log('✅ Generated outputs successfully');
        })
        .catch((error) => {
            console.error('❌ Error:', error.message);
            process.exit(1);
        });
}