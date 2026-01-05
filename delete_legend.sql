-- Opció A: Esborrar per Títol (Més fàcil si saps el nom exacte)
DELETE FROM public.legends 
WHERE title = 'El Drac de la Noguera'; -- Canvia el títol aquí

-- Opció B: Esborrar per ID (Més segur si tens l''UUID)
-- DELETE FROM public.legends 
-- WHERE id = 'uuid-de-la-llegenda-aqui';

-- Com que 'legends' no té (encara) taules filles amb integritat referencial forçada 
-- (com 'reviews' o 'photos' separades), això esborrarà la línia netament.
-- Si en el futur tens taules relacionades (ex: comments), hauràs de fer 'CASCADE' al schema
-- o esborrar primer les filles.
