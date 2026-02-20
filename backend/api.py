import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

load_dotenv()

client = genai.Client()

app = FastAPI()

class Selection(BaseModel):
    prompt: str
    code: str
    errors: bool
    optims: bool
    style: bool

class BasicOutput(BaseModel):
    error_type: str
    line_number: int
    character_number: int
    error_message: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "DebugAssist Backend is running"}

@app.post("/api/test-extension-connection")
async def connect_extension(selection: Selection):
    print(selection.prompt)
    print(selection.code)
    return {"message": f"Successfully received prompt: '{selection.prompt}' and code: '{selection.code}"}

@app.post("/api/test-openai")
async def test_openai(selection: Selection):
    print(selection)
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                f"""
                <code_to_analyze>
                {selection.code}
                </code_to_analyze>
                """,
                f"""
                <user_instruction>
                {selection.prompt}
                </user_instruction>
                """
            ],
            config=types.GenerateContentConfig(
                system_instruction = f"""
                You are an expert code debugger and tutor. You do not write code. You only analyze input and output raw JSON. 
                {"You will critique programming errors." if selection.errors else ""}
                {"You will recommend optimization improvements." if selection.optims else ""}
                {"You will recommend coding style improvements." if selection.style else ""}
                
                Do not include markdown formatting, code blocks, or conversational text. Output ONLY the JSON object. 
                
                I will give you code and the intended function of the code. Please respond with a json object with the 
                following fields:
                
                1. error_type: The standard name of the error (e.g., NameError, SyntaxError).
                2. line_number: Just the integer number.
                3. character_number: Just the integer number.
                4. error_message: A verbose and helpful explanation. You must explain WHY the error occurred in this specific context and suggest HOW to fix it. Avoid generic compiler messages.
                """,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema = BasicOutput
            )
        )
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        response = ""
    print(f"Response: {response}")
    print(f"Content: {response.parsed.error_message}")
    return response.parsed.error_message
