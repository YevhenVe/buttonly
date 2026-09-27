/**
 * 1200×630 Open Graph card for a public Buttonly page.
 *
 * Rendered by Satori (via next/og), so only a subset of CSS is supported:
 * flexbox layout, absolute positioning, inline styles. Text must already be
 * truncated — Satori has no ellipsis.
 */

export interface OgCardData {
  displayName: string;
  username: string;
  description?: string;
  avatarDataUrl?: string | null;
  backgroundColor: string;
  backgroundImageDataUrl?: string | null;
  /** Up to 3 link titles, rendered as pills. */
  links: string[];
}

export function OgCard({ data }: { data: OgCardData }) {
  const {
    displayName,
    username,
    description,
    avatarDataUrl,
    backgroundColor,
    backgroundImageDataUrl,
    links,
  } = data;

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor,
        fontFamily: "Inter",
      }}
    >
      {backgroundImageDataUrl ? (
        <img
          src={backgroundImageDataUrl}
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      ) : null}

      {/* Readability scrim over the background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.30), rgba(0,0,0,0.62))",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 72px",
        }}
      >
        {avatarDataUrl ? (
          <img
            src={avatarDataUrl}
            width={168}
            height={168}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "6px solid rgba(255,255,255,0.9)",
              marginBottom: 24,
            }}
          />
        ) : null}

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {displayName}
        </div>

        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            marginTop: 10,
          }}
        >
          {`@${username}`}
        </div>

        {description ? (
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "rgba(255,255,255,0.88)",
              marginTop: 18,
              textAlign: "center",
              lineHeight: 1.35,
              maxWidth: 880,
            }}
          >
            {description}
          </div>
        ) : null}

        {links.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 14,
              marginTop: 32,
            }}
          >
            {links.map((title) => (
              <div
                key={title}
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: "#ffffff",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderRadius: 999,
                  padding: "12px 28px",
                }}
              >
                {title}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
