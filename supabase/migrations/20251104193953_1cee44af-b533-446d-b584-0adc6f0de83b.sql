-- Ajustar RLS policies para permitir operações sem autenticação
-- (simplificado conforme solicitação do usuário)

-- Remover policies antigas que exigem autenticação
DROP POLICY IF EXISTS "Authenticated users can manage all appointments" ON appointments;

-- Criar nova policy para permitir UPDATE, DELETE e outras operações para todos
-- ATENÇÃO: Isso é inseguro, mas foi solicitado pelo usuário
CREATE POLICY "Anyone can manage appointments"
ON appointments
FOR ALL
USING (true)
WITH CHECK (true);