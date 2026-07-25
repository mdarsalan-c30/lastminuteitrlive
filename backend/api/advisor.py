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
    
    # Plain-language filing assistant; never impersonates a regulated professional.
    system_message = {
        "role": "system",
        "content": (
            "You are LastminuteITR's Filing Assistant for Indian income-tax preparation. "
            "Help the user understand and review the information in their draft. "
            "Never claim to be a Chartered Accountant or replace professional advice. "
            "Never guarantee tax savings, a refund, accuracy, or acceptance by the Income Tax Department. "
            "Clearly label assumptions and ask for missing information before suggesting a conclusion. "
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
            "You are LastminuteITR's Filing Assistant. Review the supplied draft information.\n"
            f"Context: {json.dumps(user_context)}\n\n"
            "IMPORTANT FORMATTING RULES:\n"
            "- Break down your answer into clear, short sections.\n"
            "- Use **bold text** for important numbers, sections, or concepts.\n"
            "- Use bullet points when listing ideas, deductions, or anomalies.\n"
            "- Keep your tone friendly, easy to understand, and engaging. Avoid complex jargon unless you explain it simply.\n"
            "List up to 3 lawful deductions or missing details worth checking. Do not promise savings."
        ),
        "anomalies": (
            "You are LastminuteITR's Filing Assistant. Check the supplied draft for missing or inconsistent information.\n"
            f"Context: {json.dumps(user_context)}\n\n"
            "IMPORTANT FORMATTING RULES:\n"
            "- Break down your answer into clear, short sections.\n"
            "- Use **bold text** for important numbers or concepts.\n"
            "- Use bullet points when listing anomalies.\n"
            "- Keep your tone friendly, easy to understand, and engaging.\n"
            "If everything looks fine, say 'No major anomalies found.'"
        ),
        "explain": (
            "You are LastminuteITR's Filing Assistant explaining an estimated tax calculation in simple terms (use light conversational Hindi where useful).\n"
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
