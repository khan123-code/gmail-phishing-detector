from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import smart_predict  # Yeh import hote hi semantic_analyzer ka model load ho jayega (one-time)

app = FastAPI(title="Smart Phishing Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    subject: str = ""
    sender:  str = ""
    body:    str = ""

@app.get("/")
def root():
    return {"status": "Smart Phishing Detector API is running"}

@app.post("/predict")
def predict(email: EmailRequest):
    result = smart_predict.smart_predict(email.subject, email.sender, email.body)
    return result
