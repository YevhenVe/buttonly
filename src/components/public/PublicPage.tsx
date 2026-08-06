import type { CSSProperties } from "react";
import type { PageDocument } from "@/lib/types";
import { descriptionFontFamily } from "@/lib/fonts";
import { LinkButton } from "./LinkButton";
import { ShareBar } from "./ShareBar";
import { AgeGate } from "./AgeGate";
import styles from "./PublicPage.module.css";

function hexToRgbTriplet(hex: string, fallback: string): string {
  const raw = hex.trim().replace(/^#/, "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return fallback;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function themeVars(page: PageDocument): CSSProperties {
  const isDark = page.theme === "dark";
  const opacity = Math.min(100, Math.max(0, page.buttonStyle.opacity ?? 92));
  const blur = Math.min(24, Math.max(0, page.buttonStyle.blur ?? 0));
  const radius = Math.min(40, Math.max(0, page.buttonStyle.borderRadius ?? 12));

  const defaultBg = isDark ? "#171717" : "#ffffff";
  const defaultText = isDark ? "#ededed" : "#111111";
  const bgHex = page.buttonStyle.backgroundColor || defaultBg;
  const textHex = page.buttonStyle.textColor || defaultText;
  const surfaceRgb = hexToRgbTriplet(
    bgHex,
    isDark ? "23, 23, 23" : "255, 255, 255",
  );

  return {
    ["--page-bg-color" as string]:
      page.background.type === "color"
        ? page.background.color
        : isDark
          ? "#0a0a0a"
          : "#f5f5f5",
    ["--page-fg" as string]: isDark ? "#ededed" : "#111111",
    ["--page-surface" as string]: isDark
      ? "rgba(23, 23, 23, 0.92)"
      : "rgba(255, 255, 255, 0.92)",
    ["--button-radius" as string]: `${radius}px`,
    ["--button-opacity" as string]: String(opacity / 100),
    ["--button-blur" as string]: `${blur}px`,
    ["--button-surface-rgb" as string]: surfaceRgb,
    ["--button-text" as string]: textHex,
  };
}

export function PublicPage({
  page,
  preview = false,
}: {
  page: PageDocument;
  preview?: boolean;
}) {
  const { background, profile } = page;
  const groups = [...page.groups].sort((a, b) => a.order - b.order);
  const is18Plus = Boolean(page.is18Plus);
  const zoom = Math.min(200, Math.max(50, background.zoom ?? 100));
  const zoomScale = zoom / 100;
  // Extra scale when blurred so soft edges don't show empty corners
  const blurBoost =
    background.blur > 0 ? 1 + Math.min(background.blur, 24) / 100 : 1;
  const imageScale = zoomScale * blurBoost;

  const initial = (profile.displayName || page.username || "?")
    .charAt(0)
    .toUpperCase();

  const body = (
    <div
      className={`${styles.root} ${preview ? styles.previewShell : ""}`}
      data-theme={page.theme}
      style={themeVars(page)}
    >
      {background.type === "image" && background.imageDataUrl ? (
        <div className={styles.bgLayer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.bgImage}
            src={background.imageDataUrl}
            alt=""
            style={{
              filter:
                background.blur > 0 ? `blur(${background.blur}px)` : undefined,
              transform: imageScale !== 1 ? `scale(${imageScale})` : undefined,
            }}
          />
        </div>
      ) : null}

      <div className={styles.content}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <div className={styles.avatarWrap}>
              {profile.avatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.avatar}
                  src={profile.avatarDataUrl}
                  alt={profile.displayName || page.username}
                />
              ) : (
                <div className={styles.avatarPlaceholder} aria-hidden>
                  {initial}
                </div>
              )}
              {is18Plus ? (
                <span className={styles.ageBadgeOnAvatar} title="Adult content">
                  18+
                </span>
              ) : null}
            </div>
            <h1
              className={`${styles.displayName} ${
                profile.nameBackground?.enabled ? styles.textWithBg : ""
              }`}
              style={
                profile.nameBackground?.enabled
                  ? { backgroundColor: profile.nameBackground.color }
                  : undefined
              }
            >
              {profile.displayName || page.username}
            </h1>
            {profile.description ? (
              <p
                className={`${styles.description} ${
                  profile.descriptionBackground?.enabled
                    ? styles.textWithBg
                    : ""
                }`}
                style={{
                  color: profile.descriptionColor,
                  fontFamily: descriptionFontFamily(profile.descriptionFont),
                  ...(profile.descriptionBackground?.enabled
                    ? {
                        backgroundColor: profile.descriptionBackground.color,
                      }
                    : {}),
                }}
              >
                {profile.description}
              </p>
            ) : null}
          </header>

          <div className={styles.groups}>
            {groups.map((group) => {
              const buttons = [...group.buttons].sort(
                (a, b) => a.order - b.order,
              );
              if (!buttons.length && !group.title) return null;
              return (
                <section key={group.id} className={styles.group}>
                  {group.title ? (
                    <h2
                      className={`${styles.groupTitle} ${
                        page.groupTitleStyle?.background?.enabled
                          ? styles.textWithBg
                          : ""
                      }`}
                      style={
                        page.groupTitleStyle?.background?.enabled
                          ? {
                              backgroundColor:
                                page.groupTitleStyle.background.color,
                              opacity: 1,
                            }
                          : undefined
                      }
                    >
                      {group.title}
                    </h2>
                  ) : null}
                  <div className={styles.buttons}>
                    {buttons.map((btn) => (
                      <LinkButton
                        key={btn.id}
                        label={btn.label}
                        url={btn.url}
                        iconUrl={btn.iconUrl}
                        is18Plus={Boolean(btn.is18Plus)}
                        preview={preview}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <ShareBar page={page} preview={preview} />
        </div>
      </div>
    </div>
  );

  return (
    <AgeGate enabled={is18Plus} preview={preview}>
      {body}
    </AgeGate>
  );
}

export function PublicPageNotFound({ username }: { username: string }) {
  return (
    <div className={styles.notFound}>
      <h1>Page not found</h1>
      <p>
        No page for <strong>@{username}</strong>
      </p>
    </div>
  );
}
