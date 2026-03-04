// scripts/check-i18n.ts
// Execució: npx tsx scripts/check-i18n.ts

import caMessages from '../messages/ca.json';
import esMessages from '../messages/es.json';
import enMessages from '../messages/en.json';
import frMessages from '../messages/fr.json';

type NestedKeys = Record<string, any>;

function flattenKeys(obj: NestedKeys, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        return typeof value === 'object' && value !== null
            ? flattenKeys(value, fullKey)
            : [fullKey];
    });
}

const locales = {
    ca: flattenKeys(caMessages),
    es: flattenKeys(esMessages),
    en: flattenKeys(enMessages),
    fr: flattenKeys(frMessages)
};

const allKeys = new Set(Object.values(locales).flat());
let hasErrors = false;

Object.entries(locales).forEach(([locale, keys]) => {
    const currentKeys = new Set(keys);
    const missing = [...allKeys].filter(k => !currentKeys.has(k));

    if (missing.length > 0) {
        console.log(`\n🔴 Claus que falten a ${locale}.json:`);
        missing.forEach(k => console.log(`  - ${k}`));
        hasErrors = true;
    }
});

if (!hasErrors) {
    console.log('✅ Tots els 4 idiomes estan sincronitzats!');
} else {
    process.exit(1);
}
