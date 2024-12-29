// /supabase/functions/run-optimization/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { jobId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // 1. Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('optimization_jobs')
      .select('*, solver:solvers(*), dataset:datasets(*)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(jobError?.message || 'Job not found')
    }

    // 2. Download the solver file
    const { data: solverData, error: solverError } = await supabase.storage
      .from('solvers')
      .download(job.solver.file_path)
    if (solverError || !solverData) {
      throw new Error(`Failed to download solver: ${solverError?.message}`)
    }
    const solverText = await solverData.text()
    const solverBase64 = btoa(solverText)

    // 3. Download dataset file
    const { data: datasetData, error: datasetError } = await supabase.storage
      .from('datasets')
      .download(job.dataset.file_path)
    if (datasetError || !datasetData) {
      throw new Error(`Failed to download dataset: ${datasetError?.message}`)
    }
    // We convert bytes to base64
    const datasetBuffer = await datasetData.arrayBuffer()
    const datasetBase64 = btoa(
      String.fromCharCode(...new Uint8Array(datasetBuffer))
    )

    // 4. Post to solver_service
    const solverServiceUrl = "http://solver_service:5000/"  // from docker-compose
    const resp = await fetch(solverServiceUrl, {
      method: 'POST',
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

    // 5. Save results in DB
    await supabase
      .from('optimization_jobs')
      .update({
        status: 'COMPLETED',
        results: solverResult,
        logs: [...(job.logs || []), 'Solver completed']
      })
      .eq('id', jobId)

    return new Response(JSON.stringify({
      message: 'Job completed successfully',
      result: solverResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in optimization:', error)
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

    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
