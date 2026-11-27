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
  let otpCalls = 0;
  let userPwd = null;
  let userFlag = null;
  let verifyEmail = null;
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*.supabase.co/**', (r) => {
    const req = r.request(), u = req.url(), m = req.method();
    const ok = (body, status = 200) => r.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
    if (m === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
    if (u.includes('/auth/v1/otp')) { otpCalls++; return ok({}); }
    if (u.includes('/auth/v1/user') && m === 'PUT') { const ub = JSON.parse(req.postData() || '{}'); userPwd = ub.password; userFlag = ub.data && ub.data.has_password; return ok({ id: UID, aud: 'authenticated', role: 'authenticated', email: 'test@exemple.com', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }); }
    if (u.includes('/auth/v1/verify')) {
      const vb = JSON.parse(req.postData() || '{}'); verifyToken = vb.token; verifyEmail = vb.email;
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
  await page.getByPlaceholder('prenom@exemple.com').fill('test@exemple.com.');  // point final parasite de l'iPhone

  // « J'ai déjà reçu un code » : ouvre la saisie du code SANS redemander d'e-mail
  await page.getByText('J’ai déjà reçu un code').click();
  await page.getByPlaceholder('········').waitFor({ timeout: 10000 });
  await must(otpCalls === 0, "« J'ai déjà reçu un code » ne doit pas envoyer de nouvel e-mail");
  await page.getByText("Changer d'e-mail").click();

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
  // Écran « Crée ton mot de passe » : obligatoire, vert quand les deux champs sont identiques
  await page.getByText('Crée ton mot de passe.').waitFor({ timeout: 10000 }).catch(() => {});
  await must((await body()).includes('Crée ton mot de passe.'), "après le code, l'écran 'Crée ton mot de passe.' doit s'afficher");
  await page.getByText('Continuer', { exact: true }).click({ force: true, timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(500);
  await must(userPwd === null && !(await body()).includes('Bienvenue sur'), 'sans mot de passe, il ne doit pas être possible de continuer');
  await page.getByPlaceholder('8 caractères minimum').fill('abcd1234');
  await page.getByPlaceholder('Retape-le').fill('abcd1235');
  await page.getByText('Les mots de passe ne sont pas identiques.').waitFor({ timeout: 5000 }).catch(() => {});
  await must((await body()).includes('Les mots de passe ne sont pas identiques.'), 'deux mots de passe différents doivent afficher une alerte');
  await page.getByText('Continuer', { exact: true }).click({ force: true, timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(500);
  await must(userPwd === null, 'deux mots de passe différents ne doivent pas être enregistrés');
  await page.getByPlaceholder('Retape-le').fill('abcd1234');
  await page.getByText('Les mots de passe sont identiques.').waitFor({ timeout: 5000 }).catch(() => {});
  await must((await body()).includes('Les mots de passe sont identiques.'), 'deux mots de passe identiques doivent afficher la confirmation verte');
  await page.getByText('Afficher').first().click();
  await must((await page.getByPlaceholder('8 caractères minimum').getAttribute('type')) !== 'password', 'le bouton Afficher doit révéler le mot de passe');
  await page.getByText('Continuer', { exact: true }).click();
  await page.getByText('Bienvenue sur').waitFor({ timeout: 10000 }).catch(() => {});
  await must((await body()).includes('Bienvenue sur'), "après validation du code, 'Bienvenue sur MetaBoost' doit s'afficher");

  await page.getByPlaceholder('Ton prénom').fill('Remy');
  await page.getByText('Continuer', { exact: true }).click();
  await page.getByText('Tes mesures de départ').waitFor({ timeout: 10000 }).catch(() => {});
  await must((await body()).includes('Tes mesures de départ'), "après 'Continuer', l'écran des mesures doit s'afficher");
  await must(verifyEmail === 'test@exemple.com', "le point final de l'adresse doit être retiré avant la vérification : " + verifyEmail);
  await must(userPwd === 'abcd1234' && userFlag === true, 'le mot de passe choisi doit être enregistré sur le compte : ' + userPwd + ' / ' + userFlag);
  await must(verifyToken === '12345678', 'le code complet de 8 chiffres doit être envoyé à Supabase : ' + verifyToken);
  await must(upsertBody && upsertBody.id === UID && upsertBody.name === 'Remy', 'le profil doit être enregistré avec le user.id : ' + JSON.stringify(upsertBody));
  await must(errors.length === 0, 'erreurs JS : ' + errors.join(' | '));

  await browser.close(); server.close();
  console.log("SIGNUP FLOW OK — S'INSCRIRE → compte e-mail → profil enregistré → mesures.");
})();
