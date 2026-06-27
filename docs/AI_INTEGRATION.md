# AI Integration — Content Whisperer

## AI Ladder: Rung 2-3 (Structured Summarization + Multi-Format Extraction)

### Strategy Pattern Architecture

```
AnalysisController
  → AnalysisService (strategy selector)
    → AIStrategy interface
      → OpenAIStrategy (when OPENAI_API_KEY is set)
      → LocalFallbackStrategy (when no API key)
```

### OpenAI Strategy (requires API key)

Uses `gpt-4o-mini` with structured JSON output:

- **Model:** gpt-4o-mini (fast, cost-effective)
- **Response format:** JSON object via `response_format: { type: "json_object" }`
- **Temperature:** 0.3 (low creativity for structured extraction)
- **System prompt:** Instructs the model to return a specific JSON schema
- **User prompt:** Mode (general/technical/academic/news) + length (brief/normal/detailed) + content

### LocalFallback Strategy (default, no API key needed)

Multi-step heuristic analysis:

1. **Executive Summary:** Extractive — takes the first N sentences from the content (N = 3/5/8 based on length)
2. **Key Points:** TF-IDF-like scoring — term frequency analysis to find the most information-dense sentences
3. **Quote Extraction:** Regex-based detection of quoted text patterns (Spanish/English quotation marks)
4. **Stats Extraction:** Regex pattern matching for numbers with percentage signs and context words
5. **Tone Analysis:** Keyword counting for technical/academic/journalistic vocabulary
6. **Sentiment Analysis:** Positive vs negative keyword ratio

### Analysis Dimensions

| Dimension | OpenAI Strategy | LocalFallback Strategy |
|-----------|----------------|----------------------|
| Executive Summary | Generative LLM summary | Extractive (first sentences) |
| Key Points | LLM-identified key takeaways | TF-IDF sentence scoring |
| Quotes | LLM extracts relevant quotes | Regex pattern matching |
| Stats | LLM extracts numerical data | Regex pattern matching |
| Tone | LLM classifies | Keyword frequency |
| Sentiment | LLM classifies | Word list ratio |

### LocalFallback Limitations

- Summary is extractive (cuts from beginning) not abstractive (rewritten)
- Quote detection only works with explicit quotation marks
- Stats extraction misses context-heavy data
- Tone/sentiment is keyword-based, not semantic

### Future AI Enhancements

1. **Rung 3: Semantic Search** — Use pgvector on Neon for embedding-based source retrieval
2. **Rung 4: RAG** — Full retrieval-augmented generation for answering questions across sources
3. **Rung 5: Tool-using Agent** — Backend tools for comparing sources, cross-referencing, knowledge graph building
4. **Multi-language support** — Expand Spanish keyword dictionaries to English
