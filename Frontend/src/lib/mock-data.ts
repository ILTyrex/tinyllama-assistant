export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  snippet: string;
  date: Date;
  tags: string[];
  messageCount: number;
  messages: Message[];
}

export const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Análisis de sentimiento",
    snippet: "¿Puedes analizar el sentimiento de este texto sobre cambio climático?",
    date: new Date("2026-03-01"),
    tags: ["PNL", "análisis"],
    messageCount: 12,
    messages: [
      { id: "m1", role: "user", content: "¿Puedes analizar el sentimiento de este texto sobre cambio climático?", timestamp: new Date("2026-03-01T10:00:00") },
      { id: "m2", role: "assistant", content: "Por supuesto. El texto presenta un **sentimiento mixto**: preocupación por los efectos del cambio climático, pero optimismo respecto a las soluciones tecnológicas propuestas.\n\n- **Negativo (40%)**: Referencias a desastres naturales\n- **Positivo (35%)**: Soluciones innovadoras\n- **Neutral (25%)**: Datos estadísticos", timestamp: new Date("2026-03-01T10:01:00") },
      { id: "m3", role: "user", content: "Interesante. ¿Puedes desglosar por párrafo?", timestamp: new Date("2026-03-01T10:02:00") },
      { id: "m4", role: "assistant", content: "Claro, aquí el desglose párrafo por párrafo:\n\n**Párrafo 1:** Sentimiento negativo (72%) — Describe impactos actuales.\n**Párrafo 2:** Sentimiento neutral (65%) — Presenta datos y estadísticas.\n**Párrafo 3:** Sentimiento positivo (80%) — Habla de energías renovables.", timestamp: new Date("2026-03-01T10:03:00") },
    ],
  },
  {
    id: "2",
    title: "Generación de código Python",
    snippet: "Necesito una función para procesar archivos CSV grandes...",
    date: new Date("2026-02-28"),
    tags: ["código", "Python"],
    messageCount: 8,
    messages: [
      { id: "m5", role: "user", content: "Necesito una función para procesar archivos CSV grandes con pandas.", timestamp: new Date("2026-02-28T14:00:00") },
      { id: "m6", role: "assistant", content: "Aquí tienes una función optimizada para procesar CSV grandes:\n\n```python\nimport pandas as pd\n\ndef process_large_csv(filepath, chunksize=10000):\n    chunks = []\n    for chunk in pd.read_csv(filepath, chunksize=chunksize):\n        # Procesar cada chunk\n        processed = chunk.dropna()\n        chunks.append(processed)\n    return pd.concat(chunks)\n```\n\nUsa `chunksize` para controlar el uso de memoria.", timestamp: new Date("2026-02-28T14:01:00") },
    ],
  },
  {
    id: "3",
    title: "Resumen de artículo científico",
    snippet: "Resume este paper sobre redes neuronales transformers...",
    date: new Date("2026-02-27"),
    tags: ["resumen", "IA"],
    messageCount: 5,
    messages: [
      { id: "m7", role: "user", content: "Resume este paper sobre redes neuronales transformers.", timestamp: new Date("2026-02-27T09:00:00") },
      { id: "m8", role: "assistant", content: "## Resumen del Paper\n\nEl artículo presenta una arquitectura basada exclusivamente en mecanismos de atención, eliminando la recurrencia. Los puntos clave son:\n\n1. **Self-attention** permite capturar dependencias a larga distancia\n2. **Multi-head attention** ofrece múltiples representaciones\n3. Resultados SOTA en traducción EN-DE y EN-FR\n4. Entrenamiento significativamente más rápido que modelos RNN", timestamp: new Date("2026-02-27T09:01:00") },
    ],
  },
  {
    id: "4",
    title: "Estrategia de marketing digital",
    snippet: "Ayúdame a crear un plan de contenidos para redes sociales...",
    date: new Date("2026-02-25"),
    tags: ["marketing", "estrategia"],
    messageCount: 15,
    messages: [],
  },
  {
    id: "5",
    title: "Debugging error de TypeScript",
    snippet: "Tengo un error de tipos genéricos que no logro resolver...",
    date: new Date("2026-02-24"),
    tags: ["código", "TypeScript"],
    messageCount: 6,
    messages: [],
  },
];
