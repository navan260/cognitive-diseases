import fs from 'fs';
import { translations as t1, languages } from './src/translations.js';
import { translations as t2 } from '../Dyslexia/src/translations.js';
import { translations as t3 } from '../dycalculia/src/translations.js';

let mergedTranslations = {};
let allLanguages = new Set([...Object.keys(t1), ...Object.keys(t2), ...Object.keys(t3)]);

for (const lang of allLanguages) {
    let t2lang = t2[lang] || {};
    let t3lang = t3[lang] || {};
    let t1lang = t1[lang] || {};
    mergedTranslations[lang] = { ...t2lang, ...t3lang, ...t1lang };
}

const fileContent = `export const translations = ${JSON.stringify(mergedTranslations, null, 4)};

export const languages = ${JSON.stringify(languages, null, 4)};

export const getTranslation = (language, key) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
};
`;

fs.writeFileSync('./src/translations.js', fileContent);
console.log("Translations merged successfully!");
