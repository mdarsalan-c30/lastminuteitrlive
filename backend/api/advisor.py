import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ensure API key is available
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

def handle_advisor_chat(payload: dict):
    if not client:
        return 500, {"error": "GROQ_API_KEY not configured on server"}
    
    messages = payload.get("messages", [])
    user_context = payload.get("context", {})
    
    # System prompt to act as an expert Indian CA
    system_message = {
        "role": "system",
        "content": (
            "You are a Smart CA (Chartered Accountant) AI for TaxSathi. "
            "Your goal is to help Indian taxpayers optimize their taxes under the new regime. "
            f"Current Context: {json.dumps(user_context)} "
            "\n\nIMPORTANT FORMATTING RULES:\n"
            "- Never write long paragraphs. \n"
            "- Use **bold text** for important numbers or concepts.\n"
            "- Always use bullet points when listing options or deductions.\n"
            "- Keep your tone friendly, professional, easy to read, and engaging.\n"
            "- Make your answers actionable.\n"
            "Do not give generic advice; tailor it to the user's situation based on the context provided."
        )
    }
    
    # Prepend system message
    full_messages = [system_message] + messages
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=full_messages,
            temperature=0.7,
            max_tokens=1024
        )
        
        reply = completion.choices[0].message.content
        return 200, {"reply": reply}
    except Exception as e:
        print("Groq API Error:", e)
        return 500, {"error": str(e)}

def handle_advisor_action(payload: dict):
    if not client:
        return 500, {"error": "GROQ_API_KEY not configured on server"}
    
    action = payload.get("action") # "optimize", "anomalies", "explain"
    user_context = payload.get("context", {})
    
    prompts = {
        "optimize": (
            "You are an expert Indian CA. Analyze the user's tax profile under the new tax regime.\n"
            f"Context: {json.dumps(user_context)}\n\n"
            "IMPORTANT FORMATTING RULES:\n"
            "- Break down your answer into clear, short sections.\n"
            "- Use **bold text** for important numbers, sections, or concepts.\n"
            "- Use bullet points when listing ideas, deductions, or anomalies.\n"
            "- Keep your tone friendly, easy to understand, and engaging. Avoid complex jargon unless you explain it simply.\n"
            "Suggest 3 actionable ways to save more taxes."
        ),
        "anomalies": (
            "You are an expert Indian CA reviewing a tax file for errors. Look for inconsistencies in the user data.\n"
            f"Context: {json.dumps(user_context)}\n\n"
            "IMPORTANT FORMATTING RULES:\n"
            "- Break down your answer into clear, short sections.\n"
            "- Use **bold text** for important numbers or concepts.\n"
            "- Use bullet points when listing anomalies.\n"
            "- Keep your tone friendly, easy to understand, and engaging.\n"
            "If everything looks fine, say 'No major anomalies found.'"
        ),
        "explain": (
            "You are a friendly Indian CA explaining a tax calculation to a client in simple terms (use some conversational Hindi).\n"
            f"Context: {json.dumps(user_context)}\n\n"
            "IMPORTANT FORMATTING RULES:\n"
            "- Break down your answer into clear, short sections.\n"
            "- Use **bold text** for important numbers or concepts.\n"
            "- Use bullet points for any lists.\n"
            "- Keep your tone friendly, easy to understand, and engaging.\n"
            "Break down why their tax is what it is, why they are getting a refund or why they owe money."
        )
    }
    
    system_prompt = prompts.get(action, prompts["explain"])
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0.7,
            max_tokens=1024
        )
        return 200, {"reply": completion.choices[0].message.content}
    except Exception as e:
        print("Groq API Error:", e)
        return 500, {"error": str(e)}
