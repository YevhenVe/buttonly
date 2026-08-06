"use client";

import { faviconUrlFromLink } from "@/lib/icons";
import { isValidUrl, normalizeUrl } from "@/lib/validation";
import type { ButtonGroup, LinkButton } from "@/lib/types";
import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./editor.module.css";

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function reindex<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

export function GroupsEditor() {
  const { page, setPage } = usePageEditor();
  if (!page) return null;

  const groups = sortByOrder(page.groups);

  const updateGroups = (next: ButtonGroup[]) => {
    setPage((prev) => ({ ...prev, groups: next }));
  };

  const addGroup = () => {
    const group: ButtonGroup = {
      id: crypto.randomUUID(),
      title: "New group",
      order: groups.length,
      buttons: [],
    };
    updateGroups([...groups, group]);
  };

  const removeGroup = (id: string) => {
    updateGroups(reindex(groups.filter((g) => g.id !== id)));
  };

  const moveGroup = (id: string, dir: -1 | 1) => {
    const idx = groups.findIndex((g) => g.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= groups.length) return;
    const next = [...groups];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item!);
    updateGroups(reindex(next));
  };

  const patchGroup = (id: string, partial: Partial<ButtonGroup>) => {
    updateGroups(
      groups.map((g) => (g.id === id ? { ...g, ...partial } : g)),
    );
  };

  const addButton = (groupId: string) => {
    updateGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        const buttons = sortByOrder(g.buttons);
        const button: LinkButton = {
          id: crypto.randomUUID(),
          label: "My link",
          url: "https://",
          order: buttons.length,
          iconUrl: null,
          is18Plus: false,
        };
        return { ...g, buttons: [...buttons, button] };
      }),
    );
  };

  const patchButton = (
    groupId: string,
    buttonId: string,
    partial: Partial<LinkButton>,
  ) => {
    updateGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          buttons: g.buttons.map((b) =>
            b.id === buttonId ? { ...b, ...partial } : b,
          ),
        };
      }),
    );
  };

  const removeButton = (groupId: string, buttonId: string) => {
    updateGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          buttons: reindex(g.buttons.filter((b) => b.id !== buttonId)),
        };
      }),
    );
  };

  const moveButton = (groupId: string, buttonId: string, dir: -1 | 1) => {
    updateGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        const buttons = sortByOrder(g.buttons);
        const idx = buttons.findIndex((b) => b.id === buttonId);
        const target = idx + dir;
        if (idx < 0 || target < 0 || target >= buttons.length) return g;
        const next = [...buttons];
        const [item] = next.splice(idx, 1);
        next.splice(target, 0, item!);
        return { ...g, buttons: reindex(next) };
      }),
    );
  };

  const onUrlBlur = (groupId: string, button: LinkButton) => {
    const url = normalizeUrl(button.url);
    const iconUrl = isValidUrl(url) ? faviconUrlFromLink(url) : null;
    patchButton(groupId, button.id, { url, iconUrl });
  };

  const groupTitleBg = page.groupTitleStyle?.background ?? {
    enabled: false,
    color: "#ffffff",
  };
  const groupTitleBgColor = /^#[0-9a-fA-F]{6}$/.test(groupTitleBg.color || "")
    ? groupTitleBg.color
    : "#ffffff";

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Link groups</h3>
        <p className={styles.hint}>
          Group buttons into sections. Site icons are detected from the URL
          automatically.
        </p>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={addGroup}>
          Add group
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Group title style</h3>
        <label className={styles.switchRow}>
          <span className={styles.switchText}>
            <strong>Group title background</strong>
            <span className={styles.hint}>
              Colored pill behind section titles on your public page.
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(groupTitleBg.enabled)}
            className={`${styles.switch} ${groupTitleBg.enabled ? styles.switchOn : ""}`}
            onClick={() =>
              setPage((prev) => ({
                ...prev,
                groupTitleStyle: {
                  background: {
                    color:
                      prev.groupTitleStyle?.background?.color || "#ffffff",
                    enabled: !prev.groupTitleStyle?.background?.enabled,
                  },
                },
              }))
            }
          >
            <span className={styles.switchThumb} />
          </button>
        </label>
        {groupTitleBg.enabled ? (
          <div className={styles.field}>
            <span className="label">Background color</span>
            <div className={styles.colorRow}>
              <input
                type="color"
                value={groupTitleBgColor}
                onChange={(e) =>
                  setPage((prev) => ({
                    ...prev,
                    groupTitleStyle: {
                      background: {
                        enabled: true,
                        color: e.target.value,
                      },
                    },
                  }))
                }
                aria-label="Group title background color"
              />
              <input
                className={styles.input}
                value={groupTitleBg.color || "#ffffff"}
                onChange={(e) =>
                  setPage((prev) => ({
                    ...prev,
                    groupTitleStyle: {
                      background: {
                        enabled: true,
                        color: e.target.value,
                      },
                    },
                  }))
                }
                spellCheck={false}
              />
            </div>
          </div>
        ) : null}
      </div>

      {groups.map((group, gIndex) => {
        const buttons = sortByOrder(group.buttons);
        return (
          <div key={group.id} className={styles.groupCard}>
            <div className={styles.groupHeader}>
              <input
                className={styles.input}
                value={group.title}
                placeholder="Group title (optional)"
                onChange={(e) =>
                  patchGroup(group.id, { title: e.target.value })
                }
              />
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSm}`}
                disabled={gIndex === 0}
                onClick={() => moveGroup(group.id, -1)}
              >
                Up
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSm}`}
                disabled={gIndex === groups.length - 1}
                onClick={() => moveGroup(group.id, 1)}
              >
                Down
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                onClick={() => removeGroup(group.id)}
              >
                Delete
              </button>
            </div>

            {buttons.map((button, bIndex) => {
              const adult = Boolean(button.is18Plus);
              return (
                <div key={button.id} className={styles.buttonRow}>
                  <div className={styles.field}>
                    <label>Label</label>
                    <input
                      className={styles.input}
                      value={button.label}
                      onChange={(e) =>
                        patchButton(group.id, button.id, {
                          label: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label>URL</label>
                    <input
                      className={styles.input}
                      value={button.url}
                      onChange={(e) =>
                        patchButton(group.id, button.id, {
                          url: e.target.value,
                        })
                      }
                      onBlur={() => onUrlBlur(group.id, button)}
                    />
                  </div>

                  <label className={styles.switchRow}>
                    <span className={styles.switchText}>
                      <strong>18+ link</strong>
                      <span className={styles.hint}>
                        Visitors must confirm age before opening this button.
                      </span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={adult}
                      className={`${styles.switch} ${adult ? styles.switchOn : ""}`}
                      onClick={() =>
                        patchButton(group.id, button.id, {
                          is18Plus: !adult,
                        })
                      }
                    >
                      <span className={styles.switchThumb} />
                    </button>
                  </label>

                  {adult ? (
                    <div className={styles.warningBox} role="status">
                      <strong>Warning:</strong> This button is marked 18+. A
                      confirmation dialog will appear before the link opens.
                    </div>
                  ) : null}

                  <div className={styles.buttonActions}>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSm}`}
                      disabled={bIndex === 0}
                      onClick={() => moveButton(group.id, button.id, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSm}`}
                      disabled={bIndex === buttons.length - 1}
                      onClick={() => moveButton(group.id, button.id, 1)}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                      onClick={() => removeButton(group.id, button.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className={styles.btn}
              onClick={() => addButton(group.id)}
            >
              Add button
            </button>
          </div>
        );
      })}
    </div>
  );
}
