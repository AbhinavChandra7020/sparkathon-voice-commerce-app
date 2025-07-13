from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from service import Transcribe
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware - this is crucial for direct browser calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # In case you use a different port
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World", "status": "FastAPI server is running"}

@app.post("/transcribe/")
async def upload_audio(file: UploadFile = File(...)):
    try:
        logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
        
        # Validate file type
        if not file.filename or not file.filename.lower().endswith(('.wav', '.mp3', '.webm', '.m4a')):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")
        
        transcriber = Transcribe()
        text = transcriber.speech_to_text(file)
        
        if text is None:
            raise HTTPException(status_code=500, detail="Transcription failed")
        
        logger.info(f"Transcription successful: {text[:100]}...")
        
        # Return just the transcription text as plain text
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content=text, media_type="text/plain")
        
    except Exception as e:
        logger.error(f"Error in transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Transcription service is running"}