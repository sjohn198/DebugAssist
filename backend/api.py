import os
import json
from openai import OpenAI, APIConnectionError
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")

client = OpenAI(
    base_url=OLLAMA_URL,
    api_key="ollama"
)

app = FastAPI()

class Selection(BaseModel):
    prompt: str
    code: str
    errors: bool
    optims: bool
    style: bool

class BasicOutput(BaseModel):
    number_of_errors: int
    line_number: int
    line_text: str

@app.post("/api/test-extension-connection")
async def connect_extension(selection: Selection):
    print(selection.prompt)
    print(selection.code)
    return {"message": f"Successfully received prompt: '{selection.prompt}' and code: '{selection.code}"}

@app.post("/api/test-openai")
async def test_openai(selection: Selection):
    print(selection)
    try:
        response = client.chat.completions.create(
            model="hf.co/LiquidAI/LFM2-1.2B-RAG-GGUF",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system", 
                    "content": f"""
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
                    """ 
                },
                {
                    "role": "user",
                    "content": selection.code
                },
                {
                    "role": "user",
                    "content": selection.prompt
                }
            ],
            temperature=0.2
        )
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        response = ""
    print(f"AI response: {response.choices[0].message.content}")
    raw_text = response.choices[0].message.content
    print(f"Raw text: {raw_text}")
    messages = json.loads(raw_text)
    print(messages)
    print(messages["error_message"])
    output = messages["error_message"]
    return output
