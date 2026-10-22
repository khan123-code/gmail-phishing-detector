import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"), http_options={"timeout": 45000})

def summarize_email(subject, sender, body, prediction="", phishing_score=0):
    prompt = f"""You are an email assistant. Analyze this email and provide a clear structured summary.

Security Analysis from our Phishing Detector:
Prediction: {prediction}
Phishing Risk Score: {phishing_score}/100

IMPORTANT SAFETY RULE:
If Prediction is Phishing or Suspicious, do NOT recommend following the sender's requested action, sharing credentials, clicking links, making payments, or providing sensitive information. The action_required.what_to_do field must instead warn the user not to perform the requested action and briefly explain why.


ACTION REQUIRED RULE:
For Safe emails, set action_required.needed to true if the recipient is explicitly asked to do something, such as confirm, reply, apply, pay, submit, verify, attend, register, complete a form, or meet a deadline.
If no action is requested, set needed to false and what_to_do to "None".
If needed is true, what_to_do must briefly state the actual action requested.
Email Details:
Subject: {subject}
Sender: {sender}
Body: {body[:3000]}

Provide summary in this exact JSON format:
{{
    "what_this_email_is_about": "One clear sentence explaining the email purpose",
    "sender_intent": "What does the sender want from you",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "action_required": {{
        "needed": false,
        "what_to_do": "None"
    }},
    "email_type": "transaction/newsletter/job/promotion/personal/alert/spam"
}}

Return only the JSON, no extra text."""

    models = [
        
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite"
    ]
    last_error = None

    for model_name in models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )

            text = response.text.strip()

            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]

            if text.endswith("```"):
                text = text[:-3]

            text = text.strip()
            result = json.loads(text)

            return {
                "success": True,
                "summary": result
            }

        except Exception as e:
            last_error = str(e)
            print(f"Summarization failed with {model_name}: {e}")
            continue

    return {
        "success": True,
        "error": last_error or "Summarization service unavailable",
        "summary": {
            "what_this_email_is_about": "AI summary is temporarily unavailable. The phishing detector analysis is still available above.",
            "sender_intent": "Unknown",
            "key_points": ["Summary unavailable"],
            "action_required": {
                "needed": False,
                "what_to_do": "Do not follow sensitive requests until the sender and request have been independently verified."
            },
            "email_type": "unknown"
        }
    }


