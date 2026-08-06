"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { cropImageToDataUrl } from "@/lib/image/cropToDataUrl";
import { estimateDataUrlKb } from "@/lib/image/compressImage";
import { Slider } from "@/components/ui/Slider";
import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./editor.module.css";

export function AvatarEditor() {
  const { page, setPage } = usePageEditor();
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const avatar = page?.profile.avatarDataUrl ?? null;

  const onFile = (file: File | null) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    const url = URL.createObjectURL(file);
    setRawSrc(url);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const applyCrop = async () => {
    if (!rawSrc || !croppedArea) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await cropImageToDataUrl(rawSrc, croppedArea);
      setPage((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatarDataUrl: dataUrl },
      }));
      URL.revokeObjectURL(rawSrc);
      setRawSrc(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to crop image");
    } finally {
      setBusy(false);
    }
  };

  const clearAvatar = () => {
    setPage((prev) => ({
      ...prev,
      profile: { ...prev.profile, avatarDataUrl: null },
    }));
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Avatar</h3>
      <div className={styles.row}>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.avatarPreview} src={avatar} alt="Avatar" />
        ) : (
          <div className={styles.avatarPreviewEmpty}>No avatar</div>
        )}
        <div className={styles.field}>
          <label htmlFor="avatar-file" className={styles.btn}>
            Upload image
          </label>
          <input
            id="avatar-file"
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <p className={styles.hint}>
            Cropped and compressed to JPEG (max ~150 KB)
            {avatar ? ` · current ${estimateDataUrlKb(avatar)} KB` : ""}
          </p>
        </div>
      </div>
      {avatar ? (
        <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={clearAvatar}>
          Remove avatar
        </button>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {rawSrc ? (
        <div className={styles.modalBackdrop} role="dialog" aria-modal>
          <div className={styles.modal}>
            <h3 className={styles.sectionTitle}>Crop avatar</h3>
            <div className={styles.cropArea}>
              <Cropper
                image={rawSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <Slider
              label="Zoom"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              unit="×"
              onChange={setZoom}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  URL.revokeObjectURL(rawSrc);
                  setRawSrc(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={busy}
                onClick={() => void applyCrop()}
              >
                {busy ? "Saving…" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
