from settings import DEEPGRAM_API_KEY 
import os

from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
)


def transcribe_audio(audio_path):
    try:

        deepgram = DeepgramClient()

        with open(audio_path, "rb") as file:
            buffer_data = file.read()

        payload: FileSource = {
            "buffer": buffer_data,
        }

        options = PrerecordedOptions(
            model="nova-3",
            smart_format=True,
        )

        response = deepgram.listen.rest.v("1").transcribe_file(payload, options)

        return response.results.channels[0].alternatives[0].transcript

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    transcribe_audio("harvard.wav")
