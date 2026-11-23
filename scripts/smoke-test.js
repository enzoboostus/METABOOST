// Ouvre l'app compilée (dist/) dans un navigateur taille iPhone et vérifie qu'elle s'affiche.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium, devices } = require('playwright');

const root = path.resolve(__dirname, '..', 'dist');
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.ttf': 'font/ttf' };

const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(8099);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:8099/', { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  const text = await page.evaluate(() => document.body.innerText);
  await browser.close(); server.close();

  const ok = errors.length === 0 && text.includes('METABOOST') && text.includes('INSCRIRE');
  if (!ok) {
    console.error('SMOKE TEST ECHEC — la page d\'accueil ne s\'affiche pas correctement.');
    console.error('Erreurs JS :', errors);
    console.error('Texte visible :', JSON.stringify(text.slice(0, 200)));
    process.exit(1);
  }
  console.log('SMOKE TEST OK — la page d\'accueil s\'affiche.');
})();
