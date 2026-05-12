const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { request_id, action } = req.body || {};
  if (!request_id || !action) return res.status(400).json({ error: 'request_id e action são obrigatórios' });

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Token ausente' });
  const token = authHeader.slice(7);

  const url    = (process.env.SUPABASE_URL || '').trim();
  const anon   = (process.env.SUPABASE_ANON_KEY || '').trim();
  const secret = (process.env.SUPABASE_SECRET_KEY || '').trim();

  // Verifica identidade do chamador
  const userClient = createClient(url, anon);
  const { data: { user }, error: authError } = await userClient.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token inválido' });

  // Apenas sector_id null = admin CPLG
  const meta = user.user_metadata || {};
  if (meta.sector_id) return res.status(403).json({ error: 'Acesso negado. Apenas CPLG pode gerenciar solicitações.' });

  const admin = createClient(url, secret);

  if (action === 'reject') {
    const { error } = await admin.from('user_requests').update({
      status:      'rejeitada',
      reviewed_by: meta.display_name,
      reviewed_at: new Date().toISOString()
    }).eq('id', request_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  if (action === 'approve') {
    const { data: solicitacao, error: fetchErr } = await admin
      .from('user_requests').select('*').eq('id', request_id).single();
    if (fetchErr || !solicitacao) return res.status(404).json({ error: 'Solicitação não encontrada' });
    if (solicitacao.status !== 'pendente') return res.status(400).json({ error: 'Solicitação já processada' });

    const ident = solicitacao.display_name;
    const email = ident.includes('@') ? ident : ident.toLowerCase() + '@ivcomar.fab';
    const displayName = ident.includes('@') ? ident.split('@')[0] : ident;
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password:      solicitacao.password_temp,
      user_metadata: { display_name: displayName, sector_id: solicitacao.sector_id || null },
      email_confirm: true,
    });
    if (createErr) {
      const jaExiste = createErr.message.toLowerCase().includes('already') || createErr.message.toLowerCase().includes('registered');
      if (jaExiste) {
        return res.status(409).json({
          error: `Usuário "${solicitacao.display_name}" já existe no sistema. Rejeite esta solicitação e peça ao solicitante que use outra identificação.`
        });
      }
      return res.status(500).json({ error: createErr.message });
    }

    await admin.from('user_requests').update({
      status:       'aprovada',
      password_temp: null,
      reviewed_by:  meta.display_name,
      reviewed_at:  new Date().toISOString()
    }).eq('id', request_id);

    return res.json({ success: true });
  }

  return res.status(400).json({ error: 'Ação inválida. Use "approve" ou "reject".' });
};
