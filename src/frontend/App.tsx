import { Toaster } from "/components/ui/toaster"
import { Toaster as Sonner } from "/components/ui/sonner"
import { TooltipProvider } from "/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"
import { UserCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Solvers from "./pages/Solvers"
import Datasets from "./pages/Datasets"
import Playground from "./pages/Playground"
import Community from "./pages/Community"
import Profile from "./pages/Profile"

const queryClient = new QueryClient()

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    if (!session) {
      // Save the attempted URL
      navigate('/login', { state: { from: location.pathname } })
    }
  }, [session, navigate, location])

  if (!session) {
    return null
  }

  return <>{children}</>
}

const UserMenu = () => {
  const session = useSession()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  if (!session?.user) return null

  const avatarUrl = session.user.user_metadata?.avatar_url
  const email = session.user.email
  const initial = email ? email.charAt(0).toUpperCase() : 'U'

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/')
      toast({
        title: "Signed out successfully",
        duration: 2000,
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error signing out",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  return (
    <div className="absolute top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="User avatar" />
            ) : (
              <AvatarFallback>
                <UserCircle className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.id)
        toast({
          title: "Signed in successfully",
          duration: 2000,
        })
      }
      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        toast({
          title: "Signed out successfully",
          duration: 2000,
        })
      }
      setIsLoading(false)
    })

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [toast])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <UserMenu />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route 
                    path="/login" 
                    element={<Login />}
                  />
                  <Route path="/solvers" element={<Solvers />} />
                  <Route path="/datasets" element={<Datasets />} />
                  <Route 
                    path="/playground" 
                    element={
                      <ProtectedRoute>
                        <Playground />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/community" element={<Community />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App