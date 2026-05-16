/* eslint-disable no-console */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_TOKEN) {
  console.error('Missing REPLICATE_API_TOKEN');
  process.exit(1);
}

const STYLE_PACKSHOT =
  'editorial product photography, deep matte black studio backdrop, dramatic copper rim light from upper right at 30 degrees, ' +
  'soft sunrise glow halo, deep shadows, alpine craft brewery aesthetic, 35mm film grain, hyperrealistic, ' +
  'no people, no extra text beyond the label, cinematic, moody, premium craft beer commercial';

const STYLE_LANDSCAPE =
  'alpine editorial logbook aesthetic, dramatic copper sunrise gradient palette, deep glacier blue shadows, ' +
  '35mm film grain, cinematic ultra-wide composition, no people, no text, no logos, ' +
  'patagonian andes wilderness, hyperrealistic photo';

type Spec = { slug: string; aspect: '3:4' | '16:9'; prompt: string };

const IMAGES: Spec[] = [
  {
    slug: 'products/catedral-packshot',
    aspect: '3:4',
    prompt:
      'A single craft beer aluminum can 473ml standing vertical, matte black background, ' +
      'minimalist label centered on the can with the word "CUMBRE" in bold display sans-serif copper color and below "CATEDRAL" in smaller letters, ' +
      'subtle citrus orange accent stripe near the bottom of the label, condensation droplets, ' +
      'IPA style beer, copper rim light highlighting the can edges. ' + STYLE_PACKSHOT,
  },
  {
    slug: 'products/tronador-packshot',
    aspect: '3:4',
    prompt:
      'A single 1 liter brown glass long-neck bottle (porron format) standing vertical, matte black background, ' +
      'minimalist neck label and body label both centered, body label reading "CUMBRE" in bold copper display sans-serif and below "TRONADOR" smaller, ' +
      'deep dark chocolate brown bottle glass, imperial stout style, dense cream foam slightly visible at the neck, ' +
      'copper rim light tracing the bottle silhouette. ' + STYLE_PACKSHOT,
  },
  {
    slug: 'products/lopez-packshot',
    aspect: '3:4',
    prompt:
      'A single craft beer aluminum can 473ml standing vertical, matte black background, ' +
      'minimalist label centered with two lines of text: "CUMBRE" on top in bold copper display sans-serif, "LOPEZ" below in smaller letters (English spelling no accents), ' +
      'subtle pale golden straw accent stripe, helles lager style, clean condensation droplets, ' +
      'copper rim light from upper right. ' + STYLE_PACKSHOT,
  },
  {
    slug: 'products/frey-packshot',
    aspect: '3:4',
    prompt:
      'A single craft beer aluminum can 473ml standing vertical, matte black background, ' +
      'minimalist label centered, "CUMBRE" in bold copper display sans-serif and "FREY" below smaller, ' +
      'noble herbal green accent line, bohemian pilsner style, light condensation, ' +
      'copper rim light tracing the can. ' + STYLE_PACKSHOT,
  },
  {
    slug: 'products/laguna-negra-packshot',
    aspect: '3:4',
    prompt:
      'A single 1 liter dark brown glass long-neck bottle (porron format) standing vertical, matte black background, ' +
      'minimalist body label centered with two lines of text: "CUMBRE" on top in bold copper display sans-serif, "LAGUNA NEGRA" below in smaller letters, ' +
      'almost opaque very dark brown bottle glass, schwarzbier black lager style, ' +
      'small amount of dense black foam visible at the bottle neck, deep shadow tones, ' +
      'copper rim light tracing the bottle silhouette from upper right. ' + STYLE_PACKSHOT,
  },
  {
    slug: 'products/jakob-packshot',
    aspect: '3:4',
    prompt:
      'A single craft beer aluminum can 473ml standing vertical, matte black background, ' +
      'minimalist label centered with two lines of text: "CUMBRE" on top in bold copper display sans-serif, "JAKOB" below in smaller letters, ' +
      'deep chocolate brown accent stripe near the bottom of the label, american porter style, fine condensation droplets, ' +
      'copper rim light from upper right. ' + STYLE_PACKSHOT,
  },
  {
    slug: 'hero',
    aspect: '16:9',
    prompt:
      'Extremely dark moody nighttime silhouette of Patagonian Andes mountain ridge, ' +
      'foreground mountains pure black silhouette taking lower 60 percent of frame, ' +
      'a narrow horizon band of warm copper and amber sunrise glow only at the very edge of the ridgeline, ' +
      'sky above fading from copper to deep ink black, dramatic underexposed editorial photography, ' +
      'fine grain, no stars, no clouds, no buildings, no people, no text, ' +
      'minimalist alpine logbook aesthetic, hyperrealistic dark cinematic photography, the mood is "before dawn over the peaks"',
  },
  {
    slug: 'og',
    aspect: '16:9',
    prompt:
      'Dark moody Patagonian Andes mountain ridge silhouette at copper dawn, ' +
      'pure black mountains in lower 50 percent, thin copper sunrise glow along the ridge line, ' +
      'sky dark fading to deep amber at horizon, ' +
      'extensive negative space in the upper half for editorial text overlay, ' +
      'no people, no buildings, no text, no logos, ' +
      'cinematic editorial dark photography, hyperrealistic, alpine craft brewery moodboard, fine grain',
  },
];

const OUTPUT_DIR = path.join(process.cwd(), 'public');

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function generate(spec: Spec, attempt = 1): Promise<void> {
  const outPath = path.join(OUTPUT_DIR, `${spec.slug}.jpg`);
  if (existsSync(outPath)) {
    console.log(`  skip  ${spec.slug}.jpg already exists`);
    return;
  }

  await mkdir(path.dirname(outPath), { recursive: true });

  if (attempt === 1) console.log(`  gen   ${spec.slug} (${spec.aspect})`);
  else console.log(`  retry ${spec.slug} (attempt ${attempt})`);

  const start = Date.now();

  const res = await fetch(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt: spec.prompt,
          aspect_ratio: spec.aspect,
          output_format: 'jpg',
          output_quality: 88,
          safety_tolerance: 2,
        },
      }),
    },
  );

  if (res.status === 429) {
    const body = (await res.json().catch(() => ({}))) as { retry_after?: number };
    const wait = (body.retry_after ?? 11) * 1000 + 500;
    if (attempt > 6) throw new Error('429 after 6 retries');
    console.log(`     429 backoff ${(wait / 1000).toFixed(1)}s`);
    await sleep(wait);
    return generate(spec, attempt + 1);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Replicate ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { output?: string | string[]; error?: string };
  if (data.error) throw new Error(data.error);

  const url = Array.isArray(data.output) ? data.output[0] : data.output;
  if (!url) throw new Error('No output URL');

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  await writeFile(outPath, buf);

  const dt = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  done  ${spec.slug}.jpg (${(buf.length / 1024).toFixed(0)} KB, ${dt}s)`);
}

async function main(): Promise<void> {
  console.log(`Cumbre image generation. ${IMAGES.length} images. Output: ${OUTPUT_DIR}`);
  for (const spec of IMAGES) {
    try {
      await generate(spec);
    } catch (e) {
      console.error(`FAILED ${spec.slug}:`, (e as Error).message);
    }
  }
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
