-- VIT-01: reflete a criação do enum storefront_status em 00_types_and_enums.sql.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storefront_status') THEN
    CREATE TYPE public.storefront_status AS ENUM ('active', 'inactive');
  END IF;
END $$;
