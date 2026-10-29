export type TargetLanguage = "es-ES" | "fr-FR" | "de-DE" | "zh-CN"

export const TARGET_LANGUAGES: { value: TargetLanguage; label: string; short: string }[] = [
  { value: "es-ES", label: "Spanish (Spain)", short: "Spanish" },
  { value: "fr-FR", label: "French (France)", short: "French" },
  { value: "de-DE", label: "German (Germany)", short: "German" },
  { value: "zh-CN", label: "Chinese (Simplified, China)", short: "Chinese" },
]

export type DemoId = "business" | "travel" | "support"

export type Phrase = {
  source: string
  targets: Record<TargetLanguage, string>
}

export type DemoScript = {
  id: DemoId
  label: string
  sourceLanguage: string
  phrases: Phrase[]
}

export const DEMO_SCRIPTS: Record<DemoId, DemoScript> = {
  business: {
    id: "business",
    label: "Business meeting",
    sourceLanguage: "English",
    phrases: [
      {
        source: "Good morning, everyone.",
        targets: {
          "es-ES": "Buenos días a todos.",
          "fr-FR": "Bonjour à tous.",
          "de-DE": "Guten Morgen, alle zusammen.",
          "zh-CN": "大家早上好。",
        },
      },
      {
        source: "Thank you for joining today’s meeting.",
        targets: {
          "es-ES": "Gracias por acompañarnos en la reunión de hoy.",
          "fr-FR": "Merci de participer à la réunion d’aujourd’hui.",
          "de-DE": "Vielen Dank, dass Sie an der heutigen Besprechung teilnehmen.",
          "zh-CN": "感谢大家参加今天的会议。",
        },
      },
      {
        source: "We will review the latest customer feedback",
        targets: {
          "es-ES": "Revisaremos los comentarios más recientes de los clientes",
          "fr-FR": "Nous allons examiner les derniers retours des clients",
          "de-DE": "Wir werden das neueste Kundenfeedback prüfen",
          "zh-CN": "我们将回顾最新的客户反馈，",
        },
      },
      {
        source: "and discuss the next steps for the Live Interpreter experience.",
        targets: {
          "es-ES": "y analizaremos los próximos pasos para la experiencia de Live Interpreter.",
          "fr-FR": "et discuter des prochaines étapes pour l’expérience Live Interpreter.",
          "de-DE": "und die nächsten Schritte für die Live Interpreter-Erfahrung besprechen.",
          "zh-CN": "并讨论 Live Interpreter 体验的后续步骤。",
        },
      },
    ],
  },
  travel: {
    id: "travel",
    label: "Travel",
    sourceLanguage: "English",
    phrases: [
      {
        source: "Excuse me, could you help me find the train station?",
        targets: {
          "es-ES": "Disculpe, ¿podría ayudarme a encontrar la estación de tren?",
          "fr-FR": "Excusez-moi, pourriez-vous m’aider à trouver la gare ?",
          "de-DE": "Entschuldigung, könnten Sie mir helfen, den Bahnhof zu finden?",
          "zh-CN": "打扰一下，您能帮我找到火车站吗？",
        },
      },
      {
        source: "I need to catch the next train to the airport.",
        targets: {
          "es-ES": "Necesito tomar el próximo tren al aeropuerto.",
          "fr-FR": "Je dois prendre le prochain train pour l’aéroport.",
          "de-DE": "Ich muss den nächsten Zug zum Flughafen nehmen.",
          "zh-CN": "我需要赶下一班去机场的火车。",
        },
      },
      {
        source: "How long does the trip usually take?",
        targets: {
          "es-ES": "¿Cuánto suele durar el viaje?",
          "fr-FR": "Combien de temps dure généralement le trajet ?",
          "de-DE": "Wie lange dauert die Fahrt normalerweise?",
          "zh-CN": "路程通常需要多长时间？",
        },
      },
    ],
  },
  support: {
    id: "support",
    label: "Customer support",
    sourceLanguage: "English",
    phrases: [
      {
        source: "Hi, thanks for calling. How can I help you today?",
        targets: {
          "es-ES": "Hola, gracias por llamar. ¿En qué puedo ayudarle hoy?",
          "fr-FR": "Bonjour, merci de votre appel. Comment puis-je vous aider aujourd’hui ?",
          "de-DE": "Hallo, danke für Ihren Anruf. Wie kann ich Ihnen heute helfen?",
          "zh-CN": "您好，感谢您的来电。今天有什么可以帮您？",
        },
      },
      {
        source: "I’m sorry to hear your order arrived damaged.",
        targets: {
          "es-ES": "Lamento que su pedido haya llegado dañado.",
          "fr-FR": "Je suis désolé d’apprendre que votre commande est arrivée endommagée.",
          "de-DE": "Es tut mir leid, dass Ihre Bestellung beschädigt angekommen ist.",
          "zh-CN": "很抱歉听说您的订单到货时已损坏。",
        },
      },
      {
        source: "I’ll send a replacement right away at no extra cost.",
        targets: {
          "es-ES": "Le enviaré un reemplazo de inmediato sin costo adicional.",
          "fr-FR": "Je vous envoie un remplacement immédiatement, sans frais supplémentaires.",
          "de-DE": "Ich schicke Ihnen sofort kostenlos einen Ersatz.",
          "zh-CN": "我会立即免费为您寄送替换商品。",
        },
      },
    ],
  },
}

export function tokenize(text: string, language: TargetLanguage | "source") {
  if (language === "zh-CN") {
    const chars = Array.from(text)
    const chunks: string[] = []
    for (let i = 0; i < chars.length; i += 2) chunks.push(chars.slice(i, i + 2).join(""))
    return { tokens: chunks, joiner: "" }
  }
  return { tokens: text.split(" "), joiner: " " }
}
