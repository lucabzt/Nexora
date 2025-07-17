import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8127))
    uvicorn.run("src.main:app", host="0.0.0.0",
                port=port,
                reload=False,
                reload_dirs=["./src/"],
                reload_excludes=["venv", "__pycache__"],
                )