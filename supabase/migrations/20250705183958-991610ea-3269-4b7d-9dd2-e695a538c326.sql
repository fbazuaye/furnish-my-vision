-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a table for storing user staged images
CREATE TABLE public.staged_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_image_url TEXT NOT NULL,
  staged_image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  room_type TEXT NOT NULL,
  style TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staged_images ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own staged images" 
ON public.staged_images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own staged images" 
ON public.staged_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own staged images" 
ON public.staged_images 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own staged images" 
ON public.staged_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_staged_images_updated_at
BEFORE UPDATE ON public.staged_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();