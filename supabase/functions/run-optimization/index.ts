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
    console.log('Starting optimization for job:', jobId)
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Fetch job details including solver and dataset
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

    // Download solver file
    const { data: solverData, error: solverError } = await supabase.storage
      .from('solvers')
      .download(job.solver.file_path)

    if (solverError) {
      throw new Error(`Failed to download solver: ${solverError.message}`)
    }

    // Download dataset file
    const { data: datasetData, error: datasetError } = await supabase.storage
      .from('datasets')
      .download(job.dataset.file_path)

    if (datasetError) {
      throw new Error(`Failed to download dataset: ${datasetError.message}`)
    }

    // Convert files to base64 for Docker API
    const solverBase64 = btoa(await solverData.text())
    const datasetBase64 = btoa(new Uint8Array(await datasetData.arrayBuffer()).toString())

    // Prepare Docker API request
    const dockerApiUrl = Deno.env.get('DOCKER_API_URL')
    const dockerApiKey = Deno.env.get('DOCKER_API_KEY')

    if (!dockerApiUrl || !dockerApiKey) {
      throw new Error('Docker API configuration missing')
    }

    // Send request to Docker API
    const dockerResponse = await fetch(dockerApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dockerApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        solver: solverBase64,
        dataset: datasetBase64,
        parameters: job.parameters
      })
    })

    if (!dockerResponse.ok) {
      throw new Error(`Docker API error: ${await dockerResponse.text()}`)
    }

    const result = await dockerResponse.json()

    // Update job with results
    await supabase
      .from('optimization_jobs')
      .update({
        status: 'COMPLETED',
        results: result,
        logs: [...(job.logs || []), 'Optimization completed successfully']
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({ message: 'Job completed successfully', result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in optimization:', error)
    
    // Update job with error status
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    await supabase
      .from('optimization_jobs')
      .update({
        status: 'FAILED',
        error_message: error.message,
        logs: ['Error occurred during optimization:', error.message]
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})