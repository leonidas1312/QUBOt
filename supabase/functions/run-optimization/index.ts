import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../src/frontend/integrations/supabase/types'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  try {
    const { jobId } = await req.json()
    
    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('optimization_jobs')
      .select('*, solver:solvers(*), dataset:datasets(*)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(jobError?.message || 'Job not found')
    }

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
      best_solution: [1, 0, 1, 0],
      cost: -42.5,
      execution_time: 10.5
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
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
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
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})