"use client";

import { DESCRIPTION_FONTS } from "@/lib/types";
import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./editor.module.css";

function TextBgControls({
  title,
  enabled,
  color,
  onToggle,
  onColor,
}: {
  title: string;
  enabled: boolean;
  color: string;
  onToggle: (enabled: boolean) => void;
  onColor: (color: string) => void;
}) {
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#ffffff";

  return (
    <div className={styles.subBlock}>
      <label className={styles.switchRow}>
        <span className={styles.switchText}>
          <strong>{title} background</strong>
          <span className={styles.hint}>
            Show a colored pill behind this text on your public page.
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          className={`${styles.switch} ${enabled ? styles.switchOn : ""}`}
          onClick={() => onToggle(!enabled)}
        >
          <span className={styles.switchThumb} />
        </button>
      </label>
      {enabled ? (
        <div className={styles.field}>
          <span className="label">Background color</span>
          <div className={styles.colorRow}>
            <input
              type="color"
              value={safeColor}
              onChange={(e) => onColor(e.target.value)}
              aria-label={`${title} background color`}
            />
            <input
              className={styles.input}
              value={color}
              onChange={(e) => onColor(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DescriptionEditor() {
  const { page, setPage } = usePageEditor();
  if (!page) return null;
  const { profile } = page;
  const nameBg = profile.nameBackground ?? {
    enabled: false,
    color: "#ffffff",
  };
  const descBg = profile.descriptionBackground ?? {
    enabled: false,
    color: "#ffffff",
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Profile text</h3>
      <div className={styles.field}>
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          className={styles.input}
          value={profile.displayName}
          maxLength={60}
          onChange={(e) =>
            setPage((prev) => ({
              ...prev,
              profile: { ...prev.profile, displayName: e.target.value },
            }))
          }
        />
      </div>

      <TextBgControls
        title="Display name"
        enabled={Boolean(nameBg.enabled)}
        color={nameBg.color || "#ffffff"}
        onToggle={(enabled) =>
          setPage((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              nameBackground: {
                ...prev.profile.nameBackground,
                enabled,
                color: prev.profile.nameBackground?.color || "#ffffff",
              },
            },
          }))
        }
        onColor={(color) =>
          setPage((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              nameBackground: {
                ...prev.profile.nameBackground,
                enabled: true,
                color,
              },
            },
          }))
        }
      />

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className={styles.textarea}
          value={profile.description}
          maxLength={300}
          onChange={(e) =>
            setPage((prev) => ({
              ...prev,
              profile: { ...prev.profile, description: e.target.value },
            }))
          }
        />
        <p className={styles.hint}>{profile.description.length}/300</p>
      </div>

      <TextBgControls
        title="Description"
        enabled={Boolean(descBg.enabled)}
        color={descBg.color || "#ffffff"}
        onToggle={(enabled) =>
          setPage((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              descriptionBackground: {
                ...prev.profile.descriptionBackground,
                enabled,
                color: prev.profile.descriptionBackground?.color || "#ffffff",
              },
            },
          }))
        }
        onColor={(color) =>
          setPage((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              descriptionBackground: {
                ...prev.profile.descriptionBackground,
                enabled: true,
                color,
              },
            },
          }))
        }
      />

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="descFont">Description font</label>
          <select
            id="descFont"
            className={styles.select}
            value={profile.descriptionFont}
            onChange={(e) =>
              setPage((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  descriptionFont: e.target
                    .value as typeof profile.descriptionFont,
                },
              }))
            }
          >
            {DESCRIPTION_FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <span className="label">Description color</span>
          <div className={styles.colorRow}>
            <input
              type="color"
              value={profile.descriptionColor}
              onChange={(e) =>
                setPage((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    descriptionColor: e.target.value,
                  },
                }))
              }
            />
            <input
              className={styles.input}
              value={profile.descriptionColor}
              onChange={(e) =>
                setPage((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    descriptionColor: e.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
