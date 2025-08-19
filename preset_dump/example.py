"""Example usage of the Minilogue XD conversion services"""

import sys
from src.services.program_data import ProgramData
from src.services.json_generator import JsonReportGenerator
from src.services.svg_generator import SVGGenerator
from src.services.binary_parser import ProgramParser
from src.services.enums import *


def main():
    if len(sys.argv) > 1:
        # Parse a real file if provided
        try:
            print(f"Parsing file: {sys.argv[1]}")
            program_number = int(sys.argv[2]) if len(sys.argv) > 2 else 0
            program_data = ProgramParser.parse_file(sys.argv[1], program_number)
            print(f"Parsed program: {program_data.program_name}")
        except Exception as e:
            print(f"Error parsing file: {e}")
            print("Using sample data instead...")
            program_data = create_sample_program()
    else:
        # Create a sample program
        print("No file provided, using sample data...")
        program_data = create_sample_program()
    
    # Generate JSON
    json_generator = JsonReportGenerator()
    json_output = json_generator.generate_report(program_data)
    
    output_name = program_data.program_name or "example"
    json_filename = f"{output_name.replace(' ', '_')}_output.json"
    
    with open(json_filename, "w") as f:
        f.write(json_output)
    print(f"Generated JSON: {json_filename}")
    
    # Generate SVG
    svg_generator = SVGGenerator()
    svg_output = svg_generator.generate_report(program_data)
    
    svg_filename = f"{output_name.replace(' ', '_')}_output.svg"
    with open(svg_filename, "w") as f:
        f.write(svg_output)
    print(f"Generated SVG: {svg_filename}")


def create_sample_program():
    """Create a sample program for testing"""
    return ProgramData(
        header="PROG",
        program_name="Example Program",
        octave=2,
        voice_mode_type=VoiceModeType.POLY,
        vco1_wave=VcoWave.SAW,
        vco1_pitch=300,
        vco1_shape=200,
        vco2_wave=VcoWave.TRI,
        vco2_pitch=400,
        vco2_shape=600,
        filter_cutoff=512,
        filter_resonance=256,
        amp_eg_attack=100,
        amp_eg_decay=200,
        amp_eg_sustain=700,
        amp_eg_release=150,
        mod_fx_on_off=True,
        mod_fx_type=ModFxType.CHORUS,
        reverb_on_off=True,
        reverb_sub_type=ReverbSubType.HALL,
        program_end_marker="PRED"
    )


if __name__ == "__main__":
    main()