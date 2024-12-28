import { Toaster } from "/components/ui/toaster"
import { Toaster as Sonner } from "/components/ui/sonner"
import { TooltipProvider } from "/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useSession } from "@supabase/auth-helpers-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
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
  
  useEffect(() => {
    if (!session) {
      navigate('/login')
    }
  }, [session, navigate])

  if (!session) {
    return null
  }

  return <>{children}</>
}

const UserMenu = () => {
  const session = useSession()
  const navigate = useNavigate()
  
  if (!session?.user) return null

  return (
    <div className="absolute top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={session.user.user_metadata.avatar_url} />
            <AvatarFallback>
              {session.user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const App = () => {
  const session = useSession()

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.id)
      }
      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
                    element={
                      session ? <Navigate to="/playground" replace /> : <Login />
                    } 
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