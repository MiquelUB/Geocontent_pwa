
import { PxxConfig } from "../projects/active/config";

console.log("---------------------------------------------------");
console.log(`ENV THEME_ID: ${process.env.NEXT_PUBLIC_THEME_ID}`);
console.log(`CONFIG THEME_ID: ${PxxConfig.themeId}`);
console.log(`ACTIVE TERRA COLOR: ${PxxConfig.theme.colors.terra}`);

const expectedColors: Record<string, string> = {
    muntanya: "#BC5D36",
    mar: "#0077BE",
    interior: "#8B4513",
    city: "#E63946"
};

const currentTheme = process.env.NEXT_PUBLIC_THEME_ID || 'muntanya';
const expectedColor = expectedColors[currentTheme as keyof typeof expectedColors];

if (PxxConfig.theme.colors.terra === expectedColor) {
    console.log("✅ SUCCESS: Theme loaded correctly.");
} else {
    console.error(`❌ FAILURE: Expected ${expectedColor}, got ${PxxConfig.theme.colors.terra}`);
    process.exit(1);
}
console.log("---------------------------------------------------");
