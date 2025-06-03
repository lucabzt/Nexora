from fastapi import FastAPI
from . import statistics

app = FastAPI()

app.include_router(statistics.router)