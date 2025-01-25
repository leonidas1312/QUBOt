import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BarChart3, Brain, Database, Users } from "lucide-react"

export const DashboardStats = () => {
  const { data: solversCount } = useQuery({
    queryKey: ['solversCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('solvers')
        .select('*', { count: 'exact', head: true })
      return count || 0
    }
  })

  const { data: datasetsCount } = useQuery({
    queryKey: ['datasetsCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('datasets')
        .select('*', { count: 'exact', head: true })
      return count || 0
    }
  })

  const { data: jobsCount } = useQuery({
    queryKey: ['jobsCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('optimization_jobs')
        .select('*', { count: 'exact', head: true })
      return count || 0
    }
  })

  const { data: usersCount } = useQuery({
    queryKey: ['usersCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      return count || 0
    }
  })

  const stats = [
    {
      title: "Total Solvers",
      value: solversCount || 0,
      icon: Brain,
      description: "Optimization solvers available"
    },
    {
      title: "Total Datasets",
      value: datasetsCount || 0,
      icon: Database,
      description: "Datasets uploaded"
    },
    {
      title: "Total Jobs",
      value: jobsCount || 0,
      icon: BarChart3,
      description: "Optimization jobs run"
    },
    {
      title: "Total Users",
      value: usersCount || 0,
      icon: Users,
      description: "Registered users"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};