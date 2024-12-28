import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { jobId } = await req.json()
    console.log('Starting optimization for job:', jobId)
    
    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('optimization_jobs')
      .select('*, solver:solvers(*), dataset:datasets(*)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(jobError?.message || 'Job not found')
    }

    // Parse QUBO matrix from parameters
    const quboMatrix = JSON.parse(job.parameters.qubo_matrix || '[]')
    console.log('QUBO Matrix size:', quboMatrix.length)

    // Update job status to RUNNING
    await supabase
      .from('optimization_jobs')
      .update({ 
        status: 'RUNNING',
        logs: [...(job.logs || []), 'Starting optimization...']
      })
      .eq('id', jobId)

    // Simulate optimization process with progress updates
    const totalSteps = 5
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate work
      
      await supabase
        .from('optimization_jobs')
        .update({
          logs: [...(job.logs || []), `Step ${step}/${totalSteps} completed`]
        })
        .eq('id', jobId)
    }

    // Update job with results
    const results = {
      best_solution: Array(quboMatrix.length).fill(0).map(() => Math.random() > 0.5 ? 1 : 0),
      cost: -Math.random() * 100,
      execution_time: Math.random() * 10 + 5
    }

    await supabase
      .from('optimization_jobs')
      .update({
        status: 'COMPLETED',
        results,
        logs: [...(job.logs || []), 'Optimization completed successfully']
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({ message: 'Job completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error in optimization:', errorMessage)
    
    // Update job with error status
    await supabase
      .from('optimization_jobs')
      .update({
        status: 'FAILED',
        error_message: errorMessage,
        logs: ['Error occurred during optimization:', errorMessage]
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})