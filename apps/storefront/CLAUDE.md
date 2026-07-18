@AGENTS.md

# Acesso ao banco (Supabase)

Este app usa a chave **anônima** (`anon`) — sem login. Nenhuma tabela em `apps/stores/supabase/migrations`
tem (ou deve ter) policy de RLS ou `GRANT` para a role `anon`. Todo acesso público — leitura ou escrita —
passa por RPC `SECURITY DEFINER` com `GRANT EXECUTE TO anon` explícito na função (`get_public_storefront`,
`get_public_storefront_products`, `get_public_product`, `create_order`, …). **Nunca** usar
`supabase.from('<tabela>').select(...)`/`.insert(...)` direto neste app — sempre `supabase.rpc(...)`.

Se uma tabela nova precisar ser lida por aqui, a solução é uma RPC nova em
`apps/stores/supabase/migrations`, nunca uma policy de `anon`. Ver `tasks/store/STORE-00-auditoria-rls-anon.md`
(auditoria desta trava) e os demais cards de `tasks/store/`.
