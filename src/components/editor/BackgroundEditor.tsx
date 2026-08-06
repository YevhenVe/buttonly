"use client";

import { useState } from "react";
import {
  BACKGROUND_MAX_KB,
  compressImageFile,
  estimateDataUrlKb,
} from "@/lib/image/compressImage";
import { Slider } from "@/components/ui/Slider";
import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./editor.module.css";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function BackgroundEditor() {
  const { page, setPage } = usePageEditor();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!page) return null;
  const bg = page.background;
  const zoom = clamp(bg.zoom ?? 100, 50, 200);

  const setBg = (partial: Partial<typeof bg>) => {
    setPage((prev) => ({
      ...prev,
      background: { ...prev.background, ...partial },
    }));
  };

  const onImage = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressImageFile(file, "background");
      setBg({ type: "image", imageDataUrl: dataUrl, zoom: bg.zoom ?? 100 });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to process image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Background</h3>

      <div className={styles.toggle} role="group" aria-label="Background type">
        <button
          type="button"
          className={bg.type === "color" ? styles.active : ""}
          onClick={() => setBg({ type: "color" })}
        >
          Color
        </button>
        <button
          type="button"
          className={bg.type === "image" ? styles.active : ""}
          onClick={() => setBg({ type: "image" })}
        >
          Image
        </button>
      </div>

      {bg.type === "color" ? (
        <div className={styles.field}>
          <span className="label">Background color</span>
          <div className={styles.colorRow}>
            <input
              type="color"
              value={bg.color}
              onChange={(e) => setBg({ color: e.target.value })}
            />
            <input
              className={styles.input}
              value={bg.color}
              onChange={(e) => setBg({ color: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.field}>
            <label htmlFor="bg-file">Background image</label>
            <input
              id="bg-file"
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(e) => void onImage(e.target.files?.[0] ?? null)}
            />
            <p className={styles.hint}>
              High-quality compress (WebP/JPEG, up to ~{BACKGROUND_MAX_KB} KB)
              {bg.imageDataUrl
                ? ` · current ${estimateDataUrlKb(bg.imageDataUrl)} KB`
                : ""}
            </p>
          </div>
          {bg.imageDataUrl ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => setBg({ imageDataUrl: null, type: "color" })}
            >
              Remove image
            </button>
          ) : null}

          <Slider
            label="Background blur"
            value={bg.blur}
            min={0}
            max={20}
            onChange={(blur) => setBg({ blur })}
          />

          <Slider
            label="Zoom"
            value={zoom}
            min={50}
            max={200}
            unit="%"
            onChange={(z) => setBg({ zoom: z })}
          />
          <p className={styles.hint}>
            Zoom out below 100%, zoom in above 100%. Image stays centered and
            covers the page.
          </p>
        </>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
