const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Token ausente' });
  const token = authHeader.slice(7);

  const url    = (process.env.SUPABASE_URL || '').trim();
  const anon   = (process.env.SUPABASE_ANON_KEY || '').trim();
  const secret = (process.env.SUPABASE_SECRET_KEY || '').trim();

  const userClient = createClient(url, anon);
  const { data: { user }, error: authError } = await userClient.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token inválido' });

  const meta = user.user_metadata || {};
  if (meta.sector_id) return res.status(403).json({ error: 'Acesso negado.' });

  const admin = createClient(url, secret);
  const { error } = await admin.from('user_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ success: true });
};
