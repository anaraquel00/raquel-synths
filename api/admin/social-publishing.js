import { body, requireCsrf, requireOrigin, requireSession, secret } from './system-logs.js';
import { listSources } from '../../lib/social/source-adapters.js';
import { approvePackage, cancelPackage, dryRun, listPackages, saveDraft } from '../../lib/social/packages.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido.' });
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).json({ message: 'Use application/json.' });
    requireOrigin(req);
    const session = requireSession(req, secret());
    requireCsrf(req, session);
    const input = body(req);
    if (input.action === 'list-sources') return res.status(200).json({ sources: await listSources(input.sourceType, input.language || 'pt-BR') });
    if (input.action === 'list-packages') return res.status(200).json({ packages: await listPackages() });
    if (input.action === 'save-draft') return res.status(200).json({ package: await saveDraft(input.package || {}) });
    if (input.action === 'dry-run') return res.status(200).json(await dryRun(input.package || {}));
    if (input.action === 'approve') {
      const result = await approvePackage(input.id, input.dryRunToken);
      return res.status(result.package ? 200 : 409).json(result);
    }
    if (input.action === 'cancel') return res.status(200).json({ package: await cancelPackage(input.id) });
    return res.status(400).json({ message: 'Ação inválida.' });
  } catch (error) {
    const status = error.status === 409 || error.status === 401 || error.status === 403 || error.status === 404 || error.status === 400 ? error.status : 500;
    if (status === 500) console.error('[RQS SOCIAL PUBLISHING]', error.message);
    return res.status(status).json({ message: status === 500 ? 'Falha interna no Social Publishing.' : error.message });
  }
}
