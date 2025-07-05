-- Create storage bucket for staged images
INSERT INTO storage.buckets (id, name, public) VALUES ('staged-images', 'staged-images', true);

-- Create policies for staged images bucket
CREATE POLICY "Users can view staged images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'staged-images');

CREATE POLICY "Authenticated users can upload staged images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'staged-images' AND auth.uid()::text IS NOT NULL);

CREATE POLICY "Users can update their own staged images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'staged-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own staged images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'staged-images' AND auth.uid()::text = (storage.foldername(name))[1]);