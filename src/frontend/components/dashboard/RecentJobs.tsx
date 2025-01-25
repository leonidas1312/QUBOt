import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useSession } from "@supabase/auth-helpers-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export const RecentJobs = () => {
  const session = useSession()
  const { data: recentJobs } = useQuery({
    queryKey: ['recentJobs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('optimization_jobs')
        .select('*, solver:solvers(name), dataset:datasets(name)')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(5)
      return data || []
    },
    enabled: !!session?.user?.id
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {recentJobs?.map((job) => (
            <div
              key={job.id}
              className="mb-4 flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(job.status)}
                <div>
                  <p className="text-sm font-medium">
                    {job.solver?.name} → {job.dataset?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(job.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-medium ${
                job.status === 'COMPLETED' ? 'text-green-500' :
                job.status === 'FAILED' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {job.status}
              </span>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}