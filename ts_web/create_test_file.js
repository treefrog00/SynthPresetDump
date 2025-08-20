// Simple Node.js script to create a test binary file
const fs = require('fs');

// Create test binary data based on the Python test fixture
const data = Buffer.alloc(160);
let offset = 0;

// Header (4 bytes)
data.write('PROG', offset); offset += 4;

// Program name (12 bytes)
data.write('Test Program', offset); offset += 12;

// Basic parameters
data.writeUInt8(2, offset++);    // Octave
data.writeUInt8(64, offset++);   // Portamento
data.writeUInt8(1, offset++);    // Key Trig
data.writeUInt16LE(512, offset); offset += 2; // Voice Mode Depth
data.writeUInt8(4, offset++);    // Voice Mode Type (POLY)

// VCO 1
data.writeUInt8(2, offset++);    // VCO1 Wave (SAW)
data.writeUInt8(1, offset++);    // VCO1 Octave
data.writeUInt16LE(300, offset); offset += 2; // VCO1 Pitch
data.writeUInt16LE(200, offset); offset += 2; // VCO1 Shape

// VCO 2
data.writeUInt8(1, offset++);    // VCO2 Wave (TRI)
data.writeUInt8(2, offset++);    // VCO2 Octave
data.writeUInt16LE(400, offset); offset += 2; // VCO2 Pitch
data.writeUInt16LE(600, offset); offset += 2; // VCO2 Shape

data.writeUInt8(1, offset++);    // Sync
data.writeUInt8(0, offset++);    // Ring
data.writeUInt16LE(256, offset); offset += 2; // Cross Mod Depth

// Multi Engine
data.writeUInt8(1, offset++);    // Multi Type (VPM)
data.writeUInt8(0, offset++);    // Multi Noise
data.writeUInt8(0, offset++);    // Multi VPM
data.writeUInt8(5, offset++);    // Multi User
data.writeUInt16LE(100, offset); offset += 2; // Shape Noise
data.writeUInt16LE(200, offset); offset += 2; // Shape VPM
data.writeUInt16LE(300, offset); offset += 2; // Shape User
data.writeUInt16LE(150, offset); offset += 2; // Shift Shape Noise
data.writeUInt16LE(250, offset); offset += 2; // Shift Shape VPM
data.writeUInt16LE(350, offset); offset += 2; // Shift Shape User

// Mixer
data.writeUInt8(200, offset++);  // VCO1 Level
data.writeUInt8(180, offset++);  // VCO2 Level
data.writeUInt16LE(600, offset); offset += 2; // Multi Level

// Filter
data.writeUInt16LE(512, offset); offset += 2; // Filter Cutoff
data.writeUInt8(128, offset++);  // Filter Resonance
data.writeUInt8(1, offset++);    // Filter Drive
data.writeUInt16LE(2, offset);   offset += 2; // Filter Key Track

// Fill remaining bytes to reach 160 bytes with reasonable defaults
while (offset < 156) {
  data.writeUInt8(0, offset++);
}

// End marker (4 bytes)
data.write('PRED', 156);

console.log(`Created test file with ${data.length} bytes`);
fs.writeFileSync('test-program.prog_bin', data);

// Also create a ZIP version
const JSZip = require('./node_modules/jszip');
const zip = new JSZip();
zip.file('Prog_000.prog_bin', data);
zip.generateAsync({type: 'nodebuffer'}).then(content => {
  fs.writeFileSync('test-program.mnlgxdprog', content);
  console.log('Created test ZIP file');
});