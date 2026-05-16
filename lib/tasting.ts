export type TastingNotes = {
  vista: string;
  nariz: string;
  boca: string;
  temp: string;
};

const FALLBACK: TastingNotes = {
  vista: 'Color y espuma característicos del estilo. Carbonatación natural sin filtros agresivos.',
  nariz: 'Aromas limpios y definidos. La nariz cuenta de qué está hecha la cerveza antes de probarla.',
  boca: 'Cuerpo, amargor y final balanceados según el estilo. Sin endulzantes ni atajos.',
  temp: 'Respetá la temperatura de servicio. Cinco grados de más o de menos cambian la cerveza.',
};

const TASTINGS: Record<string, TastingNotes> = {
  'catedral-ipa-lata': {
    vista: 'Dorado profundo con reflejos cobrizos. Espuma blanca compacta, persistencia alta. Carbonatación visible en columnas finas.',
    nariz: 'Pomelo, naranja, mango y resina de pino. Detrás un pan dulce sutil. Cuatro lúpulos americanos sobre la base de Pilsen y Caramel 60.',
    boca: 'Entrada cítrica y resinosa, cuerpo medio, amargor seco que se queda. Final largo con cáscara de naranja y pino. Pide otra.',
    temp: 'Servir a 6 a 8 grados. Más fría se pierden los aromas del dry hop. Más caliente, el amargor se vuelve agresivo.',
  },
  'tronador-stout-porron': {
    vista: 'Negro opaco, impenetrable. Espuma cremosa color marrón claro, persistente. Cuerpo denso visible al volcar.',
    nariz: 'Café tostado, cacao amargo, ciruelas pasas. Notas de regaliz y un toque de alcohol noble que recuerda al oporto.',
    boca: 'Cuerpo pesado, untuoso. Amargor del tostado más que del lúpulo. Final largo a café espresso y chocolate amargo. No es para sed, es para sobremesa.',
    temp: 'Servir a 10 a 12 grados. Demasiado fría tapa la complejidad. Probala dejándola subir 2 grados en la copa.',
  },
  'lopez-helles-lata': {
    vista: 'Dorado pajizo muy claro, brillante. Espuma blanca fina, persistencia media. Cuerpo limpio sin turbidez.',
    nariz: 'Pan recién horneado, miel sutil, un toque herbal del lúpulo noble. Sin frutas ni cítricos, todo cereal.',
    boca: 'Entrada suave, cuerpo medio liviano. Maltosa pero no dulce. Amargor noble que limpia el paladar y desaparece. La cerveza para tomar de a tres.',
    temp: 'Servir a 4 a 6 grados. Es una lager: temperatura fría es parte del estilo, no le tengas miedo.',
  },
  'frey-pilsner-lata': {
    vista: 'Dorado pálido con destellos verdosos. Espuma blanca densa, anillos al bajar. Carbonatación más viva que la Helles.',
    nariz: 'Lúpulo Saaz dominante: hierbas frescas, flor de tilo, un fondo de cereal cocido. Limpia, sin ester de levadura.',
    boca: 'Amargor noble herbal pronunciado, cuerpo medio, final seco. La amargura se queda más que en una Helles pero no es agresiva. Pilsner checa de manual.',
    temp: 'Servir a 4 a 6 grados. El Saaz se aprecia cuando la cerveza está bien fría.',
  },
  'laguna-negra-schwarzbier-porron': {
    vista: 'Casi opaca, marrón muy oscuro con destellos rubí al trasluz. Espuma marrón densa, persistencia alta. Engaña: parece un stout pero es lager.',
    nariz: 'Chocolate amargo, café tostado suave, un fondo de pan negro. Sin alcohol notorio, sin frutas. Limpieza típica de la fermentación lager.',
    boca: 'Entrada suave, cuerpo medio liviano contra lo que sugiere el color. Tostado presente pero no astringente. Final limpio que invita al segundo trago.',
    temp: 'Servir a 6 a 8 grados. Más fría se pierde el tostado, más caliente se vuelve pesada.',
  },
  'jakob-porter-lata': {
    vista: 'Marrón oscuro con destellos cobrizos al trasluz. Espuma color crema, cremosa, persistencia media alta.',
    nariz: 'Café, cacao en polvo, caramelo tostado. Toque sutil de lúpulo americano detrás. Más complejo que un Brown Ale, menos denso que un Stout.',
    boca: 'Cuerpo medio, tostado del Chocolate Malt presente pero no dominante. Amargor del lúpulo balancea la maltosidad. Final con notas de café y caramelo.',
    temp: 'Servir a 8 a 10 grados. La temperatura justa para que el tostado conviva con la maltosa.',
  },
};

export function getTastingForSlug(slug: string): TastingNotes {
  return TASTINGS[slug] ?? FALLBACK;
}
