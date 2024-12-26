import { Home, LogIn, Database, Box, Users, Terminal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Home",
    icon: Home,
    url: "/",
  },
  {
    title: "Login",
    icon: LogIn,
    url: "/login",
  },
  {
    title: "Solvers",
    icon: Box,
    url: "/solvers",
  },
  {
    title: "Datasets",
    icon: Database,
    url: "/datasets",
  },
  {
    title: "Playground",
    icon: Terminal,
    url: "/playground",
  },
  {
    title: "Community",
    icon: Users,
    url: "/community",
  },
]

export function AppSidebar() {
  const navigate = useNavigate()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => navigate(item.url)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}