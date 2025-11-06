-- Remover política restritiva e criar política pública para inserção na galeria
-- Como o admin não usa autenticação Supabase, precisamos permitir operações públicas

DROP POLICY IF EXISTS "Authenticated users can manage gallery" ON public.gallery;

-- Permitir que qualquer pessoa insira na galeria
CREATE POLICY "Allow public inserts to gallery"
ON public.gallery
FOR INSERT
WITH CHECK (true);

-- Permitir que qualquer pessoa atualize na galeria
CREATE POLICY "Allow public updates to gallery"
ON public.gallery
FOR UPDATE
USING (true);

-- Permitir que qualquer pessoa delete da galeria
CREATE POLICY "Allow public deletes from gallery"
ON public.gallery
FOR DELETE
USING (true);