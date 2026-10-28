export default async function handler(_req: any, res: any) {
  try {
    const response = await fetch(
      'https://ivrkzhboitfbyparwcpr.supabase.co/rest/v1/profiles?select=id&limit=1',
      {
        headers: {
          apikey: 'sb_publishable_iI-grK9y7xEBJF-aTISzWA_Sf_GPgae',
          Authorization: 'Bearer sb_publishable_iI-grK9y7xEBJF-aTISzWA_Sf_GPgae',
        },
      }
    );
    res.status(200).json({ ok: response.ok, status: response.status });
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
}
