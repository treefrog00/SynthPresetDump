# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains tools for parsing and displaying Korg Minilogue XD synthesizer presets in human-readable formats. The project has three main implementations:

1. **C# Console Application** (`miniloguexd/`) - Original .NET implementation
2. **Python Web API** (`preset_dump/`) - FastAPI-based web service 
3. **Python Script** (`mnlgxd.py`) - Standalone parsing script

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

### Python Web API (preset_dump/)
```bash
# Install dependencies
cd preset_dump && uv sync

# Run tests
cd preset_dump && pytest

# Run the web server
cd preset_dump && python run_server.py
# or
cd preset_dump && uvicorn src.web.main:app --host 0.0.0.0 --port 8000

# Run a single test file
cd preset_dump && pytest tests/test_binary_parser.py -v
```

### Standalone Python Script
```bash
# Parse a single program file
python mnlgxd.py test.mnlgxdprog

# Parse a specific program from a library file
python mnlgxd.py test.mnlgxdlib 1
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

**Python Implementation (`preset_dump/src/`):**
- `services/binary_parser.py` - Struct-based binary parsing with `ProgramParser` class
- `services/program_data.py` - Python data model matching C# structure
- `services/json_generator.py` - JSON output generator
- `services/svg_generator.py` - SVG output generator
- `web/main.py` - FastAPI application with file upload endpoints

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
- Python tests use pytest in `preset_dump/tests/` with test coverage for API endpoints, parsing, and generators
- Python uses `conftest.py` for shared test fixtures

### Output Formats
Both implementations generate:
- **JSON**: Structured data with human-readable labels and raw values
- **SVG**: Visual preset sheets showing all synthesizer parameters in a grid layout

## Development Notes

- The project targets .NET 9 for the C# implementation and Python 3.13+ for the Python implementation
- Programs named "Init Program" are automatically skipped during processing
- The binary format includes sequencer data (V1 and V2 formats) in addition to preset parameters
- All implementations handle bit-level parsing for packed parameter data (e.g., user parameter types)