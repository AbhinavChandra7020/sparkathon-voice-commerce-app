from fastapi import FastAPI, File, UploadFile
from service import Transcribe

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/transcribe/")
async def upload_audio(file: UploadFile = File(...)):

    transcriber = Transcribe()
    text = transcriber.speech_to_text(file)

    return text
