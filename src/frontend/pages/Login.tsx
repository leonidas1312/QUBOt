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
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 text-left space-y-6 p-4">
          <h1 className="text-5xl font-bold text-gray-800">QUBOt</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to QUBOt - Your Quantum Optimization Platform
          </p>
          <p className="text-gray-600">
            Sign in to access the playground and start optimizing your QUBO problems with our quantum-inspired solvers.
          </p>
        </div>

        <div className="w-full md:w-1/2">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#7F56D9",
                      brandAccent: "#44337A",
                      inputBackground: "#fff",
                      inputBorder: "#ccc",
                      inputText: "#444",
                    },
                  },
                },
              }}
              providers={["github"]}
              redirectTo={`${window.location.origin}/playground`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login