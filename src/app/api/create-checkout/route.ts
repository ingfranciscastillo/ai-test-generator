import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  createCheckoutSession,
  createStripeCustomer,
} from "@/lib/subscription";

// Price ID del plan Premium en Stripe (debes configurar esto en tu dashboard de Stripe)
const PREMIUM_PRICE_ID = "price_1234567890"; // Reemplazar con tu Price ID real

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const { priceId } = await req.json();

    // Validar priceId
    if (priceId !== PREMIUM_PRICE_ID) {
      return NextResponse.json({ error: "Plan no válido" }, { status: 400 });
    }

    try {
      // Crear customer en Stripe si no existe
      await createStripeCustomer(userId, user.emailAddresses[0].emailAddress);

      // Crear sesión de checkout
      const session = await createCheckoutSession(userId, priceId);

      return NextResponse.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return NextResponse.json(
        { error: "Error al crear sesión de pago" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
