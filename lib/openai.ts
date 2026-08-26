import OpenAI, { toFile } from "openai";

let _openai: OpenAI | null = null;

/**
 * Claude no transcribe audio de forma nativa, así que las notas de voz pasan
 * por Whisper (OpenAI) antes de llegar al resumen ejecutivo de Claude.
 * Instancia perezosa por la misma razón que lib/stripe.ts y lib/anthropic.ts:
 * evitar que falte OPENAI_API_KEY rompa `next build`.
 */
function getOpenAiClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
): Promise<string> {
  const file = await toFile(audioBuffer, filename);
  const transcription = await getOpenAiClient().audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "es",
  });
  return transcription.text.trim();
}
