import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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
  console.log('=== Edge function called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    
    console.log('Environment check:');
    console.log('- SUPABASE_URL present:', !!supabaseUrl);
    console.log('- SUPABASE_ANON_KEY present:', !!supabaseAnonKey);
    console.log('- RUNWARE_API_KEY present:', !!runwareApiKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase config' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!runwareApiKey) {
      console.error('Runware API key not configured');
      return new Response(
        JSON.stringify({ error: 'Runware API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Get the current user
    console.log('Getting user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: userError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!user) {
      console.error('No user found');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', Object.keys(requestBody));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { originalImageUrl, prompt, roomType, style } = requestBody;

    if (!originalImageUrl || !prompt || !roomType || !style) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: originalImageUrl, prompt, roomType, style' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('All validations passed, generating staging breakdown...');
    
    // Generate detailed staging breakdown
    const stagingElements = generateStagingBreakdown(roomType, style, prompt);
    
    // Generate enhanced prompt
    const enhancedPrompt = `${prompt}. Transform this ${roomType} with ${style} style furniture and decor. Professional interior design, well-lit, modern staging. ${stagingElements.promptEnhancement}`;
    
    console.log('Enhanced prompt generated');

    // Test Runware API connection first
    console.log('Testing Runware API connection...');
    
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
        strength: 0.8,
        steps: 8
      }
    ];

    console.log('Calling Runware API...');
    let runwareResponse;
    
    try {
      runwareResponse = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest)
      });
    } catch (fetchError) {
      console.error('Fetch error calling Runware API:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to connect to Runware API', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Runware API response status:', runwareResponse.status);

    if (!runwareResponse.ok) {
      const errorText = await runwareResponse.text();
      console.error('Runware API error response:', errorText);
      return new Response(
        JSON.stringify({ error: `Runware API error: ${runwareResponse.status}`, details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let runwareData;
    try {
      runwareData = await runwareResponse.json();
      console.log('Runware response parsed successfully');
    } catch (jsonError) {
      console.error('Failed to parse Runware response as JSON:', jsonError);
      return new Response(
        JSON.stringify({ error: 'Invalid response from Runware API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for errors in the response
    if (runwareData.error || runwareData.errors) {
      console.error('Runware API returned error:', runwareData.error || runwareData.errors);
      return new Response(
        JSON.stringify({ error: 'Image generation failed', details: runwareData.error || runwareData.errors }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the image generation result
    const imageResult = runwareData.data?.find((item: any) => item.taskType === "imageInference")
    
    if (!imageResult || !imageResult.imageURL) {
      console.error('No valid image result:', imageResult);
      return new Response(
        JSON.stringify({ error: 'No image URL generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Image generated successfully, downloading...');

    // Download and upload the image
    let imageResponse;
    try {
      imageResponse = await fetch(imageResult.imageURL);
    } catch (downloadError) {
      console.error('Failed to download generated image:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download generated image', details: downloadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!imageResponse.ok) {
      console.error('Image download failed:', imageResponse.status);
      return new Response(
        JSON.stringify({ error: `Failed to download image: ${imageResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const imageBlob = await imageResponse.blob()
    console.log('Image downloaded, uploading to storage...');
    
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
      return new Response(
        JSON.stringify({ error: 'Failed to store image', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('staged-images')
      .getPublicUrl(fileName)

    const stagedImageUrl = publicUrlData.publicUrl
    console.log('Public URL generated, saving to database...');

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
      return new Response(
        JSON.stringify({ error: 'Failed to save staged image', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('=== SUCCESS: All operations completed ===');

    const response = {
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
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        type: error.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})