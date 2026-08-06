import type { Area } from "react-easy-crop";
import { canvasToCompressedDataUrl } from "./compressImage";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/** Crop a data URL / object URL using pixel crop area, return compressed JPEG data URL. */
export async function cropImageToDataUrl(
  imageSrc: string,
  crop: Area,
  outputSize = 320,
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return canvasToCompressedDataUrl(canvas, "avatar");
}
