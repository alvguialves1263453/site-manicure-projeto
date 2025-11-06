-- Adicionar políticas RLS para permitir upload de imagens na galeria
-- Como o admin não usa autenticação Supabase, precisamos permitir uploads públicos

-- Permitir que qualquer pessoa faça upload de imagens
CREATE POLICY "Allow public uploads to gallery bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'gallery');

-- Permitir que qualquer pessoa atualize imagens
CREATE POLICY "Allow public updates to gallery bucket"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'gallery');

-- Permitir que qualquer pessoa delete imagens
CREATE POLICY "Allow public deletes from gallery bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'gallery');

-- Permitir que qualquer pessoa visualize imagens
CREATE POLICY "Allow public reads from gallery bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');