import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// Simulación de base de datos en memoria
// En producción, usar una base de datos real como PostgreSQL, MongoDB, etc.
const userSubscriptions: Record<
  string,
  {
    isPremium: boolean;
    generationsUsed: number;
    maxGenerations: number;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    resetDate: Date;
  }
> = {};

export async function checkUserSubscription(userId: string) {
  // Inicializar usuario si no existe
  if (!userSubscriptions[userId]) {
    userSubscriptions[userId] = {
      isPremium: false,
      generationsUsed: 0,
      maxGenerations: 3,
      resetDate: getNextMonthDate(),
    };
  }

  const subscription = userSubscriptions[userId];

  // Verificar si necesita reset mensual
  if (new Date() > subscription.resetDate) {
    subscription.generationsUsed = 0;
    subscription.resetDate = getNextMonthDate();
  }

  // Verificar suscripción de Stripe si es premium
  if (subscription.isPremium && subscription.stripeSubscriptionId) {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      // Si la suscripción está cancelada o expirada
      if (stripeSubscription.status !== "active") {
        subscription.isPremium = false;
        subscription.maxGenerations = 3;
      }
    } catch (error) {
      console.error("Error checking Stripe subscription:", error);
      // En caso de error, mantener el estado actual
    }
  }

  return subscription;
}

export async function incrementUserGenerations(userId: string) {
  if (!userSubscriptions[userId]) {
    await checkUserSubscription(userId); // Inicializar si no existe
  }

  userSubscriptions[userId].generationsUsed += 1;
  return userSubscriptions[userId];
}

export async function createStripeCustomer(userId: string, email: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    if (userSubscriptions[userId]) {
      userSubscriptions[userId].stripeCustomerId = customer.id;
    }

    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
}

export async function createCheckoutSession(userId: string, priceId: string) {
  try {
    const customerId = userSubscriptions[userId]?.stripeCustomerId;

    if (!customerId) {
      throw new Error("Customer not found");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        userId,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function handleSuccessfulPayment(
  customerId: string,
  subscriptionId: string
) {
  try {
    // Encontrar usuario por customerId
    const userId = Object.keys(userSubscriptions).find(
      (id) => userSubscriptions[id].stripeCustomerId === customerId
    );

    if (userId) {
      userSubscriptions[userId].isPremium = true;
      userSubscriptions[userId].stripeSubscriptionId = subscriptionId;
      userSubscriptions[userId].maxGenerations = Infinity;
    }

    return true;
  } catch (error) {
    console.error("Error handling successful payment:", error);
    throw error;
  }
}

export async function handleFailedPayment(subscriptionId: string) {
  try {
    // Encontrar usuario por subscriptionId
    const userId = Object.keys(userSubscriptions).find(
      (id) => userSubscriptions[id].stripeSubscriptionId === subscriptionId
    );

    if (userId) {
      userSubscriptions[userId].isPremium = false;
      userSubscriptions[userId].maxGenerations = 3;
    }

    return true;
  } catch (error) {
    console.error("Error handling failed payment:", error);
    throw error;
  }
}

function getNextMonthDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(1); // Primer día del siguiente mes
  date.setHours(0, 0, 0, 0);
  return date;
}

// Función para obtener stats de usuario (para dashboard admin)
export async function getUserStats(userId: string) {
  const subscription = await checkUserSubscription(userId);
  return {
    ...subscription,
    remainingGenerations: subscription.isPremium
      ? "Ilimitadas"
      : Math.max(0, subscription.maxGenerations - subscription.generationsUsed),
  };
}
