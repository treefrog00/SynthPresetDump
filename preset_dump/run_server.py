"""Run the FastAPI development server"""

import uvicorn
from src.web.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)