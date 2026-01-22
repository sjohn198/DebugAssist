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
    try:
        response = client.chat.completions.create(
            model="hf.co/LiquidAI/LFM2-1.2B-RAG-GGUF",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system", 
                    "content": """
                    You are a strict code analysis tool. You do not write code. You only analyze input and output raw JSON. 
                    Do not include markdown formatting, code blocks, or conversational text. Output ONLY the JSON object. 
                    I will give you code and the intended function of the code. Please respond with a json object with the 
                    fields error_type, line_number, character_number and error_message wrapped in curly brackets. Fill those 
                    fields out according to their names. Allow error_message to be verbose.
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
