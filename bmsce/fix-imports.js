import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src/dyslexia').concat(walk('./src/dycalculia'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace paths starting with ../.. that end in firebase, LanguageContext, or translations
    content = content.replace(/['"](\.\.\/)+firebase(\.js)?['"]/g, '"@/firebase"');
    content = content.replace(/['"](\.\.\/)+LanguageContext(\.jsx)?['"]/g, '"@/LanguageContext"');
    content = content.replace(/['"](\.\.\/)+translations(\.js)?['"]/g, '"@/translations"');
    
    fs.writeFileSync(file, content, 'utf8');
});

console.log("Imports fixed!");
