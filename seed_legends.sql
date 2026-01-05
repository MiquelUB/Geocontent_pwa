-- SCRIPT DE CARGA DE LLEGENDES (Mistic Pallars)
-- Instruccions:
-- 1. Copia aquest contingut al SQL Editor de Supabase.
-- 2. Modifica els valors del INSERT segons les teves dades reals.
-- 3. Executa el script.

-- Opcional: Netejar la taula abans de carregar (Descomentar si vols esborrar tot el que hi ha)
-- TRUNCATE TABLE public.legends;

INSERT INTO public.legends (title, description, category, latitude, longitude, location_name, image_url, rating, is_active)
VALUES 
  (
    'Títol de la Llegenda',           -- Títol
    'Descripció completa de la història...', -- Descripció
    'Categoria',                      -- Categories: 'Criatures', 'Fantasmes', 'Tresors', 'Màgia', etc.
    42.000000,                        -- Latitud (Decimal WGS84)
    0.000000,                         -- Longitud (Decimal WGS84)
    'Nom del Lloc / Poble',           -- Ubicació text
    'https://url-de-la-imatge.com/foto.jpg', -- URL Imatge (Supabase Storage o externa)
    4.5,                              -- Puntuació (0.0 - 5.0)
    true                              -- Actiu? (true/false)
  ),
  (
    'El Drac de la Noguera',
    'Una bèstia llegendària que habitava les aigües del riu Noguera.',
    'Criatures',
    42.1650,
    0.8950,
    'Tremp, Pallars Jussà',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    4.8,
    true
  );

-- Exemple per afegir-ne més, simplement afegeix una coma i un altre bloc (...)
