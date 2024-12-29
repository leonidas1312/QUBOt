import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  // Always handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // We'll define jobId in outer scope so we can reference it in catch block
  let jobId: string | undefined = undefined

  try {
    // 1. Parse the JSON from request
    const body = await req.json()
    jobId = body.jobId
    if (!jobId) {
      throw new Error("jobId is missing from request body")
    }

    // 2. Create supabase client from environment variables
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('optimization_jobs')
      .select('*, solver:solvers(*), dataset:datasets(*)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(jobError?.message || 'Job not found')
    }

    // For example, update job to RUNNING
    await supabase
      .from('optimization_jobs')
      .update({ 
        status: 'RUNNING',
        logs: [...(job.logs || []), 'Starting optimization...']
      })
      .eq('id', jobId)

    // 4. Download solver and dataset from storage
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
    // Convert to base64
    const datasetBase64 = btoa(
      String.fromCharCode(...new Uint8Array(datasetBuffer))
    )

    // 5. If you're calling your internal solver container (like solver_service), do:
    const solverServiceUrl = "http://solver_service:5000/"
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
      throw new Error(`Solver service error: ${await resp.text()}`)
    }

    const solverResult = await resp.json()

    // 6. Update job with results
    await supabase
      .from('optimization_jobs')
      .update({
        status: 'COMPLETED',
        results: solverResult,
        logs: [...(job.logs || []), 'Solver completed']
      })
      .eq('id', jobId)

    // 7. Return success
    return new Response(
      JSON.stringify({ message: 'Job completed successfully', result: solverResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in optimization:', error)

    // If we have a jobId, update job status to FAILED
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

    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
