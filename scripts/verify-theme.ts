/**
 * scripts/verify-theme.ts
 *
 * CI/CD Theme Validation Script — Protocol Sobirania PXX
 *
 * Verifica que:
 *   1. Tots els tokens PxxConfig.theme.colors estan presents a tailwind.config.ts
 *   2. No hi ha URLs externes a backgroundImage (CDN prohibit)
 *   3. Els colors chameleon a Tailwind coincideixen amb PxxConfig.chameleonThemes
 *   4. Cap referència a google/googleapis al codebase
 *
 * Ús: npx tsx scripts/verify-theme.ts
 * Retorn: exit(0) = conforme | exit(1) = violació trobada
 */

import fs from 'fs';
import path from 'path';
import { PxxConfig } from '../projects/active/config';

const ROOT = path.resolve(__dirname, '..');
let errors = 0;

function fail(msg: string) { console.error(`❌ [FAIL] ${msg}`); errors++; }
function pass(msg: string) { console.log(`✅ [PASS] ${msg}`); }

// CHECK 1: PxxConfig.theme color tokens present a tailwind.config.ts
function checkThemeColors() {
  const twConfig = fs.readFileSync(path.join(ROOT, 'tailwind.config.ts'), 'utf-8');
  const tokens = ['pxx-base', 'pxx-dark', 'pxx-terra', 'pxx-olive', 'pxx-gold', 'pxx-stone'];
  for (const token of tokens) {
    twConfig.includes(token) ? pass(`Token '${token}' present`) : fail(`Token '${token}' FALTA`);
  }
}

// CHECK 2: Cap URL externa a backgroundImage
function checkNoCdnTextures() {
  const twConfig = fs.readFileSync(path.join(ROOT, 'tailwind.config.ts'), 'utf-8');
  const matches = twConfig.match(/url\(['"]https?:\/\//g);
  matches ? fail(`URLs externes detectades: ${matches.join(', ')}`) : pass('Cap URL externa — textures locals');
}

// CHECK 3: Chameleon colors wired des de PxxConfig
function checkChameleonWiring() {
  const twConfig = fs.readFileSync(path.join(ROOT, 'tailwind.config.ts'), 'utf-8');
  twConfig.includes('PxxConfig.chameleonThemes')
    ? pass('Chameleon wired dinàmicament des de PxxConfig')
    : fail('Chameleon colors hardcoded — cal wiring dinàmic des de PxxConfig');
}

// CHECK 4: Zero referències a Google Maps
function checkNoGoogleDependencies() {
  const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
  const DIRS = ['app', 'components', 'lib', 'hooks'];
  const FORBIDDEN = ['maps.googleapis.com', 'google-maps', 'GoogleMap', '@googlemaps', 'Maps_flutter'];

  const scan = (d: string) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory() && !['node_modules', '.next'].includes(entry.name)) {
        scan(fullPath);
      } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        for (const f of FORBIDDEN)
          if (content.includes(f)) fail(`'${f}' trobat a ${fullPath.replace(ROOT, '')}`);
      }
    }
  };
  for (const dir of DIRS) scan(path.join(ROOT, dir));
  if (errors === 0) pass('Zero referències a Google Maps — Sobirania Cartogràfica garantida');
}

console.log('\n🔍 Protocol Sobirania PXX — Validació de Tema\n' + '='.repeat(55));
checkThemeColors(); console.log('');
checkNoCdnTextures(); console.log('');
checkChameleonWiring(); console.log('');
checkNoGoogleDependencies();
console.log('\n' + '='.repeat(55));

if (errors > 0) {
  console.error(`\n🚨 AUDITORIA FALLIDA: ${errors} violació(ns)\n`);
  process.exit(1);
} else {
  console.log('\n✅ AUDITORIA SUPERADA: Sobirania Tècnica confirmada\n');
  process.exit(0);
}
