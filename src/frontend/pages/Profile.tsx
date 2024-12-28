import { useSession } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ItemGrid } from "@/components/uploads/ItemGrid"

const Profile = () => {
  const session = useSession()

  const { data: userSolvers } = useQuery({
    queryKey: ['userSolvers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solvers')
        .select('*')
        .eq('user_id', session?.user?.id)
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  const { data: userDatasets } = useQuery({
    queryKey: ['userDatasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', session?.user?.id)
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  if (!session) return null

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session.user.user_metadata.avatar_url} />
            <AvatarFallback>
              {session.user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {session.user.email}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(session.user.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="solvers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solvers">My Solvers</TabsTrigger>
          <TabsTrigger value="datasets">My Datasets</TabsTrigger>
        </TabsList>
        <TabsContent value="solvers">
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-6">My Solvers</h2>
            {userSolvers?.length === 0 ? (
              <p className="text-muted-foreground">You haven't uploaded any solvers yet.</p>
            ) : (
              <ItemGrid items={userSolvers || []} type="solver" />
            )}
          </div>
        </TabsContent>
        <TabsContent value="datasets">
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-6">My Datasets</h2>
            {userDatasets?.length === 0 ? (
              <p className="text-muted-foreground">You haven't uploaded any datasets yet.</p>
            ) : (
              <ItemGrid items={userDatasets || []} type="dataset" />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile