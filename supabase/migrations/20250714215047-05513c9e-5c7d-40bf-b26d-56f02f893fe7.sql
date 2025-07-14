-- Add staging elements columns to staged_images table
ALTER TABLE public.staged_images 
ADD COLUMN IF NOT EXISTS staging_furniture TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS staging_decor TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS staging_lighting TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS staging_colors TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS staging_materials TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS staging_accessories TEXT[] DEFAULT NULL;