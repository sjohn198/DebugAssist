import os
from openai import OpenAI
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

client = OpenAI()

app = FastAPI()

@app.post("/api/test-extension-connection")
async def connect_extension(payload):
    print(payload.selected_text)
    return {"message": f"Successfully received: '{payload.selected_text}'"}
