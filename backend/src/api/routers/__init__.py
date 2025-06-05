from fastapi import FastAPI
from . import statistics
from . import notes

app = FastAPI()

app.include_router(statistics.router)
app.include_router(notes.router)