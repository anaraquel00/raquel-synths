export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const {
    name,
    email,
    subject,
    message,
    website
  } = req.body || {};

  // Honeypot
  if (website) {
    return res.status(200).json({
      success: true
    });
  }

  if (
    !name ||
    !email ||
    !subject ||
    !message
  ) {
    return res.status(400).json({
      error: 'Missing required fields'
    });
  }

  const normalizedEmail =
    String(email).trim().toLowerCase();

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      error: 'Invalid email'
    });
  }

  const BREVO_KEY =
    process.env.BREVO_API_KEY;

  const CONTACT_EMAIL =
    process.env.RQS_CONTACT_EMAIL;

  const SENDER_EMAIL =
    process.env.RQS_SENDER_EMAIL;

  if (
    !BREVO_KEY ||
    !CONTACT_EMAIL ||
    !SENDER_EMAIL
  ) {
    console.error(
      '[RQS CONTACT] Missing environment configuration'
    );

    return res.status(500).json({
      error: 'Server configuration error'
    });
  }

  try {
    // =================================================
    // 1. SALVAR NO FIRESTORE VIA REST
    // =================================================

    const projectId =
      'raquel-synths-platform';

    const firestoreUrl =
      `https://firestore.googleapis.com/v1/projects/` +
      `${projectId}/databases/(default)/documents/mensagens`;

    const now =
      new Date().toISOString();

    const firestoreResponse =
      await fetch(firestoreUrl, {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          fields: {
            name: {
              stringValue:
                String(name).trim()
            },

            email: {
              stringValue:
                normalizedEmail
            },

            subject: {
              stringValue:
                String(subject).trim()
            },

            message: {
              stringValue:
                String(message).trim()
            },

            dataEnvio: {
              timestampValue:
                now
            },

            lida: {
              booleanValue:
                false
            }
          }
        })
      });

    if (!firestoreResponse.ok) {
      const firestoreError =
        await firestoreResponse.text();

      console.error(
        '[RQS CONTACT] Firestore error:',
        firestoreError
      );

      return res.status(500).json({
        error: 'Unable to save message'
      });
    }

    // =================================================
    // 2. ENVIAR ALERTA VIA BREVO
    // =================================================

    const brevoResponse =
      await fetch(
        'https://api.brevo.com/v3/smtp/email',
        {
          method: 'POST',

          headers: {
            'accept':
              'application/json',

            'Content-Type':
              'application/json',

            'api-key':
              BREVO_KEY
          },

          body: JSON.stringify({
            sender: {
              name:
                'RaQuel Synths Uplink',

              email:
                SENDER_EMAIL
            },

            to: [
              {
                email:
                  CONTACT_EMAIL,

                name:
                  'RaQuel Synths'
              }
            ],

            replyTo: {
              email:
                normalizedEmail,

              name:
                String(name).trim()
            },

            subject:
              `[RQS UPLINK] ${subject}`,

            textContent:
          `Nova transmissão recebida pelo terminal RQS.

          Codinome: ${name}
          E-mail: ${normalizedEmail}
          Assunto: ${subject}
          Data: ${now}

          Mensagem:
          ${message}

          Status:
          Não lida no Firestore.`,

            tags: [
              'rqs-contact'
            ]
          })
        }
      );

    if (!brevoResponse.ok) {
      const brevoError =
        await brevoResponse.text();

      console.error(
        '[RQS CONTACT] Brevo error:',
        brevoError
      );

      /*
       * A mensagem já foi salva no Firestore.
       *
       * Portanto não devemos dizer ao usuário
       * que o envio inteiro falhou.
       */
      return res.status(200).json({
        success: true,
        notificationSent: false
      });
    }

    const brevoData =
      await brevoResponse.json();

    return res.status(200).json({
      success: true,
      notificationSent: true,
      messageId:
        brevoData.messageId || null
    });

  } catch (error) {
    console.error(
      '[RQS CONTACT] Unexpected error:',
      error
    );

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
