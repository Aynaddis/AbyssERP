import dns from 'dns';
// Some networks (and Neon's endpoint) resolve fine over IPv4 but fail/hang over
// IPv6 from Node specifically. Force IPv4 first so Prisma's connection doesn't
// silently pick the broken route. Must run before anything touches the DB.
dns.setDefaultResultOrder('ipv4first');

import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.listen(PORT, () => {
  console.log(`🚀 AbyssERP API running on http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
});