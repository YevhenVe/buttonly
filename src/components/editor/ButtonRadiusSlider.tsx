"use client";

import { Slider } from "@/components/ui/Slider";
import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./editor.module.css";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function ButtonRadiusSlider() {
  const { page, setPage } = usePageEditor();
  if (!page) return null;

  const style = page.buttonStyle;
  const opacity = clamp(style.opacity ?? 92, 0, 100);
  const blur = clamp(style.blur ?? 0, 0, 24);
  const borderRadius = clamp(style.borderRadius ?? 12, 0, 40);
  const backgroundColor = style.backgroundColor || "#ffffff";
  const textColor = style.textColor || "#111111";

  const patch = (partial: Partial<typeof style>) => {
    setPage((prev) => ({
      ...prev,
      buttonStyle: { ...prev.buttonStyle, ...partial },
    }));
  };

  // Transparency = how see-through (inverse of opacity) for the slider label UX
  const transparency = 100 - opacity;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Buttons</h3>

      <div className={styles.row}>
        <div className={styles.field}>
          <span className="label">Background color</span>
          <div className={styles.colorRow}>
            <input
              type="color"
              value={
                /^#[0-9a-fA-F]{6}$/.test(backgroundColor)
                  ? backgroundColor
                  : "#ffffff"
              }
              onChange={(e) => patch({ backgroundColor: e.target.value })}
              aria-label="Button background color"
            />
            <input
              className={styles.input}
              value={backgroundColor}
              onChange={(e) => patch({ backgroundColor: e.target.value })}
              placeholder="#ffffff"
              spellCheck={false}
            />
          </div>
        </div>
        <div className={styles.field}>
          <span className="label">Text color</span>
          <div className={styles.colorRow}>
            <input
              type="color"
              value={
                /^#[0-9a-fA-F]{6}$/.test(textColor) ? textColor : "#111111"
              }
              onChange={(e) => patch({ textColor: e.target.value })}
              aria-label="Button text color"
            />
            <input
              className={styles.input}
              value={textColor}
              onChange={(e) => patch({ textColor: e.target.value })}
              placeholder="#111111"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
      <p className={styles.hint}>
        Custom colors apply to all link buttons. Remember to press Save.
      </p>

      <Slider
        label="Corner radius"
        value={borderRadius}
        min={0}
        max={40}
        onChange={(borderRadius) => patch({ borderRadius })}
      />
      <Slider
        label="Transparency"
        value={transparency}
        min={0}
        max={90}
        unit="%"
        onChange={(t) => patch({ opacity: 100 - t })}
      />
      <p className={styles.hint}>
        Higher transparency makes button backgrounds more see-through over your
        page background.
      </p>
      <Slider
        label="Blur"
        value={blur}
        min={0}
        max={24}
        onChange={(blur) => patch({ blur })}
      />
      <p className={styles.hint}>
        Backdrop blur (frosted-glass look). Works best with some transparency.
      </p>
    </div>
  );
}
