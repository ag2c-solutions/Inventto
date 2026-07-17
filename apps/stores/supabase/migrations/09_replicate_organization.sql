-- ==============================================================================
-- 09_REPLICATE_ORGANIZATION.SQL
-- Módulo: Regras de Negócio / Migration
-- Atualiza create_new_organization para suportar replicação (RF009) e remover slug
-- ==============================================================================

DROP FUNCTION IF EXISTS public.create_new_organization(TEXT, TEXT, public.business_area_code);
DROP FUNCTION IF EXISTS public.create_new_organization(TEXT, TEXT, TEXT);

-- Nova versão da função
CREATE OR REPLACE FUNCTION public.create_new_organization(
  p_name               TEXT,
  p_document           TEXT DEFAULT NULL,
  p_source_org_id      UUID DEFAULT NULL,
  p_replicate_groups   TEXT[] DEFAULT NULL,
  p_business_area_code public.business_area_code DEFAULT 'other'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id          UUID;
  v_user_id         UUID := auth.uid();
  v_source_settings JSONB;
  v_new_settings    JSONB := '{}'::jsonb;
BEGIN
  -- 1. Validação de Segurança (RN020): Se tiver source_org_id, o usuário logado DEVE ser owner da org de origem.
  IF p_source_org_id IS NOT NULL THEN
    IF NOT public.has_role(p_source_org_id, 'owner') THEN
      RAISE EXCEPTION 'Acesso negado: Você deve ser um Owner da organização de origem para replicá-la.';
    END IF;

    -- Extrair settings da org de origem para usar na replicação
    SELECT settings INTO v_source_settings FROM public.organizations WHERE id = p_source_org_id;

    -- Montagem condicional de v_new_settings baseada nos grupos solicitados
    IF p_replicate_groups IS NOT NULL THEN
      -- Grupo 1: Configurações operacionais (RN009)
      IF 'operational' = ANY(p_replicate_groups) THEN
        IF v_source_settings ? 'operational' THEN
          v_new_settings := jsonb_set(v_new_settings, '{operational}', v_source_settings->'operational');
        END IF;
        IF v_source_settings ? 'sales' THEN
          v_new_settings := jsonb_set(v_new_settings, '{sales}', v_source_settings->'sales');
        END IF;
        IF v_source_settings ? 'schedule' THEN
          v_new_settings := jsonb_set(v_new_settings, '{schedule}', v_source_settings->'schedule');
        END IF;
      END IF;

      -- Grupo 2: Configurações visuais (identidade visual)
      IF 'visual' = ANY(p_replicate_groups) THEN
        IF v_source_settings ? 'identity' THEN
          v_new_settings := jsonb_set(v_new_settings, '{identity}', v_source_settings->'identity');
        END IF;
      END IF;
    END IF;
  END IF;

  -- 2. Criação da nova Organização
  INSERT INTO public.organizations (name, document, owner_id, business_area_code, settings)
  VALUES (p_name, p_document, v_user_id, COALESCE(p_business_area_code, 'other'), v_new_settings)
  RETURNING id INTO v_org_id;

  -- 3. Inserção do Membro (Dono da nova Org)
  INSERT INTO public.organization_members (organization_id, profile_id, role, status)
  VALUES (v_org_id, v_user_id, 'owner', 'active');

  -- 4. Replicação de tabelas (Categorias e Atributos)
  IF p_source_org_id IS NOT NULL AND p_replicate_groups IS NOT NULL THEN
    IF 'categories' = ANY(p_replicate_groups) THEN
      
      -- Copiar categorias
      INSERT INTO public.categories (organization_id, name)
      SELECT v_org_id, name 
      FROM public.categories 
      WHERE organization_id = p_source_org_id;
      
      -- Copiar atributos (organization_attributes)
      INSERT INTO public.organization_attributes (organization_id, label, slug, type, "values")
      SELECT v_org_id, label, slug, type, "values"
      FROM public.organization_attributes
      WHERE organization_id = p_source_org_id;

    END IF;
  END IF;

  RETURN v_org_id;
END;
$$;
