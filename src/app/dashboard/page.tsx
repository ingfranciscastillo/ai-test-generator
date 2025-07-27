import { redirect } from "next/navigation";
import DashboardClient from "./_components/dashboard-client";
import { auth } from "@clerk/nextjs/server";
import { checkUserSubscription } from "@/lib/suscription";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const suscription = await checkUserSubscription(userId);

  return <DashboardClient subscription={suscription} />;
}
