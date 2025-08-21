# CLAUDE.md

## Project Overview

This repository contains tools for parsing and displaying Korg Minilogue XD synthesizer presets in human-readable formats. The project has three main implementations:

1. **C# Console Application** (`miniloguexd/`) - .NET implementation
2. **Python Script** (`mnlgxd.py`) - Standalone parsing script, implemented entirely independently of the C# version
3. **TypeScript version** - can be used either as a Node CLI using tsx, or used from a static HTML file after being compiled to JavaScript. A work in progress.


All implementations parse the same binary format but target different use cases.

## Commands

### C# Application (miniloguexd/)
```bash
# Build the application
cd miniloguexd/src && dotnet build

# Run tests
cd miniloguexd/src && dotnet test

# Publish for different platforms
cd miniloguexd/src/mnlxdprogdump && dotnet publish -c Release -r linux-x64 -o publish/linux-x64
cd miniloguexd/src/mnlxdprogdump && dotnet publish -c Release -r win-x64 -o publish/win-x64

# Run the application
cd miniloguexd/src/mnlxdprogdump && dotnet run <LibraryFileName> <OutputDirectory>
```

### Standalone Python Script
```bash
# Parse a single program file
python mnlgxd.py test.mnlgxdprog

# Parse a specific program from a library file
python mnlgxd.py test.mnlgxdlib 1
```

### TypeScript CLI version

For testing the TypeScript implementation there is a script that performs a detailed comparison of the JSON output of both the C# and TypeScript implementations.

It assumes that input test files, alongside the C# output files, are stored in subfolders inside the "copyrighted_data" folder (which is ignored by git). For a subfolder named "init_program", the comparison can be run like this:

```bash
npm run test-compare init_program
```

For running the web version in a dev server, use:

```bash
npm run dev
```

## Architecture

### Binary Format Parsing
- All implementations parse the same 160-byte binary format for Minilogue XD presets
- Files can be individual programs (`.mnlgxdprog`) or libraries (`.mnlgxdlib`) containing multiple programs
- Both file types are ZIP archives containing binary `.prog_bin` files

### Core Components

**C# Implementation (`miniloguexd/src/mnlxdprogdump/`):**
- `Parser/ProgramParser.cs` - Reflection-based binary parser using `OffsetAttribute`
- `Parser/ProgramData.cs` - Strongly-typed data model with validation attributes
- `ReportGenerators/` - Output format generators (JSON, SVG)
- `Parser/LibraryFileReader.cs` - ZIP archive handling

### Data Flow
1. **Input**: ZIP archives (`.mnlgxdprog`, `.mnlgxdlib`) or raw binary (`.prog_bin`)
2. **Parsing**: Extract binary data and parse into structured data models
3. **Processing**: Convert raw values to human-readable formats using helper functions
4. **Output**: Generate reports in JSON or SVG format

### Key Files
- User configuration: `userOscillatorDescriptions.json`, `userUnitMappings.json`
- These files map user oscillator slots to specific plugin names and parameter descriptions
- Without these files, user oscillators show as generic "USER OSC" and "Param 1-6"

### Testing
- C# tests use NUnit framework in `miniloguexd/src/mnlxdprogdump.Tests/`

### Output Formats
Both C# and TypeScript implementations generate:
- **JSON**: Structured data with human-readable labels and raw values
- **SVG**: Visual preset sheets showing all synthesizer parameters in a grid layout

The Python script generates text output.

## Development Notes

- The binary format includes sequencer data (V1 and V2 formats) in addition to preset parameters
- All implementations handle bit-level parsing for packed parameter data (e.g., user parameter types)