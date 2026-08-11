const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

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

  // =================================================
  // 0. HONEYPOT ANTI-BOT
  // =================================================

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

  const normalizedName =
    String(name).trim();

  const normalizedEmail =
    String(email).trim().toLowerCase();

  const normalizedSubject =
    String(subject).trim();

  const normalizedMessage =
    String(message).trim();

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      error: 'Invalid email'
    });
  }

  // =================================================
  // ENVIRONMENT VARIABLES
  // =================================================

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
                normalizedName
            },

            email: {
              stringValue:
                normalizedEmail
            },

            subject: {
              stringValue:
                normalizedSubject
            },

            message: {
              stringValue:
                normalizedMessage
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
    // 2. PREPARAR CONTEÚDO SEGURO PARA O E-MAIL
    // =================================================

    const safeName =
      escapeHtml(normalizedName);

    const safeEmail =
      escapeHtml(normalizedEmail);

    const safeSubject =
      escapeHtml(normalizedSubject);

    const safeMessage =
      escapeHtml(normalizedMessage)
        .replace(/\n/g, '<br>');

    const formattedDate =
      new Intl.DateTimeFormat(
        'pt-BR',
        {
          dateStyle: 'full',
          timeStyle: 'medium',
          timeZone: 'America/Recife'
        }
      ).format(new Date(now));

    // =================================================
    // 3. HTML — RQS TERMINAL
    // =================================================

    const htmlContent = `
<!doctype html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>RQS Uplink</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#05050a;
    font-family:
      Arial,
      Helvetica,
      sans-serif;
    color:#e8e8ee;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    style="
      width:100%;
      background:#05050a;
      padding:32px 12px;
    "
  >

    <tr>
      <td align="center">

        <!-- ======================================== -->
        <!-- CONTAINER PRINCIPAL -->
        <!-- ======================================== -->

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          role="presentation"
          style="
            width:100%;
            max-width:660px;
            background:#090910;
            border:1px solid #00e5ff;
            border-radius:14px;
            overflow:hidden;
          "
        >

          <!-- ====================================== -->
          <!-- HEADER -->
          <!-- ====================================== -->

          <tr>
            <td
              style="
                padding:
                  26px 28px;
                background:
                  #07070d;
                border-bottom:
                  1px solid #1d2735;
              "
            >

              <div
                style="
                  color:#00ff66;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:3px;
                  text-transform:uppercase;
                  margin-bottom:10px;
                "
              >
                RQS // SECURE UPLINK
              </div>

              <h1
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:25px;
                  line-height:1.3;
                  font-weight:700;
                "
              >
                TRANSMISSÃO RECEBIDA // TRANSMISSION RECEIVED
              </h1>

              <div
                style="
                  margin-top:10px;
                  color:#6f7a8f;
                  font-size:12px;
                  letter-spacing:1px;
                "
              >
                // PACKET ACCEPTED
                // TRANSMISSION ARCHIVED
              </div>

            </td>
          </tr>

          <!-- ====================================== -->
          <!-- STATUS -->
          <!-- ====================================== -->

          <tr>
            <td
              style="
                padding:
                  18px 28px 0;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
              >
                <tr>

                  <td
                    style="
                      padding:
                        12px 16px;
                      background:
                        #04110a;
                      border:
                        1px solid #00ff66;
                      color:
                        #00ff66;
                      font-size:
                        12px;
                      font-weight:
                        700;
                      letter-spacing:
                        1px;
                    "
                  >
                    ● STATUS:
                    UPLINK ESTABLISHED
                  </td>

                </tr>
              </table>

            </td>
          </tr>

          <!-- ====================================== -->
          <!-- DADOS -->
          <!-- ====================================== -->

          <tr>
            <td
              style="
                padding:20px 28px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="
                  background:#050509;
                  border:
                    1px solid #222938;
                  border-radius:
                    10px;
                "
              >

                <tr>
                  <td
                    style="
                      padding:24px;
                      line-height:1.6;
                    "
                  >

                    <!-- CODINOME -->

                    <div
                      style="
                        color:#00e5ff;
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:2px;
                        margin-bottom:4px;
                      "
                    >
                     [ CODINOME / OPERATOR ID ]
                    </div>

                    <div
                      style="
                        color:#ffffff;
                        font-size:17px;
                        margin-bottom:20px;
                      "
                    >
                      ${safeName}
                    </div>

                    <!-- EMAIL -->

                    <div
                      style="
                        color:#00e5ff;
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:2px;
                        margin-bottom:4px;
                      "
                    >
                      [ FREQUÊNCIA DE RETORNO / RETURN FREQUENCY ]
                    </div>

                    <div
                      style="
                        margin-bottom:20px;
                      "
                    >

                      <a
                        href="mailto:${safeEmail}"
                        style="
                          color:#00ff66;
                          font-size:16px;
                          text-decoration:none;
                        "
                      >
                        ${safeEmail}
                      </a>

                    </div>

                    <!-- ASSUNTO -->

                    <div
                      style="
                        color:#00e5ff;
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:2px;
                        margin-bottom:4px;
                      "
                    >
                      [ ROTA / ASSUNTO // ROUTE / SUBJECT ]
                    </div>

                    <div
                      style="
                        color:#ffffff;
                        font-size:16px;
                        margin-bottom:20px;
                      "
                    >
                      ${safeSubject}
                    </div>

                    <!-- DATA -->

                    <div
                      style="
                        color:#00e5ff;
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:2px;
                        margin-bottom:4px;
                      "
                    >
                      [ TIMESTAMP ]
                    </div>

                    <div
                      style="
                        color:#8791a5;
                        font-size:14px;
                      "
                    >
                      ${escapeHtml(formattedDate)}
                    </div>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- ====================================== -->
          <!-- MESSAGE PAYLOAD -->
          <!-- ====================================== -->

          <tr>
            <td
              style="
                padding:
                  0 28px 24px;
              "
            >

              <div
                style="
                  color:#00e5ff;
                  font-size:11px;
                  font-weight:700;
                  letter-spacing:2px;
                  margin-bottom:9px;
                "
              >
                [ CARGA DE TEXTO RECEBIDA / TEXT PAYLOAD RECEIVED ]
              </div>

              <div
                style="
                  padding:20px;
                  background:#020204;
                  border-left:
                    3px solid #00ff66;
                  border-top:
                    1px solid #151a22;
                  border-right:
                    1px solid #151a22;
                  border-bottom:
                    1px solid #151a22;
                  color:#d7d9df;
                  font-size:15px;
                  line-height:1.75;
                "
              >
                ${safeMessage}
              </div>

            </td>
          </tr>

          <!-- ====================================== -->
          <!-- ACTION -->
          <!-- ====================================== -->

          <tr>
            <td
              align="center"
              style="
                padding:
                  0 28px 30px;
              "
            >

              <a
                href="mailto:${safeEmail}"
                style="
                  display:
                    inline-block;
                  padding:
                    13px 26px;
                  border:
                    1px solid #00ff66;
                  background:
                    #06140c;
                  color:
                    #00ff66;
                  text-decoration:
                    none;
                  font-size:
                    13px;
                  font-weight:
                    700;
                  letter-spacing:
                    1px;
                "
              >
                [ RESPONDER TRANSMISSÃO / REPLY TO TRANSMISSION ]
              </a>

            </td>
          </tr>

          <!-- ====================================== -->
          <!-- FIRESTORE STATUS -->
          <!-- ====================================== -->

          <tr>
            <td
              style="
                padding:
                  16px 28px;
                background:
                  #07070d;
                border-top:
                  1px solid #181e28;
                color:
                  #747d91;
                font-size:
                  11px;
                line-height:
                  1.6;
              "
            >

              <strong
                style="
                  color:#00e5ff;
                "
              >
                RQS UPLINK:
              </strong>

               transmissão recebida e arquivada com sucesso.
              // transmission received and archived successfully.

              <br>

              <strong
                style="
                  color:#00e5ff;
                "
              >
                REPLY CHANNEL:
              </strong>

               responda diretamente a este e-mail para retornar ao remetente.
              // reply directly to this email to return to the sender.

            </td>
          </tr>

          <!-- ====================================== -->
          <!-- FOOTER -->
          <!-- ====================================== -->

          <tr>
            <td
              align="center"
              style="
                padding:
                  20px 28px;
                background:
                  #040407;
                border-top:
                  1px solid #151923;
                color:
                  #596173;
                font-size:
                  10px;
                letter-spacing:
                  1.5px;
              "
            >

              RAQUEL SYNTHS
              // RQS UPLINK SYSTEM

              <br>

              <a
                href="https://raquelsynths.com"
                style="
                  color:#00e5ff;
                  text-decoration:none;
                "
              >
                raquelsynths.com
              </a>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
`;

    // =================================================
    // 4. VERSÃO TEXTO — FALLBACK
    // =================================================

    const textContent =
`RQS // SECURE UPLINK

Nova transmissão recebida.

Codinome:
${normalizedName}

E-mail:
${normalizedEmail}

Assunto:
${normalizedSubject}

Data:
${formattedDate}

Mensagem:
${normalizedMessage}

Status:
Mensagem arquivada no Firestore.
lida=false

RaQuel Synths
https://raquelsynths.com`;

    // =================================================
    // 5. ENVIAR ALERTA VIA BREVO
    // =================================================

    const brevoResponse =
      await fetch(
        'https://api.brevo.com/v3/smtp/email',
        {
          method: 'POST',

          headers: {
            accept:
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
                normalizedName
            },

            subject:
              `[RQS UPLINK] ${normalizedSubject}`,

            htmlContent,

            textContent,

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
       * Portanto o visitante não recebe um falso erro.
       */

      return res.status(200).json({
        success: true,
        notificationSent: false
      });
    }

    // =================================================
    // 6. SUCESSO
    // =================================================

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
