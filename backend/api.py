import os
from openai import OpenAI
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

load_dotenv()

client = OpenAI()

app = FastAPI()

class Selection(BaseModel):
    selected_text: str
    code: str

@app.post("/api/test-extension-connection")
async def connect_extension(selection: Selection):
    print(selection.selected_text)
    return {"message": f"Successfully received prompt: '{selection.selected_text}' and code: '{selection.code}"}
