const server = import('../dist/raquel-synths/server/server.mjs');

export default async (req, res) => {
  const module = await server;
  return module.app()(req, res);
};
