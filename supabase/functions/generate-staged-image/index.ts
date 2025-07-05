import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateImageRequest {
  originalImageUrl: string;
  prompt: string;
  roomType: string;
  style: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { originalImageUrl, prompt, roomType, style }: GenerateImageRequest = await req.json()

    if (!originalImageUrl || !prompt || !roomType || !style) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Runware API key from secrets
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')
    if (!runwareApiKey) {
      return new Response(
        JSON.stringify({ error: 'Runware API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate image using Runware API
    const runwareResponse = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          taskType: "authentication",
          apiKey: runwareApiKey
        },
        {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          positivePrompt: `${prompt}. Transform this ${roomType} with ${style} style furniture and decor. Professional interior design, well-lit, modern staging.`,
          width: 1024,
          height: 1024,
          model: "runware:100@1",
          numberResults: 1,
          outputFormat: "WEBP",
          CFGScale: 1,
          scheduler: "FlowMatchEulerDiscreteScheduler",
          strength: 0.8
        }
      ])
    })

    if (!runwareResponse.ok) {
      throw new Error(`Runware API error: ${runwareResponse.statusText}`)
    }

    const runwareData = await runwareResponse.json()
    console.log('Runware response:', runwareData)

    // Find the image generation result
    const imageResult = runwareData.data?.find((item: any) => item.taskType === "imageInference")
    
    if (!imageResult || !imageResult.imageURL) {
      throw new Error('No image generated')
    }

    // Download the generated image
    const imageResponse = await fetch(imageResult.imageURL)
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image')
    }
    
    const imageBlob = await imageResponse.blob()
    const fileName = `${user.id}/${crypto.randomUUID()}.webp`
    
    // Upload to storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('staged-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/webp',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error('Failed to store image')
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('staged-images')
      .getPublicUrl(fileName)

    const stagedImageUrl = publicUrlData.publicUrl

    // Store the staged image in the database
    const { data: stagedImage, error: dbError } = await supabase
      .from('staged_images')
      .insert({
        user_id: user.id,
        original_image_url: originalImageUrl,
        staged_image_url: stagedImageUrl,
        prompt: prompt,
        room_type: roomType,
        style: style
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save staged image')
    }

    return new Response(
      JSON.stringify({
        id: stagedImage.id,
        originalUrl: originalImageUrl,
        stagedUrl: stagedImageUrl,
        prompt: prompt,
        roomType: roomType,
        style: style,
        timestamp: new Date(stagedImage.created_at)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})