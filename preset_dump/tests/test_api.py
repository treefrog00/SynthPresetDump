"""Tests for FastAPI endpoints"""

import pytest
import json
from fastapi.testclient import TestClient
from io import BytesIO

from src.web.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)


class TestAPIEndpoints:
    
    def test_root_endpoint(self, client):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "Minilogue XD" in data["message"]
    
    def test_health_endpoint(self, client):
        """Test the health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "generators" in data
        assert "json" in data["generators"]
        assert "svg" in data["generators"]
    
    def test_convert_json_with_zip_file(self, client, sample_zip_file):
        """Test JSON conversion with ZIP file upload"""
        files = {"file": ("test.mnlgxdprog", sample_zip_file, "application/zip")}
        
        response = client.post("/convert/json", files=files)
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        
        # Should return valid JSON
        data = response.json()
        assert isinstance(data, dict)
        assert "program_name" in data
        assert data["program_name"] == "Test Program"
    
    def test_convert_json_with_binary_file(self, client, sample_binary_data):
        """Test JSON conversion with raw binary file upload"""
        files = {"file": ("test.prog", sample_binary_data, "application/octet-stream")}
        
        response = client.post("/convert/json", files=files)
        assert response.status_code == 200
        
        # Should return valid JSON
        data = response.json()
        assert isinstance(data, dict)
        assert "program_name" in data
        assert data["program_name"] == "Test Program"
    
    def test_convert_svg_with_zip_file(self, client, sample_zip_file):
        """Test SVG conversion with ZIP file upload"""
        files = {"file": ("test.mnlgxdprog", sample_zip_file, "application/zip")}
        
        response = client.post("/convert/svg", files=files)
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/svg+xml"
        
        # Should return SVG content
        svg_content = response.content.decode()
        assert svg_content.startswith("<?xml")
        assert "<svg" in svg_content
        assert "Test Program" in svg_content
        
        # Check content-disposition header
        content_disp = response.headers.get("content-disposition")
        assert content_disp is not None
        assert "Test Program.svg" in content_disp
    
    def test_convert_svg_with_binary_file(self, client, sample_binary_data):
        """Test SVG conversion with raw binary file upload"""
        files = {"file": ("test.prog", sample_binary_data, "application/octet-stream")}
        
        response = client.post("/convert/svg", files=files)
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/svg+xml"
        
        # Should return SVG content
        svg_content = response.content.decode()
        assert "<svg" in svg_content
        assert "Test Program" in svg_content
    
    def test_convert_json_invalid_file(self, client):
        """Test JSON conversion with invalid file"""
        invalid_data = b"This is not a valid Minilogue XD file"
        files = {"file": ("invalid.txt", invalid_data, "text/plain")}
        
        response = client.post("/convert/json", files=files)
        assert response.status_code == 500
        
        data = response.json()
        assert "detail" in data
        assert "Error converting to JSON" in data["detail"]
    
    def test_convert_svg_invalid_file(self, client):
        """Test SVG conversion with invalid file"""
        invalid_data = b"This is not a valid Minilogue XD file"
        files = {"file": ("invalid.txt", invalid_data, "text/plain")}
        
        response = client.post("/convert/svg", files=files)
        assert response.status_code == 500
        
        data = response.json()
        assert "detail" in data
        assert "Error converting to SVG" in data["detail"]
    
    def test_convert_json_no_file(self, client):
        """Test JSON conversion without file upload"""
        response = client.post("/convert/json")
        assert response.status_code == 422  # Unprocessable Entity
    
    def test_convert_svg_no_file(self, client):
        """Test SVG conversion without file upload"""
        response = client.post("/convert/svg")
        assert response.status_code == 422  # Unprocessable Entity
    
    def test_convert_json_empty_file(self, client):
        """Test JSON conversion with empty file"""
        files = {"file": ("empty.prog", b"", "application/octet-stream")}
        
        response = client.post("/convert/json", files=files)
        assert response.status_code == 500
        
        data = response.json()
        assert "detail" in data
        assert "Error converting to JSON" in data["detail"]
    
    def test_convert_json_response_format(self, client, sample_zip_file):
        """Test that JSON response has correct format"""
        files = {"file": ("test.mnlgxdprog", sample_zip_file, "application/zip")}
        
        response = client.post("/convert/json", files=files)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check that it contains expected Minilogue XD fields
        expected_fields = [
            "header", "program_name", "octave", "portamento",
            "voice_mode_type", "vco1_wave", "vco2_wave",
            "filter_cutoff", "mod_fx_type", "program_end_marker"
        ]
        
        for field in expected_fields:
            assert field in data
        
        # Check enum values are integers
        assert isinstance(data["voice_mode_type"], int)
        assert isinstance(data["vco1_wave"], int)
    
    def test_convert_svg_response_format(self, client, sample_zip_file):
        """Test that SVG response has correct format"""
        files = {"file": ("test.mnlgxdprog", sample_zip_file, "application/zip")}
        
        response = client.post("/convert/svg", files=files)
        assert response.status_code == 200
        
        # Check headers
        assert response.headers["content-type"] == "image/svg+xml"
        assert "content-disposition" in response.headers
        assert "attachment" in response.headers["content-disposition"]
        
        # Check SVG structure
        svg_content = response.content.decode()
        assert svg_content.startswith("<?xml")
        assert 'xmlns="http://www.w3.org/2000/svg"' in svg_content
        assert "</svg>" in svg_content
    
    def test_api_endpoints_exist(self, client):
        """Test that all expected endpoints exist"""
        # Test GET endpoints
        response = client.get("/")
        assert response.status_code == 200
        
        response = client.get("/health")
        assert response.status_code == 200
        
        # Test POST endpoints (without files, should return 422)
        response = client.post("/convert/json")
        assert response.status_code == 422
        
        response = client.post("/convert/svg")
        assert response.status_code == 422
        
        # Test nonexistent endpoint
        response = client.get("/nonexistent")
        assert response.status_code == 404


class TestAPIIntegration:
    
    def test_json_to_svg_consistency(self, client, sample_zip_file):
        """Test that JSON and SVG endpoints process the same data consistently"""
        files_json = {"file": ("test.mnlgxdprog", sample_zip_file, "application/zip")}
        files_svg = {"file": ("test.mnlgxdprog", sample_zip_file, "application/zip")}
        
        # Get JSON response
        json_response = client.post("/convert/json", files=files_json)
        assert json_response.status_code == 200
        json_data = json_response.json()
        
        # Get SVG response
        svg_response = client.post("/convert/svg", files=files_svg)
        assert svg_response.status_code == 200
        svg_content = svg_response.content.decode()
        
        # Both should reference the same program name
        program_name = json_data["program_name"]
        assert program_name in svg_content
        
        # Both should have consistent data
        assert json_data["octave"] == 2  # From our test data
        assert "Test Program" in svg_content  # Program name should appear in SVG
    
    def test_multiple_file_uploads_same_session(self, client, sample_zip_file, sample_binary_data):
        """Test multiple file uploads in the same session"""
        # Upload ZIP file
        files1 = {"file": ("test1.mnlgxdprog", sample_zip_file, "application/zip")}
        response1 = client.post("/convert/json", files=files1)
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Upload binary file
        files2 = {"file": ("test2.prog", sample_binary_data, "application/octet-stream")}
        response2 = client.post("/convert/json", files=files2)
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Both should parse successfully and have same content
        assert data1["program_name"] == data2["program_name"]
        assert data1["vco1_pitch"] == data2["vco1_pitch"]