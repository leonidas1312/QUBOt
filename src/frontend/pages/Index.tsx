import { useSession } from "@supabase/auth-helpers-react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LandingView } from "@/components/dashboard/LandingView";

const Index = () => {
  const session = useSession();

  if (session) {
    return <DashboardView />;
  }

  return <LandingView />;
};

export default Index;