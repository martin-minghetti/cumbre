export const brand = {
  name: 'Cumbre',
  legalName: 'Cervecería Cumbre SRL',
  tagline: 'Cerveza patagónica de altura',
  email: 'hola@cumbre.beer',
  phone: '+54 9 294 555-0100',
  address: {
    street: 'Av. Bustillo Km 0.5',
    city: 'San Carlos de Bariloche',
    province: 'Río Negro',
    country: 'AR',
    postalCode: '8400',
  },
  social: {
    instagram: '@cumbre.beer',
    facebook: 'cumbre.beer',
  },
  ageGate: {
    minAge: 18,
    message: 'Sitio para mayores de 18 años. Beber con moderación.',
  },
  palette: {
    bg: '#0A0A0A',
    paper: '#F5F0E8',
    accent: '#C8843A',
    accentDeep: '#8A5520',
    glacier: '#5B7A8C',
    snow: '#E8EEEE',
    text: '#0A0A0A',
    textInverse: '#F5F0E8',
    muted: '#8A8780',
  },
  fonts: {
    display: 'Anton',
    body: 'Newsreader',
    mono: 'JetBrains Mono',
  },
  shipping: {
    pickup: {
      enabled: true,
      address: 'Av. Bustillo Km 0.5, Bariloche',
      hours: 'Lun-Sáb 14:00 a 22:00',
    },
    delivery: {
      enabled: true,
      zones: [
        { name: 'Bariloche centro', cost_cents: 250000, radius_km: 5 },
        { name: 'Bariloche periferia', cost_cents: 450000, radius_km: 15 },
      ],
    },
  },
} as const;

export type Brand = typeof brand;
