from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.compute import run_compute

app = FastAPI(title="TaxSathi Core Engine API")

# Allow Next.js frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "TaxSathi Core Engine"}

@app.post("/api/compute")
async def compute_endpoint(request: Request):
    payload = await request.json()
    status, data = run_compute(payload)
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=status, content=data)

from api.advisor import handle_advisor_chat, handle_advisor_action
@app.post("/api/advisor/chat")
async def advisor_chat_endpoint(request: Request):
    payload = await request.json()
    status, data = handle_advisor_chat(payload)
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=status, content=data)

@app.post("/api/advisor/action")
async def advisor_action_endpoint(request: Request):
    payload = await request.json()
    status, data = handle_advisor_action(payload)
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=status, content=data)
