import React, { useEffect } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate, useLocation } from "react-router-dom"
import { useSession } from "@supabase/auth-helpers-react"
import { useTheme } from "next-themes"

const Login = () => {
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()

  useEffect(() => {
    if (session) {
      const from = location.state?.from || "/playground"
      navigate(from, { replace: true })
    }
  }, [session, navigate, location])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5" />
      
      {/* Main content container */}
      <div className="relative w-full max-w-md mx-auto p-6">
        {/* Glass card effect */}
        <div className="backdrop-blur-xl bg-background/30 dark:bg-background/20 rounded-2xl shadow-xl border border-border/20 p-8">
          {/* Logo and title */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-primary"
              >
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
          </div>

          {/* Auth UI with custom theme */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    inputBackground: theme === 'dark' ? 'hsl(var(--background))' : 'white',
                    inputBorder: 'hsl(var(--border))',
                    inputText: 'hsl(var(--foreground))',
                    inputPlaceholder: 'hsl(var(--muted-foreground))',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              style: {
                button: {
                  padding: '10px 15px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                input: {
                  padding: '10px 15px',
                },
                anchor: {
                  color: 'hsl(var(--primary))',
                  fontSize: '14px',
                },
                message: {
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '0.5rem',
                },
                divider: {
                  background: 'hsl(var(--border))',
                },
                label: {
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                  marginBottom: '4px',
                },
              },
            }}
            providers={["github", "google"]}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-8 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">
          Terms of Service
        </a>
        {" and "}
        <a href="#" className="hover:text-foreground transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  )
}

export default Login