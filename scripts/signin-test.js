// Connexion par e-mail + mot de passe avec un Supabase simulé :
// accueil → SE CONNECTER → mauvais mot de passe (erreur claire) → bon mot de passe → arrivée dans l'app.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium, devices } = require('playwright');

const root = path.resolve(__dirname, '..', 'dist');
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(8097);

const UID = '11111111-2222-3333-4444-555555555555';
const jwt = 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({ sub: UID, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })).toString('base64url') + '.sig';
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
  const errors = [];
  let otpCalls = 0;
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*.supabase.co/**', (r) => {
    const req = r.request(), u = req.url(), m = req.method();
    const ok = (body, status = 200) => r.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
    if (m === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
    if (u.includes('/auth/v1/otp')) { otpCalls++; return ok({}); }
    if (u.includes('/auth/v1/token') && u.includes('grant_type=password')) {
      const b = JSON.parse(req.postData() || '{}');
      if (b.password !== 'bon-mot-de-passe') return ok({ code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
      return ok({ access_token: jwt, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r', user: { id: UID, aud: 'authenticated', role: 'authenticated', email: b.email, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } });
    }
    if (u.includes('/rest/v1/profiles') && m === 'GET') return ok({ name: 'Remy', gender: 'male', height_cm: 175, age: 23, birth_date: '2003-07-06' });
    return ok([]);
  });

  const body = async () => page.evaluate(() => document.body.innerText);
  const must = async (cond, msg) => { if (!cond) { console.error('ECHEC :', msg, '\nTexte :', JSON.stringify((await body()).slice(0, 200)), '\nErreurs JS :', errors); process.exit(1); } };

  await page.goto('http://localhost:8097/', { waitUntil: 'load' });
  await page.getByText('SE CONNECTER').first().click({ timeout: 20000 });
  await page.getByText('Content de te revoir.').waitFor({ timeout: 10000 }).catch(() => {});
  await must((await body()).includes('Content de te revoir.'), "SE CONNECTER doit ouvrir l'écran e-mail + mot de passe");

  await page.getByPlaceholder('prenom@exemple.com').fill('remy@exemple.com');
  await page.getByPlaceholder('Ton mot de passe').fill('mauvais');
  await page.getByText('Se connecter', { exact: true }).click();
  await page.getByText('E-mail ou mot de passe incorrect.').waitFor({ timeout: 10000 }).catch(() => {});
  await must((await body()).includes('E-mail ou mot de passe incorrect.'), 'un mauvais mot de passe doit afficher un message clair');

  await must(errors.length === 0, 'erreurs JS pendant la connexion : ' + errors.join(' | '));
  await page.getByPlaceholder('Ton mot de passe').fill('bon-mot-de-passe');
  await page.getByText('Se connecter', { exact: true }).click();
  await page.waitForFunction(() => !document.body.innerText.includes('Content de te revoir.'), null, { timeout: 15000 }).catch(() => {});
  await must(!(await body()).includes('Content de te revoir.'), "le bon mot de passe doit faire entrer dans l'application");
  await must(!page.url().includes('onboarding'), "l'utilisateur déjà inscrit ne doit plus être sur l'écran d'onboarding : " + page.url());
  await must(otpCalls === 0, "aucun e-mail ne doit être envoyé pour une connexion par mot de passe");

  await browser.close(); server.close();
  console.log('SIGNIN OK — mot de passe incorrect refusé, bon mot de passe accepté, aucun e-mail envoyé.');
})();
