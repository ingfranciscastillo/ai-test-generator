"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { Code } from "lucide-react";
import React from "react";
import { UserNav } from "@/components/userNav";
import { TestGenerator } from "@/components/TestGenerator";

const DashboardClient = ({
  subscription,
}: {
  subscription: {
    isPremium: boolean;
    generationsUsed: number;
    maxGenerations: number;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    resetDate: Date;
  };
}) => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <Skeleton className="h-[300px] w-[300px]" />;
  }

  if (!isSignedIn) {
    return null; // debería estar redirigido antes, pero por si acaso
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Code className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                AI Test Generator
              </h1>
            </div>
            <UserNav user={user} subscription={subscription} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido, {user.firstName || user.emailAddresses[0].emailAddress}
          </h2>
          <p className="text-gray-600">
            Genera tests automáticamente para tu código usando inteligencia
            artificial
          </p>
        </div>

        <TestGenerator userId={user.id} subscription={subscription} />
      </main>
    </div>
  );
};

export default DashboardClient;
