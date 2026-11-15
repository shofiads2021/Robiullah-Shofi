// Returns submitted "review" form entries from Netlify Forms as JSON.
// Needs env vars: NETLIFY_API_TOKEN (personal access token). SITE_ID is provided by Netlify (or set NETLIFY_SITE_ID).
exports.handler = async () => {
  const h = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' };
  const t = process.env.NETLIFY_API_TOKEN, s = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const none = { statusCode: 200, headers: h, body: JSON.stringify({ reviews: [], configured: !!(t && s) }) };
  if (!t || !s) return none;
  try {
    const A = { headers: { Authorization: 'Bearer ' + t } };
    const forms = await (await fetch(`https://api.netlify.com/api/v1/sites/${s}/forms`, A)).json();
    const f = Array.isArray(forms) && forms.find(x => x.name === 'review');
    if (!f) return none;
    const subs = await (await fetch(`https://api.netlify.com/api/v1/forms/${f.id}/submissions?per_page=100`, A)).json();
    const reviews = (Array.isArray(subs) ? subs : []).filter(x => (x.data || {}).verified_client === 'yes').map(x => {
      const d = x.data || {}, c = String(d.country_code || '').toLowerCase();
      return { name: String(d.name || '').slice(0, 60), service: String(d.service || '').slice(0, 60), country: String(d.country || '').slice(0, 60), code: /^[a-z]{2}$/.test(c) ? c : '',
        rating: parseInt(d.rating, 10) || 0, message: String(d.message || '').slice(0, 600), date: x.created_at };
    }).filter((r, i) => r.name && r.message && r.rating >= 1 && r.rating <= 5);
    return { statusCode: 200, headers: h, body: JSON.stringify({ reviews, configured: true }) };
  } catch (e) { return none; }
};
