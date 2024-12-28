import { Toaster } from "/components/ui/toaster"
import { Toaster as Sonner } from "/components/ui/sonner"
import { TooltipProvider } from "/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
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
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
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
  
  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const UserMenu = () => {
  const session = useSession()
  const navigate = useNavigate()
  
  if (!session) return null

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

const App = () => (
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
                <Route path="/login" element={<Login />} />
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

export default App