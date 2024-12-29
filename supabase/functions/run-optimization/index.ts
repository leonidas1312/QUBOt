import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const body = await req.json()
    const { jobId } = body
    
    if (!jobId) {
      throw new Error("jobId is missing from request body")
    }

    // Create supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('optimization_jobs')
      .select('*, solver:solvers(*), dataset:datasets(*)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(jobError?.message || 'Job not found')
    }

    // Update job to RUNNING
    await supabase
      .from('optimization_jobs')
      .update({ 
        status: 'RUNNING',
        logs: [...(job.logs || []), 'Starting optimization...']
      })
      .eq('id', jobId)

    // Download solver and dataset
    const { data: solverData, error: solverError } = await supabase.storage
      .from('solvers')
      .download(job.solver.file_path)
    if (solverError || !solverData) {
      throw new Error(`Failed to download solver: ${solverError?.message}`)
    }
    const solverText = await solverData.text()
    const solverBase64 = btoa(solverText)

    const { data: datasetData, error: datasetError } = await supabase.storage
      .from('datasets')
      .download(job.dataset.file_path)
    if (datasetError || !datasetData) {
      throw new Error(`Failed to download dataset: ${datasetError?.message}`)
    }
    const datasetBuffer = await datasetData.arrayBuffer()
    const datasetBase64 = btoa(
      String.fromCharCode(...new Uint8Array(datasetBuffer))
    )

    // Call solver service
    const solverServiceUrl = "http://solver_service:5000"
    console.log('Calling solver service at:', solverServiceUrl)
    
    const resp = await fetch(solverServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solver: solverBase64,
        dataset: datasetBase64,
        parameters: job.parameters
      })
    })

    if (!resp.ok) {
      const errorText = await resp.text()
      console.error('Solver service error:', errorText)
      throw new Error(`Solver service error: ${errorText}`)
    }

    const solverResult = await resp.json()

    // Update job with results
    await supabase
      .from('optimization_jobs')
      .update({
        status: 'COMPLETED',
        results: solverResult,
        logs: [...(job.logs || []), 'Solver completed']
      })
      .eq('id', jobId)

    // Return success response with CORS headers
    return new Response(
      JSON.stringify({ message: 'Job completed successfully', result: solverResult }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in optimization:', error)

    // If we have a jobId from the try block scope, update job status
    try {
      const { jobId } = await req.json()
      if (jobId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        await supabase
          .from('optimization_jobs')
          .update({
            status: 'FAILED',
            error_message: String(error),
            logs: ['Error occurred during optimization:', String(error)]
          })
          .eq('id', jobId)
      }
    } catch (parseError) {
      console.error('Could not parse request body in error handler:', parseError)
    }

    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})