"use client";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Zap, Shield, Sparkles, Github } from "lucide-react";
import BuyMeaCoffee from "@/components/BuyMeACoffee";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  if (isSignedIn && user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
      <div className="container mx-auto px-4 py-16">
        <nav>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Code className="h-10 w-10 text-indigo-500" />
              <h1 className="text-3xl font-bold text-slate-500">
                AI Test Generator
              </h1>
            </div>
            <div className="space-x-4">
              <SignUpButton mode="modal">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Crear Cuenta
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" className=" hover:text-indigo-600">
                  Iniciar Sesión
                </Button>
              </SignInButton>
            </div>
          </div>
        </nav>
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Code className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-bold text-slate-900">
              Generador de Tests con IA
            </h1>
          </div>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Genera tests automáticamente para tu código usando inteligencia
            artificial. Ahorra tiempo y mejora la calidad de tus pruebas.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Generación Instantánea</CardTitle>
              <CardDescription>
                Obtén tests completos en segundos. Solo pega tu código y deja
                que la IA haga el resto.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>IA Avanzada</CardTitle>
              <CardDescription>
                Powered by Claude AI para generar tests inteligentes que cubren
                casos edge y escenarios complejos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Múltiples Lenguajes</CardTitle>
              <CardDescription>
                Soporte para JavaScript, Python, Java, C# y más. Tests adaptados
                a cada framework.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Planes Disponibles
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Plan Básico
                  <Badge variant="secondary">Gratis</Badge>
                </CardTitle>
                <CardDescription>
                  Perfecto para probar la herramienta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$0/mes</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 3 generaciones por mes</li>
                  <li>• Soporte básico</li>
                  <li>• Tests para JavaScript y Python</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-500 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-indigo-500">
                Recomendado
              </Badge>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Plan Premium
                  <Badge className="bg-indigo-100 text-indigo-800">
                    Popular
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Para desarrolladores profesionales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$19/mes</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Generaciones ilimitadas</li>
                  <li>• Soporte prioritario</li>
                  <li>• Todos los lenguajes soportados</li>
                  <li>• Configuración avanzada</li>
                  <li>• Historial de tests</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              ¿Listo para empezar?
            </h3>
            <p className="text-gray-600 mb-6">
              Únete y comienza a generar tests automáticamente
            </p>
            <div className="space-y-3">
              <SignUpButton mode="modal">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Crear Cuenta Gratis
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full">
                  Ya tengo cuenta
                </Button>
              </SignInButton>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500 flex flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/ingfranciscastillo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="size-6" />
          </a>
          <a
            href="http://coff.ee/franciscas7"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BuyMeaCoffee className="size-6" />
          </a>
        </footer>
      </div>
    </div>
  );
}
