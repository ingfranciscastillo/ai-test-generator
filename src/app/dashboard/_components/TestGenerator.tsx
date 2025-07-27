"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, Download, Zap, Lock } from "lucide-react";
import { generateTest } from "../_actions/generate_test";
import { toast } from "sonner";

interface TestGeneratorProps {
  userId: string;
  subscription: {
    isPremium: boolean;
    generationsUsed: number;
    maxGenerations: number;
  };
}

const SUPPORTED_LANGUAGES = [
  {
    value: "javascript",
    label: "JavaScript",
    frameworks: ["Jest", "Mocha", "Vitest"],
  },
  { value: "typescript", label: "TypeScript", frameworks: ["Jest", "Vitest"] },
  { value: "python", label: "Python", frameworks: ["pytest", "unittest"] },
  { value: "java", label: "Java", frameworks: ["JUnit"] },
  { value: "csharp", label: "C#", frameworks: ["NUnit", "xUnit"] },
  { value: "go", label: "Go", frameworks: ["testing"] },
];

export function TestGenerator({ userId, subscription }: TestGeneratorProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [generatedTest, setGeneratedTest] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canGenerate =
    subscription.isPremium ||
    subscription.generationsUsed < subscription.maxGenerations;

  const handleGenerate = async () => {
    if (!code.trim() || !language) {
      toast(`Por favor, ingresa código y selecciona un lenguaje.`);
      return;
    }

    if (!canGenerate) {
      toast(
        `Has alcanzado el límite de generaciones. Actualiza a Premium para continuar.`
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateTest(code, language, userId);

      if (result.success) {
        setGeneratedTest(result.test || "");
        toast(
          "¡Test generado exitosamente!\nTu test ha sido creado y está listo para usar."
        );
      } else {
        toast(
          `Error al generar test: ${
            result.error || "Ocurrió un error inesperado."
          }`
        );
      }
    } catch (error) {
      toast(
        `Error de conexión: No se pudo conectar con el servidor. Intenta nuevamente. (${error})`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedTest);
      toast("¡Copiado! El test ha sido copiado al portapapeles.");
    } catch (error) {
      toast(`Error al copiar: No se pudo copiar al portapapeles (${error}).`);
    }
  };

  const downloadTest = () => {
    const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.value === language);
    const extension =
      language === "javascript" || language === "typescript"
        ? "js"
        : language === "python"
        ? "py"
        : language === "java"
        ? "java"
        : language === "csharp"
        ? "cs"
        : "txt";

    const blob = new Blob([generatedTest], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Estado de tu Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={subscription.isPremium ? "default" : "secondary"}>
                {subscription.isPremium ? "Premium" : "Básico"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {subscription.isPremium
                  ? "Generaciones ilimitadas"
                  : `${subscription.generationsUsed}/${subscription.maxGenerations} generaciones usadas este mes`}
              </p>
            </div>
            {!subscription.isPremium && (
              <Button variant="outline" size="sm">
                Actualizar a Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Código</CardTitle>
            <CardDescription>
              Pega aquí el código para el cual quieres generar tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el lenguaje" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="// Pega aquí tu código
function sum(a, b) {
  return a + b;
}"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !canGenerate}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando test...
                </>
              ) : !canGenerate ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Límite alcanzado
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generar Test
                </>
              )}
            </Button>

            {!canGenerate && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Has alcanzado el límite de {subscription.maxGenerations}{" "}
                  generaciones para el plan básico. Actualiza a Premium para
                  obtener generaciones ilimitadas.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test Generado</CardTitle>
            <CardDescription>Tu test automático aparecerá aquí</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedTest ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedTest}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                  <Button
                    onClick={downloadTest}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>El test generado aparecerá aquí</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
