from fastapi import FastAPI, File, UploadFile, HTTPException
from service import Transcribe
from agents.recommendation_agent import ProductAgent, ProductMatchResponse

app = FastAPI()

try:
    agent = ProductAgent()
except ValueError as e:
    print(f"Warning: Could not initialize ProductAgent: {e}")
    agent = None

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/transcribe/")
async def upload_audio(file: UploadFile = File(...)):

    transcriber = Transcribe()
    text = transcriber.speech_to_text(file)

    return text

@app.post("/find-products/")
async def find_products(requirements: str):
    """Find products based on text requirements"""
    if not agent:
        raise HTTPException(status_code=500, detail="Product agent not initialized. Please set GROQ_API_KEY environment variable.")
    
    try:
        customer_requirements = requirements
        if not customer_requirements:
            raise HTTPException(status_code=400, detail="Requirements text is required")
        
        # Find matching products
        result = agent.find_matching_products(customer_requirements)
        
        return ProductMatchResponse(
            matched_products=result.matched_products,
            reasoning=result.reasoning,
            confidence_score=result.confidence_score,
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Product matching failed: {str(e)}")

@app.post("/voice-to-products/")
async def voice_to_products(file: UploadFile = File(...)):
    """Complete workflow: transcribe audio and find matching products"""
    if not agent:
        raise HTTPException(status_code=500, detail="Product agent not initialized. Please set GROQ_API_KEY environment variable.")
    
    try:
        # Step 1: Transcribe audio
        transcriber = Transcribe()
        transcribed_text = transcriber.speech_to_text(file)
        
        if not transcribed_text:
            raise HTTPException(status_code=400, detail="Failed to transcribe audio")
        
        # Step 2: Find matching products
        result = agent.find_matching_products(transcribed_text)
        
        return {
            "transcribed_text": transcribed_text,
            "matched_products": result.matched_products,
            "reasoning": result.reasoning,
            "confidence_score": result.confidence_score,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice to products workflow failed: {str(e)}")