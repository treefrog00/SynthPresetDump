#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';

interface ExtractOptions {
  inputFile: string;
  outputDir?: string;
  verbose?: boolean;
}

class LibExtractor {
  private options: ExtractOptions;

  constructor(options: ExtractOptions) {
    this.options = {
      outputDir: './extracted',
      verbose: false,
      ...options
    };
  }

  async extract(): Promise<void> {
    try {
      // Validate input file
      if (!fs.existsSync(this.options.inputFile)) {
        throw new Error(`Input file does not exist: ${this.options.inputFile}`);
      }

      if (!this.options.inputFile.endsWith('.mnlgxdlib')) {
        throw new Error('Input file must have .mnlgxdlib extension');
      }

      // Create output directory if it doesn't exist
      if (!fs.existsSync(this.options.outputDir!)) {
        fs.mkdirSync(this.options.outputDir!, { recursive: true });
        if (this.options.verbose) {
          console.log(`Created output directory: ${this.options.outputDir}`);
        }
      }

      // Read the .mnlgxdlib file
      if (this.options.verbose) {
        console.log(`Reading library file: ${this.options.inputFile}`);
      }

      const fileBuffer = fs.readFileSync(this.options.inputFile);
      const zip = new JSZip();

      // Load the zip file
      await zip.loadAsync(fileBuffer);

      // Find all .prog_bin files
      const progFiles = Object.keys(zip.files).filter(name => name.endsWith('.prog_bin'));

      if (progFiles.length === 0) {
        throw new Error('No .prog_bin files found in the library');
      }

      if (this.options.verbose) {
        console.log(`Found ${progFiles.length} program files`);
      }

      // Extract each .prog_bin file
      let extractedCount = 0;
      for (const fileName of progFiles) {
        try {
          const file = zip.files[fileName];
          const fileData = await file.async('uint8array');

          // Generate output filename
          const baseName = path.basename(fileName, '.prog_bin');
          const outputPath = path.join(this.options.outputDir!, `${baseName}.prog_bin`);

          // Write the file
          fs.writeFileSync(outputPath, fileData);

          if (this.options.verbose) {
            console.log(`Extracted: ${fileName} -> ${outputPath}`);
          }

          extractedCount++;
        } catch (error) {
          console.error(`Failed to extract ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`\nExtraction complete! Extracted ${extractedCount} program files to: ${path.resolve(this.options.outputDir!)}`);

    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }
}

function printUsage(): void {
  console.log(`
Usage: tsx src/extract-lib.ts <input-file> [options]

Arguments:
  input-file          Path to the .mnlgxdlib file to extract

Options:
  --output-dir <dir>  Output directory for extracted files (default: ./extracted)
  --verbose           Enable verbose output
  --help             Show this help message

Examples:
  tsx src/extract-lib.ts my-library.mnlgxdlib
  tsx src/extract-lib.ts my-library.mnlgxdlib --output-dir ./my-programs --verbose
`);
}

function parseArgs(): ExtractOptions | null {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printUsage();
    return null;
  }

  const inputFile = args[0];
  const options: ExtractOptions = { inputFile };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output-dir':
        if (i + 1 < args.length) {
          options.outputDir = args[++i];
        } else {
          console.error('Error: --output-dir requires a directory path');
          return null;
        }
        break;
      case '--verbose':
        options.verbose = true;
        break;
      default:
        console.error(`Error: Unknown option: ${args[i]}`);
        return null;
    }
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (!options) {
    return;
  }

  const extractor = new LibExtractor(options);
  await extractor.extract();
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  });
}
