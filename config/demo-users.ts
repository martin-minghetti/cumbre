// Public demo credentials: shown on /admin-login, README and the portfolio. Not secrets.
export const DEMO_USERS = [
  { email: 'owner@cumbre.beer', password: 'cumbre-owner', role: 'owner', name: 'Owner Demo' },
  { email: 'cashier@cumbre.beer', password: 'cumbre-cashier', role: 'cashier', name: 'Cajero Demo' },
] as const;
