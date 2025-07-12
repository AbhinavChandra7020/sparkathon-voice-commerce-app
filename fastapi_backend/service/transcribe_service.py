from fastapi import UploadFile
from pydub import AudioSegment
import os
from utility import transcribe_audio

class Transcribe:
    def __init__(self):
        pass

    def speech_to_text(self, audio_file: UploadFile):

        if audio_file.filename.lower().endswith(".wav"):
        
            try:
                sound = AudioSegment.from_file(audio_file.file)
                base_name = os.path.splitext(audio_file.filename)[0]
                output_wav_path = f"converted_{base_name}.wav"
                sound.export(output_wav_path, format="wav")

            except Exception as e:
                print(f"Error during conversion: {e}")
                return None

        text = transcribe_audio(output_wav_path)
        os.remove(output_wav_path)
            
        return text
        
