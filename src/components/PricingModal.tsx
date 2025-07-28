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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface PricingModalProps {
  children: React.ReactNode;
}

const PREMIUM_PRICE_ID = ""; // Mismo ID que en la API

export function PricingModal({ children }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: PREMIUM_PRICE_ID,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Error al crear sesión de pago");
      }
    } catch (error) {
      console.error("Error upgrading:", error);
      toast.error(
        "Error al procesar pago: No se pudo procesar tu solicitud. Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Actualizar a Premium
          </DialogTitle>
          <DialogDescription>
            Desbloquea todo el potencial del generador de tests con IA
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 py-4">
          {/* Plan Actual */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Plan Básico
                <Badge variant="secondary">Actual</Badge>
              </CardTitle>
              <CardDescription>Tu plan actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">$0/mes</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />3 generaciones por
                  mes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  JavaScript y Python
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Soporte básico
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Plan Premium */}
          <Card className="border-2 border-yellow-500 relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-500 hover:bg-yellow-500">
                <Crown className="h-3 w-3 mr-1" />
                Recomendado
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Plan Premium
                <Badge className="bg-yellow-100 text-yellow-800">Upgrade</Badge>
              </CardTitle>
              <CardDescription>
                Para desarrolladores profesionales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">$19/mes</div>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <strong>Generaciones ilimitadas</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Todos los lenguajes soportados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Soporte prioritario
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Configuración avanzada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Historial de tests
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Exportación masiva
                </li>
              </ul>
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Actualizar Ahora
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>✅ Cancela en cualquier momento</p>
          <p>✅ Facturación segura con Stripe</p>
          <p>✅ Soporte 24/7</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
