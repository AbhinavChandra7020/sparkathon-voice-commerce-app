// app/api/voice-file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const userId = formData.get('userId') as string;
    const timestamp = formData.get('timestamp') as string;

    // Validation
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    console.log('Received audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      userId,
      timestamp
    });

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create filename with readable date-time format
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
    const recordingNumber = Date.now() % 10000; // Last 4 digits for uniqueness
    
    const fileName = `${date}-${time}-Recording${recordingNumber}.wav`;
    const filePath = path.join(process.cwd(), fileName);

    // Save file to project root
    await writeFile(filePath, buffer);

    console.log(`File saved to: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: "File successfully uploaded",
      transcription: "I heard your voice message (transcription coming soon!)",
      recommendations: "Based on your voice message, here are some product recommendations!",
      fileName: fileName,
      fileSize: audioFile.size,
      filePath: filePath
    });

  } catch (error) {
    console.error('Error processing voice file:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process voice file',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}