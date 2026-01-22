import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client()

print("Fetching available models...\n")

try:
    for model in client.models.list():
        # We will just print the name directly
        print(f"Model Name: {model.name}")
        print(f"Display Name: {model.display_name}")
        print("-" * 20)
        
except Exception as e:
    print(f"An error occurred: {e}")