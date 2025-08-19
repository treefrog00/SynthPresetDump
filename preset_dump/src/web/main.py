"""FastAPI application for Minilogue XD preset conversion"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, Response
from typing import Optional
import json

from ..services.program_data import ProgramData
from ..services.json_generator import JsonReportGenerator
from ..services.svg_generator import SVGGenerator
from ..services.binary_parser import ProgramParser
from ..services.enums import *

app = FastAPI(
    title="Minilogue XD Preset Converter",
    description="API for converting Minilogue XD presets to JSON and SVG formats",
    version="0.1.0"
)

# Initialize generators
json_generator = JsonReportGenerator()
svg_generator = SVGGenerator()


@app.get("/")
async def root():
    """API root endpoint"""
    return {"message": "Minilogue XD Preset Converter API"}


@app.post("/convert/json")
async def convert_to_json(file: UploadFile = File(...)):
    """Convert Minilogue XD preset file to JSON"""
    try:
        # Read the uploaded file
        content = await file.read()
        
        # Parse the binary data
        program_data = ProgramParser.parse_from_upload(content)
        
        # Generate JSON
        json_output = json_generator.generate_report(program_data)
        
        return JSONResponse(
            content=json.loads(json_output),
            media_type="application/json"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting to JSON: {str(e)}")


@app.post("/convert/svg")
async def convert_to_svg(file: UploadFile = File(...)):
    """Convert Minilogue XD preset file to SVG"""
    try:
        # Read the uploaded file
        content = await file.read()
        
        # Parse the binary data
        program_data = ProgramParser.parse_from_upload(content)
        
        # Generate SVG
        svg_output = svg_generator.generate_report(program_data)
        
        filename = f"{program_data.program_name or 'preset'}.svg"
        return Response(
            content=svg_output,
            media_type="image/svg+xml",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting to SVG: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "generators": ["json", "svg"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)