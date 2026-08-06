import Link from "next/link";
import logo from "@/assets/logo.svg";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** Height in CSS (width auto from aspect ratio). */
  height?: number;
};

export function BrandLogo({
  href = "/",
  className,
  height = 36,
}: BrandLogoProps) {
  const src = typeof logo === "string" ? logo : logo.src;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Buttonly"
      height={height}
      style={{
        height,
        width: "auto",
        display: "block",
        maxWidth: "min(180px, 42vw)",
      }}
    />
  );

  if (!href) return <span className={className}>{image}</span>;

  return (
    <Link
      href={href}
      className={className}
      aria-label="Buttonly home"
      style={{ display: "inline-flex", alignItems: "center", lineHeight: 0 }}
    >
      {image}
    </Link>
  );
}
