import { Injectable } from '@nestjs/common';
import { AIStrategy } from './ai-strategy.interface';
import { AnalysisResult, AnalysisConfig } from './analysis.types';

@Injectable()
export class OpenAIStrategy implements AIStrategy {
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private readonly apiKey: string) {}

  async analyze(content: string, config: AnalysisConfig): Promise<AnalysisResult> {
    const prompt = this.buildPrompt(content, config);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente experto en análisis de contenido. Analiza el texto proporcionado y genera un análisis estructurado en JSON.

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "executiveSummary": "string (resumen ejecutivo en 3-8 oraciones)",
  "keyPoints": [{ "text": "string", "relevanceScore": number(1-10) }],
  "quotes": [{ "text": "string", "attribution": "string|null", "context": "string|null" }],
  "stats": [{ "label": "string", "value": "string", "context": "string|null" }],
  "tone": "string (general|technical|academic|journalistic)",
  "sentiment": "string (positive|negative|neutral)"
}`,
          },
          { role: 'user', content: `Modo: ${config.mode}, Longitud: ${config.length}\n\nTexto:\n${content}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result as AnalysisResult;
  }

  private buildPrompt(content: string, config: AnalysisConfig): string {
    const lengthInstr = {
      brief: 'genera un resumen MUY CONCISO de 2-3 oraciones',
      normal: 'genera un resumen completo de 5-7 oraciones',
      detailed: 'genera un resumen detallado con 8-10 oraciones cubriendo todos los aspectos importantes',
    };

    return `Analiza el siguiente texto en modo "${config.mode}": ${lengthInstr[config.length]}\n\n${content}`;
  }
}
