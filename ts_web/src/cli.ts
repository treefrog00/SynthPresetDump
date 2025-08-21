#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { BinaryParser } from './binary-parser';
import { JsonGenerator } from './json-generator';
import { SvgGenerator } from './svg-generator';

// Simple File mock for Node.js environment
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

async function parseFile(inputPath: string, outputDir: string): Promise<void> {
    try {
        console.log(`📁 Reading: ${inputPath}`);

        // Read the input file
        const data = fs.readFileSync(inputPath);
        const fileName = path.basename(inputPath);

        // Create mock file for parser
        const mockFile = new MockFile(data, fileName);

        const programData = await BinaryParser.parseFile(mockFile as any);

        const jsonOutput = JsonGenerator.generate(programData);
        const svgOutput = SvgGenerator.generate(programData);

        // Ensure output directory exists
        fs.mkdirSync(outputDir, { recursive: true });

        // Write output files
        const jsonPath = path.join(outputDir, 'output.json');
        const svgPath = path.join(outputDir, 'output.svg');

        fs.writeFileSync(jsonPath, jsonOutput);
        fs.writeFileSync(svgPath, svgOutput);

        console.log(`💾 JSON saved to: ${jsonPath}`);
        console.log(`💾 SVG saved to: ${svgPath}`);

    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

// Main execution
async function main() {
    const inputPath = process.argv[2];
    const outputDir = process.argv[3];

    if (!inputPath || !outputDir) {
        console.log('🎹 Minilogue XD TypeScript Parser CLI');
        console.log('');
        console.log('Usage: tsx src/cli.ts <input-file> <output-dir>');
        console.log('');
        console.log('Examples:');
        console.log('  tsx src/cli.ts ../copyrighted_data/replicant/replicant.mnlgxdprog ./test-temp/replicant/');
        console.log('  tsx src/cli.ts test-program.mnlgxdprog ./output/');
        process.exit(1);
    }

    await parseFile(inputPath, outputDir);
}

if (require.main === module) {
    main().catch(console.error);
}

export { parseFile };