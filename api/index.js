/* api/index.js */
export default async (req, res) => {
  // Importa de forma dinâmica o request handler do seu Express compilado
  const { reqHandler } = await import('../dist/raquel-synths/server/server.mjs');
  return reqHandler(req, res);
};
