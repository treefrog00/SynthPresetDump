#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parseFile as parseWithCli } from './src/cli';

async function runComparison(testFolder: string): Promise<void> {
    console.log(`\n🔍 Testing folder: ${testFolder}`);

    const copyrightedDataPath = path.join('..', 'copyrighted_data', testFolder);
    const tempPath = path.join('comparison-output', testFolder);

    // Create temp directory
    fs.mkdirSync(tempPath, { recursive: true });

    // Find the input file (.mnlgxdprog or .mnlgxdlib)
    const inputFiles = fs.readdirSync(copyrightedDataPath).filter(f =>
        f.endsWith('.mnlgxdprog') || f.endsWith('.prog_bin'));

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

    try {
        await parseWithCli(inputPath, tempPath);

        // Compare outputs
        console.log('\n🔍 Comparing outputs...');

        const actualJsonPath = path.join(tempPath, 'output.json');
        const actualSvgPath = path.join(tempPath, 'output.svg');

        if (fs.existsSync(actualJsonPath) && fs.existsSync(actualSvgPath)) {
            compareJsonFiles(expectedJsonPath, actualJsonPath);
            compareSvgProgramData(expectedSvgPath, actualSvgPath);
        } else {
            console.error('❌ TypeScript parser did not generate output files');
        }

    } catch (error) {
        console.error('❌ Error running test:', error instanceof Error ? error.message : String(error));
    }

    console.log('\n✨ Comparison complete!');
    console.log(`📁 Results saved to: ${tempPath}`);
}

function compareJsonFiles(expectedPath: string, actualPath: string): void {
    const expected = fs.readFileSync(expectedPath, 'utf8');
    const actual = fs.readFileSync(actualPath, 'utf8');

    let expectedJson: any;
    let actualJson: any;

    try {
        expectedJson = JSON.parse(expected);
        actualJson = JSON.parse(actual);
    } catch (e) {
        console.log(`   ❌ JSON parsing error: ${e instanceof Error ? e.message : String(e)}`);
    }

    const normalizedExpected = normalizeJsonKeys(expectedJson);
    const normalizedActual = normalizeJsonKeys(actualJson);

    console.log(`📊 JSON Comparison:`);
    console.log(`   Expected keys: ${Object.keys(normalizedExpected).length}`);
    console.log(`   Actual keys: ${Object.keys(normalizedActual).length}`);

    const keysToCompare = ["program"];

    let allMatch = true;

    for (const key in normalizedExpected) {
        if (!keysToCompare.includes(key)) {
            console.log("skipping " + key);
            continue;
        }
        const actualValue = normalizedActual[key];
        const expectedValue = normalizedExpected[key];

        allMatch = allMatch && compareJsonKeys(expectedValue, actualValue);
    }

    if (allMatch) {
        console.log("   ✅ All JSON keys match exactly");
    } else {
        console.log("   ⚠️  Some JSON keys differ");
    }
}

function normalizeJsonKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(normalizeJsonKeys);
    }

    const normalized: any = {};
    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        normalized[lowerKey] = normalizeJsonKeys(value);
    }
    return normalized;
}

function compareJsonKeys(expected: any, actual: any): boolean {
    let allMatch = true;

    for (const key in expected) {
        const expectedChild = expected[key];
        const actualChild = actual[key];

        if (!(key in actual)) {
            console.log(`   ❌ Actual missing ${key}`);
        }

        if (typeof expectedChild === 'object' && typeof actualChild === 'object') {
            allMatch = compareObjectKeys(expectedChild, actualChild, key, allMatch);
        } else {
            allMatch = comparePrimitiveValues(expectedChild, actualChild, key, allMatch);
        }
    }

    return allMatch;
}

function compareObjectKeys(expectedChild: any, actualChild: any, key: string, currentMatch: boolean): boolean {
    const expectedChildKeys = Object.keys(expectedChild);
    const actualChildKeys = Object.keys(actualChild);

    console.log(`   Expected ${key} keys: ${expectedChildKeys.length}`);
    console.log(`   Actual ${key} keys: ${actualChildKeys.length}`);

    const expectedChildKeySet = new Set(expectedChildKeys);
    const actualChildKeySet = new Set(actualChildKeys);

    const missingChildKeys = [...expectedChildKeySet].filter(k => !actualChildKeySet.has(k));
    const extraChildKeys = [...actualChildKeySet].filter(k => !expectedChildKeySet.has(k));

    let allMatch = currentMatch;

    if (missingChildKeys.length > 0) {
        console.log(`   📝 Missing ${key} keys: ${missingChildKeys.slice(0, 5).join(', ')}`);
        allMatch = false;
    }
    if (extraChildKeys.length > 0) {
        console.log(`   📝 Extra ${key} keys: ${extraChildKeys.slice(0, 5).join(', ')}`);
        allMatch = false;
    }

    // Check if the child objects match exactly
    if (JSON.stringify(expectedChild) !== JSON.stringify(actualChild)) {
        console.log(`   ✅ ${key} matches exactly`);
    } else {
        console.log(`   ⚠️  ${key} differs`);
        allMatch = false;
    }

    return allMatch;
}

function comparePrimitiveValues(expectedChild: any, actualChild: any, key: string, currentMatch: boolean): boolean {
    if (expectedChild === actualChild) {
        return currentMatch;
    } else {
        console.log(`   ⚠️  ${key} differs`);
        return false;
    }
}

function compareSvgProgramData(expectedPath: string, actualPath: string): void {
    const expected = fs.readFileSync(expectedPath, 'utf8');
    const actual = fs.readFileSync(actualPath, 'utf8');

    console.log(`🎛️  SVG Program Data Comparison:`);

    const expectedLines = expected.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const actualLines = actual.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log(`   Expected lines: ${expectedLines.length}`);
    console.log(`   Actual lines: ${actualLines.length}`);

    let matches = 0;
    let mismatches = 0;
    const maxLines = Math.min(expectedLines.length, actualLines.length);

    for (let i = 0; i < maxLines; i++) {
        const expectedLine = expectedLines[i];
        const actualLine = actualLines[i];

        // Compare lines ignoring case differences
        if (expectedLine.toLowerCase() === actualLine.toLowerCase()) {
            matches++;
        } else {
            mismatches++;
            if (mismatches <= 4) { // Show first 10 mismatches
                console.log(`   ⚠️  Line ${i + 1}:`);
                console.log(`       Expected: ${expectedLine}`);
                console.log(`       Actual:   ${actualLine}`);
            }
        }
    }

    // Check for different line counts
    if (expectedLines.length !== actualLines.length) {
        const diff = Math.abs(expectedLines.length - actualLines.length);
        console.log(`   ⚠️  Different line counts: ${diff} line(s) difference`);
        if (expectedLines.length > actualLines.length) {
            console.log(`   📝 Expected has ${diff} more lines`);
        } else {
            console.log(`   📝 Actual has ${diff} more lines`);
        }
    }

    console.log(`   ✅ Matching lines: ${matches}`);
    console.log(`   ⚠️  Mismatching lines: ${mismatches}`);

    if (mismatches === 0 && expectedLines.length === actualLines.length) {
        console.log('   🎉 All SVG lines match perfectly!');
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

    await runComparison(testFolder);
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { runComparison };
