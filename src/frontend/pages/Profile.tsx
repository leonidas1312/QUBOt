import { useSession } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemGrid } from "@/components/uploads/ItemGrid"
import { Skeleton } from "@/components/ui/skeleton"

const Profile = () => {
  const session = useSession()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  const { data: userSolvers, isLoading: solversLoading } = useQuery({
    queryKey: ['userSolvers', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solvers')
        .select('*')
        .eq('user_id', session?.user?.id)

      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  const { data: userDatasets, isLoading: datasetsLoading } = useQuery({
    queryKey: ['userDatasets', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', session?.user?.id)

      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  if (profileLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Username:</strong> {profile?.username}</p>
            {profile?.github_username && (
              <p><strong>GitHub:</strong> {profile.github_username}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="solvers" className="w-full">
        <TabsList>
          <TabsTrigger value="solvers">My Solvers</TabsTrigger>
          <TabsTrigger value="datasets">My Datasets</TabsTrigger>
        </TabsList>
        <TabsContent value="solvers">
          {solversLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ItemGrid items={userSolvers || []} type="solver" />
          )}
        </TabsContent>
        <TabsContent value="datasets">
          {datasetsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ItemGrid items={userDatasets || []} type="dataset" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile