import React, { useState, useEffect } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"  // Adjust path if needed
import { useNavigate } from "react-router-dom"
import { useSession } from "@supabase/auth-helpers-react"
import { motion, useMotionValue, useSpring } from "framer-motion"

const DynamicIndustry = () => {
  // List of industries or domains you want to cycle through
  const industries = [
    "finance",
    "healthcare",
    "manufacturing",
    "transportation",
    "retail",
    "energy",
    "logistics",
  ]
  const [currentIndustry, setCurrentIndustry] = useState(industries[0])

  // Cycle to the next industry every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndustry((prev) => {
        const currentIndex = industries.indexOf(prev)
        return industries[(currentIndex + 1) % industries.length]
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [industries])

  return (
    <div className="h-[50px] relative overflow-hidden">
      <motion.p
        key={currentIndustry}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="text-lg text-gray-600 absolute w-full"
      >
        Powering optimization across{" "}
        <span className="font-semibold text-gray-800">
          {currentIndustry}
        </span>{" "}
        with QUBOt.
      </motion.p>
    </div>
  )
}

const Login = () => {
  const session = useSession()
  const navigate = useNavigate()

  // Track the mouse for the background orb's position
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 500, damping: 100 })
  const springY = useSpring(mouseY, { stiffness: 500, damping: 100 })

  // If user is already logged in, redirect them to playground (or whichever route)
  useEffect(() => {
    if (session) {
      navigate("/playground")
    }
  }, [session, navigate])

  // Update orb position on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  // Simple up-and-down floating animation for the background orbs
  const floatingAnimation = {
    animate: {
      y: ["100px", "-500px", "100px"],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* 1) Orb that follows the cursor */}
      <motion.div
        className="pointer-events-none absolute w-[350px] h-[350px] bg-purple-400/50 rounded-full blur-3xl"
        style={{
          x: springX,
          y: springY,
          translateX: "-150%",
          translateY: "-150%",
        }}
      />
      
      {/* 2) Floating orbs in the background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-purple-300/20 rounded-full blur-2xl"
          animate={floatingAnimation.animate}
        />
        <motion.div
          className="absolute -bottom-28 -left-16 w-72 h-72 bg-blue-300/20 rounded-full blur-2xl"
          animate={{
            ...floatingAnimation.animate,
            transition: {
              ...floatingAnimation.animate.transition,
              delay: 1,
            },
          }}
        />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col md:flex-row items-center gap-8">
        {/* Left side: Title & small mission statement */}
        <div className="w-full md:w-1/2 text-left space-y-6 p-4">
          <h1 className="text-5xl font-bold text-gray-800">QUBOt</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
          Accelerate your research and solve real-world QUBO problems with our collaborative, 
          cloud-based optimization platform. We offer a user-friendly environment to upload datasets, 
          experiment with diverse algorithms, and seamlessly scale to high-performance hardware as your needs grow.
          </p>
        </div>

        {/* Right side: Auth form */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#7F56D9",       // main brand color
                      brandAccent: "#44337A", // accent or hover color
                      inputBackground: "#fff",
                      inputBorder: "#ccc",
                      inputText: "#444",
                    },
                  },
                },
                style: {
                  button: {
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "500",
                    padding: "10px 15px",
                  },
                  input: {
                    borderRadius: "8px",
                    fontSize: "16px",
                    padding: "10px 15px",
                    backgroundColor: "#fff",
                    color: "#444",
                  },
                  label: {
                    color: "#555",
                  },
                },
              }}
              providers={["github"]}
              redirectTo={`${window.location.origin}/login`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
