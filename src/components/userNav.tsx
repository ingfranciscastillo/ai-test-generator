"use client";

import { UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { PricingModal } from "./PricingModal";

interface UserNavProps {
  user: any;
  subscription: {
    isPremium: boolean;
    generationsUsed: number;
    maxGenerations: number;
  };
}

export function UserNav({ user, subscription }: UserNavProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {subscription.isPremium ? (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {subscription.generationsUsed}/{subscription.maxGenerations}
            </Badge>
            <PricingModal>
              <Button variant="outline" size="sm">
                Actualizar
              </Button>
            </PricingModal>
          </div>
        )}
      </div>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          },
        }}
      />
    </div>
  );
}
