"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { publicPageUrl } from "@/lib/share";
import styles from "./PublicPage.module.css";

/**
 * QR code block shown on the public page when `qrCodeEnabled` is on.
 *
 * The URL is resolved only after mount so the server-rendered and
 * client-rendered markup match (the origin is only known on the client),
 * which avoids React hydration mismatches on the `/[username]` route.
 */
export function QRCodeCard({ username }: { username: string }) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    setHref(publicPageUrl(username));
  }, [username]);

  return (
    <div className={styles.qrCard}>
      <div className={styles.qrFrame}>
        {href ? (
          <QRCodeSVG
            value={href}
            size={168}
            level="M"
            fgColor="#111111"
            bgColor="#ffffff"
            marginSize={2}
            title={`QR code for /${username}`}
            style={{ width: "100%", height: "auto" }}
          />
        ) : null}
      </div>
      <p className={styles.qrCaption}>Scan to open /{username}</p>
    </div>
  );
}
