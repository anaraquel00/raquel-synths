// api/subscribe.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const BREVO_KEY = process.env.BREVO_API_KEY;
  const LIST_ID = 2; // <--- TROQUE PELO ID DA SUA LISTA NO BREVO (Geralmente 2 ou 3)

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [LIST_ID],
        updateEnabled: true
      }),
    });

    // Brevo retorna 201 (Criado) ou 204 (Atualizado)
    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorData = await response.json();
      return res.status(400).json({ error: errorData.message || 'Erro no Brevo' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
