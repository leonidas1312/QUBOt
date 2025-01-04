import React, { useEffect } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate, useLocation } from "react-router-dom"
import { useSession } from "@supabase/auth-helpers-react"

const Login = () => {
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (session) {
      const from = location.state?.from || "/playground"
      navigate(from, { replace: true })
    }
  }, [session, navigate, location])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-700/10 via-orange-500/10 to-green-500/10 flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 text-left space-y-6 p-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-orange-500">
            Welcome Back
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sign in to access the QUBOt platform and start optimizing your QUBO problems with our quantum-inspired solvers.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Access to powerful optimization solvers
            </p>
            <p className="text-sm text-muted-foreground">
              • Upload and manage your datasets
            </p>
            <p className="text-sm text-muted-foreground">
              • Track your optimization jobs
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="backdrop-blur-xl bg-white/30 p-8 rounded-lg shadow-lg border border-white/20">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#7E69AB",
                      brandAccent: "#6E59A5",
                      inputBackground: "white",
                      inputBorder: "#E5DEFF",
                      inputText: "#1A1F2C",
                      inputPlaceholder: "#8E9196",
                    },
                    borderWidths: {
                      buttonBorderWidth: "1px",
                      inputBorderWidth: "1px",
                    },
                    radii: {
                      borderRadiusButton: "0.5rem",
                      buttonBorderRadius: "0.5rem",
                      inputBorderRadius: "0.5rem",
                    },
                  },
                },
                style: {
                  button: {
                    padding: "10px 15px",
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                  input: {
                    padding: "10px 15px",
                  },
                  anchor: {
                    color: "#6E59A5",
                    fontSize: "14px",
                  },
                  message: {
                    padding: "10px",
                    margin: "10px 0",
                    borderRadius: "0.5rem",
                  },
                },
              }}
              providers={["github"]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login