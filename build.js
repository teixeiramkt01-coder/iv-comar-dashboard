const fs = require('fs');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.error('ERRO: SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias.');
  process.exit(1);
}

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('%%SUPABASE_URL%%', url);
html = html.replace('%%SUPABASE_ANON_KEY%%', key);

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
console.log('Build concluído.');
