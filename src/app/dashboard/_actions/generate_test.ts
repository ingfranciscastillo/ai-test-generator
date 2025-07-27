"use server";

import { auth } from "@clerk/nextjs/server";
import { Anthropic } from "@anthropic-ai/sdk";
import {
  checkUserSubscription,
  incrementUserGenerations,
} from "@/lib/suscription";
import { logTestGeneration } from "@/lib/usage-logs";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateTestResult {
  success: boolean;
  test?: string;
  error?: string;
}

export async function generateTest(
  code: string,
  language: string,
  userId: string
): Promise<GenerateTestResult> {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId || authUserId !== userId) {
      return { success: false, error: "No autorizado" };
    }

    // Verificar suscripción
    const subscription = await checkUserSubscription(userId);

    if (
      !subscription.isPremium &&
      subscription.generationsUsed >= subscription.maxGenerations
    ) {
      return {
        success: false,
        error: "Has alcanzado el límite de generaciones para tu plan actual",
      };
    }

    // Crear prompt estructurado para Claude
    const prompt = createTestPrompt(code, language);

    // Llamada a Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const generatedTest =
      message.content[0].type === "text"
        ? message.content[0].text
        : "Error al generar el test";

    // Incrementar contador de generaciones
    if (!subscription.isPremium) {
      await incrementUserGenerations(userId);
    }

    // Log de uso
    await logTestGeneration(userId, language, code.length);

    return {
      success: true,
      test: generatedTest,
    };
  } catch (error) {
    console.error("Error generating test:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

function createTestPrompt(code: string, language: string): string {
  const frameworkMap: Record<string, string> = {
    javascript: "Jest",
    typescript: "Jest",
    python: "pytest",
    java: "JUnit 5",
    csharp: "NUnit",
    go: "Go testing package",
  };

  const framework = frameworkMap[language] || "framework estándar";

  return `Eres un generador experto de tests automatizados. Tu tarea es crear un archivo de prueba completo y bien estructurado para el código proporcionado.

INSTRUCCIONES:
1. Analiza el código cuidadosamente para entender su funcionalidad
2. Genera tests completos usando ${framework} para ${language}
3. Incluye tests para casos normales, casos edge y validación de errores
4. Usa nombres descriptivos para los tests
5. Añade comentarios explicativos cuando sea necesario
6. Asegúrate de que el código sea ejecutable y siga las mejores prácticas

CÓDIGO A TESTEAR:
\`\`\`${language}
${code}
\`\`\`

Genera un archivo de test completo con múltiples casos de prueba que cubran diferentes escenarios. Responde solo con el código del test, sin explicaciones adicionales.`;
}
