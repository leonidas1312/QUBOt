import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export default function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast.success('Successfully signed in!')
        navigate("/")
      } else if (event === 'SIGNED_OUT') {
        toast.info('Signed out')
      }
    })

    // Check for OAuth error messages in URL
    const params = new URLSearchParams(window.location.hash.substring(1))
    const error = params.get('error_description')
    if (error) {
      toast.error(error)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
            }}
            providers={["github"]}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  )
}