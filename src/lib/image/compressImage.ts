export type CompressPreset = "avatar" | "background";

type PresetConfig = {
  maxWidth: number;
  maxHeight: number;
  /** Max data-URL string length (base64 is ~33% larger than binary). */
  maxBytes: number;
  quality: number;
  /** Do not reduce quality below this when fitting budget. */
  minQuality: number;
  /** Prefer not to shrink long side below this unless forced. */
  minLongSide: number;
};

const PRESETS: Record<CompressPreset, PresetConfig> = {
  avatar: {
    maxWidth: 320,
    maxHeight: 320,
    maxBytes: 150_000,
    quality: 0.86,
    minQuality: 0.72,
    minLongSide: 256,
  },
  background: {
    maxWidth: 1920,
    maxHeight: 1920,
    maxBytes: 720_000,
    quality: 0.9,
    minQuality: 0.72,
    minLongSide: 1280,
  },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function drawScaled(
  img: CanvasImageSource,
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): HTMLCanvasElement {
  let w = width;
  let h = height;
  const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
  w = Math.max(1, Math.round(w * ratio));
  h = Math.max(1, Math.round(h * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

function scaleCanvas(
  source: HTMLCanvasElement,
  scale: number,
): HTMLCanvasElement {
  const next = document.createElement("canvas");
  next.width = Math.max(1, Math.round(source.width * scale));
  next.height = Math.max(1, Math.round(source.height * scale));
  const ctx = next.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, next.width, next.height);
  return next;
}

function encodeAtQuality(
  canvas: HTMLCanvasElement,
  mime: "image/webp" | "image/jpeg",
  quality: number,
): string | null {
  try {
    const dataUrl = canvas.toDataURL(mime, quality);
    if (!dataUrl.startsWith(`data:${mime}`)) return null;
    return dataUrl;
  } catch {
    return null;
  }
}

/** Prefer WebP when smaller; fall back to JPEG. */
function encodeBest(
  canvas: HTMLCanvasElement,
  quality: number,
): string {
  const webp = encodeAtQuality(canvas, "image/webp", quality);
  const jpeg = encodeAtQuality(canvas, "image/jpeg", quality);
  if (webp && jpeg) {
    return webp.length <= jpeg.length ? webp : jpeg;
  }
  return webp || jpeg || canvas.toDataURL("image/jpeg", quality);
}

/**
 * Fit under maxBytes: lower quality first (binary search), then gentle
 * resolution reduction only if still over budget.
 */
function encodeUnderBudget(
  canvas: HTMLCanvasElement,
  config: PresetConfig,
): string {
  let current = canvas;
  let quality = config.quality;

  // 1) Binary-search quality at current resolution
  let lo = config.minQuality;
  let hi = config.quality;
  let best = encodeBest(current, quality);

  if (best.length > config.maxBytes) {
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      const candidate = encodeBest(current, mid);
      if (candidate.length <= config.maxBytes) {
        best = candidate;
        quality = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    // Ensure we keep the best in-budget result; if none, use lowest quality
    if (best.length > config.maxBytes) {
      best = encodeBest(current, config.minQuality);
      quality = config.minQuality;
    }
  }

  // 2) If still too large, downscale gradually (prefer keep minLongSide)
  let guard = 0;
  while (best.length > config.maxBytes && guard < 12) {
    guard += 1;
    const longSide = Math.max(current.width, current.height);
    if (longSide <= 960) break;

    // Shrink more gently when still above preferred min long side
    const scale = longSide > config.minLongSide ? 0.9 : 0.85;
    current = scaleCanvas(current, scale);
    best = encodeBest(current, quality);
  }

  // 3) Last resort: lower quality slightly more on small canvas
  if (best.length > config.maxBytes) {
    let q = quality;
    while (best.length > config.maxBytes && q > 0.55) {
      q -= 0.05;
      best = encodeBest(current, q);
    }
  }

  if (best.length > config.maxBytes) {
    throw new Error(
      `Image is still too large after compression (${Math.round(best.length / 1024)} KB). Try a simpler or smaller photo.`,
    );
  }

  return best;
}

/** Compress a File into a data URL under the preset size budget. */
export async function compressImageFile(
  file: File,
  preset: CompressPreset,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  const config = PRESETS[preset];
  const raw = await readFileAsDataUrl(file);
  const img = await loadImage(raw);
  const canvas = drawScaled(
    img,
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    config.maxWidth,
    config.maxHeight,
  );
  return encodeUnderBudget(canvas, config);
}

/** Encode an existing canvas (e.g. crop result) under the avatar budget. */
export function canvasToCompressedDataUrl(
  canvas: HTMLCanvasElement,
  preset: CompressPreset = "avatar",
): string {
  const config = PRESETS[preset];
  const scaled = drawScaled(
    canvas,
    canvas.width,
    canvas.height,
    config.maxWidth,
    config.maxHeight,
  );
  return encodeUnderBudget(scaled, config);
}

export function estimateDataUrlKb(dataUrl: string | null | undefined): number {
  if (!dataUrl) return 0;
  return Math.round(dataUrl.length / 1024);
}

/** Rough total base64 payload size for Firestore safety (~1 MiB limit). */
export function estimatePageImagePayloadBytes(page: {
  profile?: { avatarDataUrl?: string | null };
  background?: { imageDataUrl?: string | null };
}): number {
  const avatar = page.profile?.avatarDataUrl?.length ?? 0;
  const bg = page.background?.imageDataUrl?.length ?? 0;
  return avatar + bg;
}

export const BACKGROUND_MAX_KB = Math.round(PRESETS.background.maxBytes / 1024);
export const AVATAR_MAX_KB = Math.round(PRESETS.avatar.maxBytes / 1024);
