import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['ca', 'es'],
    defaultLocale: 'ca',       // Català com a idioma base
    localePrefix: 'always'     // /ca/... | /es/...
});
