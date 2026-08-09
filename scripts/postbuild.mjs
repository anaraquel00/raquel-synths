/* scripts/postbuild.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve o caminho exato até a pasta dist/raquel-synths/browser
const distDir = path.resolve(__dirname, '../dist/raquel-synths/browser');
const csrFile = path.join(distDir, 'index.csr.html');

try {
  if (fs.existsSync(csrFile)) {
    await fs.promises.unlink(csrFile);
    console.log('🛡️ [RQS POSTBUILD] ✓ index.csr.html removido com sucesso para evitar bypass do SSR na Vercel!');
  } else {
    console.log('🛡️ [RQS POSTBUILD] ℹ index.csr.html não encontrado. Pulando etapa.');
  }
} catch (err) {
  console.error('🛡️ [RQS POSTBUILD] ✖ Erro ao remover index.csr.html:', err);
  process.exit(1);
}
