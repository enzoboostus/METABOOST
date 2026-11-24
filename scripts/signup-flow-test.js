// Parcours S'INSCRIRE complet avec un Supabase simulé :
// accueil → "Crée ton compte" (e-mail + code) → "Bienvenue" (profil) → mesures.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium, devices } = require('playwright');

const root = path.resolve(__dirname, '..', 'dist');
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(8098);

const UID = '11111111-2222-3333-4444-555555555555';
const jwt = 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({ sub: UID, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })).toString('base64url') + '.sig';
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
  const errors = [];
  let upsertBody = null;
  let verifyToken = null;
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*.supabase.co/**', (r) => {
    const req = r.request(), u = req.url(), m = req.method();
    const ok = (body, status = 200) => r.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
    if (m === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
    if (u.includes('/auth/v1/otp')) return ok({});
    if (u.includes('/auth/v1/verify')) {
      verifyToken = JSON.parse(req.postData() || '{}').token;
      if (verifyToken === '00000000') return ok({ code: 403, error_code: 'otp_expired', msg: 'Token has expired or is invalid' }, 403);
    }
    if (u.includes('/auth/v1/verify')) return ok({ access_token: jwt, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r', user: { id: UID, aud: 'authenticated', role: 'authenticated', email: 'test@exemple.com', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } });
    if (u.includes('/rest/v1/profiles')) {
      if (m === 'GET') return ok({ code: 'PGRST116', details: '0 rows', hint: null, message: 'no rows' }, 406);
      upsertBody = JSON.parse(req.postData()); return ok([], 201);
    }
    return ok([]);
  });

  const body = async () => page.evaluate(() => document.body.innerText);
  const must = async (cond, msg) => { if (!cond) { console.error('ECHEC :', msg, '\nTexte :', JSON.stringify((await body()).slice(0, 200)), '\nErreurs JS :', errors); process.exit(1); } };

  await page.goto('http://localhost:8098/', { waitUntil: 'load' });
  await page.getByText("S'INSCRIRE").first().click({ timeout: 20000 });
  await page.getByText('Crée ton compte.').waitFor({ timeout: 10000 }).catch(() => {});
  await must((await body()).includes('Crée ton compte.'), "S'INSCRIRE doit ouvrir 'Crée ton compte.' en premier");

  await page.getByText('Continuer avec un e-mail').click();
  await page.getByPlaceholder('prenom@exemple.com').fill('test@exemple.com');
  await page.getByText('Recevoir mon code').click();
  await page.getByPlaceholder('········').waitFor({ timeout: 10000 });

  // Mauvais code : le message d'erreur doit être visible, au-dessus du bouton
  await page.getByPlaceholder('········').fill('00000000');
  await page.getByText('Valider mon code').click();
  await page.getByText('Code invalide ou expiré').waitFor({ timeout: 10000 }).catch(() => {});
  const errBox = await page.getByText('Code invalide ou expiré').boundingBox();
  const btnBox = await page.getByText('Valider mon code').boundingBox();
  await must(errBox && btnBox && errBox.y < btnBox.y, "le message d'erreur du code doit s'afficher au-dessus du bouton 'Valider mon code'");

  // Code de 8 chiffres (réglage Supabase par défaut) : il doit être envoyé en entier
  await page.getByPlaceholder('········').fill('12345678');
  await page.getByText('Valider mon code').click();
  await page.getByText('Bienvenue sur').waitFor({ timeout: 10000 }).catch(() => {});
  await must((await body()).includes('Bienvenue sur'), "après validation du code, 'Bienvenue sur MetaBoost' doit s'afficher");

  await page.getByPlaceholder('Ton prénom').fill('Remy');
  await page.getByText('Continuer', { exact: true }).click();
  await page.getByText('Tes mesures de départ').waitFor({ timeout: 10000 }).catch(() => {});
  await must((await body()).includes('Tes mesures de départ'), "après 'Continuer', l'écran des mesures doit s'afficher");
  await must(verifyToken === '12345678', 'le code complet de 8 chiffres doit être envoyé à Supabase : ' + verifyToken);
  await must(upsertBody && upsertBody.id === UID && upsertBody.name === 'Remy', 'le profil doit être enregistré avec le user.id : ' + JSON.stringify(upsertBody));
  await must(errors.length === 0, 'erreurs JS : ' + errors.join(' | '));

  await browser.close(); server.close();
  console.log("SIGNUP FLOW OK — S'INSCRIRE → compte e-mail → profil enregistré → mesures.");
})();
