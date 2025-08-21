#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function runComparison(testFolder: string): Promise<void> {
    console.log(`\n🔍 Testing folder: ${testFolder}`);

    const copyrightedDataPath = path.join('..', 'copyrighted_data', testFolder);
    const tempPath = path.join('test-temp', testFolder);

    // Create temp directory
    fs.mkdirSync(tempPath, { recursive: true });

    // Find the input file (.mnlgxdprog or .mnlgxdlib)
    const inputFiles = fs.readdirSync(copyrightedDataPath).filter(f =>
        f.endsWith('.mnlgxdprog') || f.endsWith('.mnlgxdlib'));

    if (inputFiles.length === 0) {
        console.error(`❌ No input files found in ${copyrightedDataPath}`);
        return;
    }

    const inputFile = inputFiles[0];
    const inputPath = path.join(copyrightedDataPath, inputFile);

    console.log(`📁 Input file: ${inputFile}`);

    // Find expected output files
    const expectedJsonFiles = fs.readdirSync(copyrightedDataPath).filter(f => f.endsWith('.json'));
    const expectedSvgFiles = fs.readdirSync(copyrightedDataPath).filter(f => f.endsWith('.svg'));

    if (expectedJsonFiles.length === 0 || expectedSvgFiles.length === 0) {
        console.error(`❌ Missing expected output files in ${copyrightedDataPath}`);
        return;
    }

    const expectedJsonPath = path.join(copyrightedDataPath, expectedJsonFiles[0]);
    const expectedSvgPath = path.join(copyrightedDataPath, expectedSvgFiles[0]);

    console.log(`📄 Expected JSON: ${expectedJsonFiles[0]}`);
    console.log(`🎨 Expected SVG: ${expectedSvgFiles[0]}`);

    // Run our TypeScript parser
    console.log('\n⚙️  Running TypeScript parser...');

    try {
        // Build the project first
        execSync('npm run build', { cwd: __dirname, stdio: 'pipe' });

        await runTypeScriptParser(inputPath, tempPath);

        // Compare outputs
        console.log('\n🔍 Comparing outputs...');

        const actualJsonPath = path.join(tempPath, 'output.json');
        const actualSvgPath = path.join(tempPath, 'output.svg');

        if (fs.existsSync(actualJsonPath) && fs.existsSync(actualSvgPath)) {
            compareFiles(expectedJsonPath, actualJsonPath, 'JSON');
            compareFiles(expectedSvgPath, actualSvgPath, 'SVG');
        } else {
            console.error('❌ TypeScript parser did not generate output files');
        }

    } catch (error) {
        console.error('❌ Error running test:', error instanceof Error ? error.message : String(error));
    }
}

async function runTypeScriptParser(inputPath: string, outputPath: string): Promise<void> {
    console.log('🚀 Running TypeScript parser via CLI...');

    const command = `tsx src/cli.ts "${inputPath}" "${outputPath}"`;
    console.log(`📝 Running: ${command}`);

    const result = execSync(command, {
        cwd: __dirname,
        encoding: 'utf8',
        stdio: 'pipe'
    });

    console.log('✅ TypeScript CLI output:');
    console.log(result);
}

function compareFiles(expectedPath: string, actualPath: string, fileType: string): void {
    const expected = fs.readFileSync(expectedPath, 'utf8');
    const actual = fs.readFileSync(actualPath, 'utf8');

    if (fileType === 'JSON') {
        try {
            const expectedJson = JSON.parse(expected);
            const actualJson = JSON.parse(actual);

            console.log(`📊 ${fileType} Comparison:`);
            console.log(`   Expected keys: ${Object.keys(expectedJson).length}`);
            console.log(`   Actual keys: ${Object.keys(actualJson).length}`);

            // Simple comparison - in reality you'd want more sophisticated diff
            if (JSON.stringify(expectedJson) === JSON.stringify(actualJson)) {
                console.log('   ✅ JSON files match exactly');
            } else {
                console.log('   ⚠️  JSON files differ');

                // Show some differences
                const expectedKeys = new Set(Object.keys(expectedJson));
                const actualKeys = new Set(Object.keys(actualJson));

                const missingKeys = [...expectedKeys].filter(k => !actualKeys.has(k));
                const extraKeys = [...actualKeys].filter(k => !expectedKeys.has(k));

                if (missingKeys.length > 0) {
                    console.log(`   📝 Missing keys: ${missingKeys.slice(0, 5).join(', ')}`);
                }
                if (extraKeys.length > 0) {
                    console.log(`   📝 Extra keys: ${extraKeys.slice(0, 5).join(', ')}`);
                }
            }
        } catch (e) {
            console.log(`   ❌ JSON parsing error: ${e instanceof Error ? e.message : String(e)}`);
        }
    } else {
        console.log(`📊 ${fileType} Comparison:`);
        console.log(`   Expected size: ${expected.length} characters`);
        console.log(`   Actual size: ${actual.length} characters`);

        if (expected === actual) {
            console.log('   ✅ Files match exactly');
        } else {
            console.log('   ⚠️  Files differ');

            // Show similarity percentage
            const similarity = calculateSimilarity(expected, actual);
            console.log(`   📊 Similarity: ${similarity.toFixed(1)}%`);
        }
    }
}

function calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 100;

    let matches = 0;
    const minLen = Math.min(len1, len2);

    for (let i = 0; i < minLen; i++) {
        if (str1[i] === str2[i]) matches++;
    }

    return (matches / maxLen) * 100;
}

// Main execution
async function main(): Promise<void> {
    const testFolder = process.argv[2];

    if (!testFolder) {
        console.log('Usage: tsx test-compare.ts <folder-name>');
        console.log('Example: tsx test-compare.ts replicant');
        process.exit(1);
    }

    console.log('🧪 TypeScript vs C# Output Comparison Tool');
    console.log('==========================================');

    await runComparison(testFolder);

    console.log('\n✨ Comparison complete!');
    console.log(`📁 Results saved to: test-temp/${testFolder}/`);
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { runComparison };
