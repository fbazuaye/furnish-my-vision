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
  referenceImages?: string[];
}

interface StagingElements {
  furniture: string[];
  decor: string[];
  lighting: string[];
  colors: string[];
  materials: string[];
  accessories: string[];
  promptEnhancement: string;
}

function generateStagingBreakdown(roomType: string, style: string, prompt: string): StagingElements {
  const furniture: string[] = [];
  const decor: string[] = [];
  const lighting: string[] = [];
  const colors: string[] = [];
  const materials: string[] = [];
  const accessories: string[] = [];

  // Base furniture by room type
  switch (roomType.toLowerCase()) {
    case 'living room':
      furniture.push('Sofa', 'Coffee table', 'Side tables', 'TV stand', 'Armchairs');
      accessories.push('Throw pillows', 'Blankets', 'Remote organizer');
      break;
    case 'bedroom':
      furniture.push('Bed frame', 'Nightstands', 'Dresser', 'Reading chair');
      accessories.push('Bedding set', 'Decorative pillows', 'Table lamps');
      break;
    case 'kitchen':
      furniture.push('Bar stools', 'Kitchen island', 'Dining chairs');
      accessories.push('Fruit bowl', 'Kitchen towels', 'Decorative containers');
      break;
    case 'dining room':
      furniture.push('Dining table', 'Dining chairs', 'Buffet', 'Bar cart');
      accessories.push('Table runner', 'Centerpiece', 'Dinnerware');
      break;
    case 'office':
      furniture.push('Desk', 'Office chair', 'Bookshelf', 'Filing cabinet');
      accessories.push('Desk organizer', 'Books', 'Desk lamp');
      break;
    default:
      furniture.push('Accent furniture', 'Storage solutions');
  }

  // Style-specific additions
  switch (style.toLowerCase()) {
    case 'modern':
      colors.push('White', 'Gray', 'Black', 'Bold accent colors');
      materials.push('Glass', 'Metal', 'Leather', 'Concrete');
      lighting.push('Recessed lighting', 'Pendant lights', 'Floor lamps');
      decor.push('Abstract art', 'Geometric patterns', 'Minimalist sculptures');
      break;
    case 'traditional':
      colors.push('Warm neutrals', 'Rich blues', 'Deep reds', 'Gold accents');
      materials.push('Wood', 'Fabric', 'Brass', 'Natural stone');
      lighting.push('Chandeliers', 'Table lamps', 'Sconces');
      decor.push('Classic paintings', 'Ornate mirrors', 'Traditional patterns');
      break;
    case 'minimalist':
      colors.push('White', 'Beige', 'Light gray', 'Natural tones');
      materials.push('Natural wood', 'Linen', 'Cotton', 'Stone');
      lighting.push('Natural light', 'Simple pendant lights', 'Floor lamps');
      decor.push('Single statement piece', 'Plants', 'Clean lines');
      break;
    case 'industrial':
      colors.push('Gray', 'Black', 'Brown', 'Rust accents');
      materials.push('Metal', 'Raw wood', 'Brick', 'Concrete');
      lighting.push('Exposed bulbs', 'Metal fixtures', 'Track lighting');
      decor.push('Industrial art', 'Metal sculptures', 'Vintage posters');
      break;
    case 'scandinavian':
      colors.push('White', 'Light gray', 'Soft pastels', 'Natural wood tones');
      materials.push('Light wood', 'Wool', 'Linen', 'Ceramic');
      lighting.push('Pendant lights', 'String lights', 'Natural light');
      decor.push('Nordic art', 'Hygge elements', 'Cozy textiles');
      break;
  }

  // Parse custom prompt for additional elements
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('plant')) accessories.push('Indoor plants', 'Planters');
  if (promptLower.includes('book')) accessories.push('Books', 'Bookends');
  if (promptLower.includes('candle')) accessories.push('Candles', 'Candle holders');
  if (promptLower.includes('mirror')) decor.push('Wall mirrors', 'Decorative mirrors');
  if (promptLower.includes('rug')) accessories.push('Area rug', 'Floor coverings');

  const promptEnhancement = `Include: ${furniture.join(', ')}, ${decor.join(', ')}, ${lighting.join(', ')}, using ${colors.join(', ')} color palette with ${materials.join(', ')} materials`;

  return {
    furniture,
    decor,
    lighting,
    colors,
    materials,
    accessories,
    promptEnhancement
  };
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

    const { originalImageUrl, prompt, roomType, style, referenceImages }: GenerateImageRequest = await req.json()

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

    // Generate detailed staging breakdown
    const stagingElements = generateStagingBreakdown(roomType, style, prompt);
    
    // Generate image using Runware API
    let enhancedPrompt = `${prompt}. Transform this ${roomType} with ${style} style furniture and decor. Professional interior design, well-lit, modern staging. ${stagingElements.promptEnhancement}`;
    
    if (referenceImages && referenceImages.length > 0) {
      enhancedPrompt += ` Use the provided reference images as style and design inspiration.`;
    }

    // Build the API request for inpainting
    const taskUUID = crypto.randomUUID();
    const apiRequest = [
      {
        taskType: "authentication",
        apiKey: runwareApiKey
      },
      {
        taskType: "imageInference",
        taskUUID: taskUUID,
        positivePrompt: enhancedPrompt,
        inputImage: originalImageUrl,
        width: 1024,
        height: 1024,
        model: "runware:100@1",
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: 7,
        scheduler: "FlowMatchEulerDiscreteScheduler",
        strength: 0.7,
        steps: 20
      }
    ];

    // Add reference images if available
    if (referenceImages && referenceImages.length > 0) {
      // For now, we'll include the first reference image as controlNet or similar
      // This would depend on Runware's specific API capabilities for reference images
      console.log(`Using ${referenceImages.length} reference images for styling guidance`);
    }

    const runwareResponse = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequest)
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
        style: style,
        staging_furniture: stagingElements.furniture,
        staging_decor: stagingElements.decor,
        staging_lighting: stagingElements.lighting,
        staging_colors: stagingElements.colors,
        staging_materials: stagingElements.materials,
        staging_accessories: stagingElements.accessories
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
        timestamp: new Date(stagedImage.created_at),
        stagingElements: {
          furniture: stagingElements.furniture,
          decor: stagingElements.decor,
          lighting: stagingElements.lighting,
          colors: stagingElements.colors,
          materials: stagingElements.materials,
          accessories: stagingElements.accessories
        }
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