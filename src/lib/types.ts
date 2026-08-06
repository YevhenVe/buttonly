export type ThemeMode = "light" | "dark";

export type DescriptionFont = "geist" | "inter" | "serif" | "mono";

export type SharePlatform =
  | "twitter"
  | "facebook"
  | "instagram"
  | "threads"
  | "tiktok"
  | "reddit";

export interface LinkButton {
  id: string;
  label: string;
  url: string;
  order: number;
  iconUrl?: string | null;
  /** When true, visitors confirm 18+ before opening this link. */
  is18Plus?: boolean;
}

export interface ButtonGroup {
  id: string;
  title: string;
  order: number;
  buttons: LinkButton[];
}

/** Optional pill/chip background behind text. */
export interface TextBackgroundStyle {
  enabled: boolean;
  color: string;
}

export interface PageProfile {
  displayName: string;
  description: string;
  descriptionFont: DescriptionFont;
  descriptionColor: string;
  avatarDataUrl: string | null;
  /** Background behind display name */
  nameBackground: TextBackgroundStyle;
  /** Background behind description */
  descriptionBackground: TextBackgroundStyle;
}

/** Style for link group titles on the public page */
export interface GroupTitleStyle {
  background: TextBackgroundStyle;
}

export interface PageBackground {
  type: "color" | "image";
  color: string;
  imageDataUrl: string | null;
  blur: number;
  /** Background image zoom 50–200 (100 = normal cover). */
  zoom: number;
}

export interface ButtonStyle {
  borderRadius: number;
  /** Button background opacity 0–100 (100 = solid). */
  opacity: number;
  /** Backdrop blur on buttons in px. */
  blur: number;
  /** Button fill color (hex). */
  backgroundColor: string;
  /** Button label color (hex). */
  textColor: string;
}

export type ShareLinks = Partial<Record<SharePlatform, string>>;

export interface PageDocument {
  uid: string;
  username: string;
  updatedAt: number;
  /** When true, visitors see an 18+ age warning before the page. */
  is18Plus: boolean;
  profile: PageProfile;
  theme: ThemeMode;
  background: PageBackground;
  buttonStyle: ButtonStyle;
  groupTitleStyle: GroupTitleStyle;
  groups: ButtonGroup[];
  share: ShareLinks;
  shareEnabled: SharePlatform[];
}

export function defaultTextBackground(
  color = "#ffffff",
): TextBackgroundStyle {
  return { enabled: false, color };
}

export interface UsernameDoc {
  uid: string;
  createdAt: number;
}

export const SHARE_PLATFORMS: SharePlatform[] = [
  "twitter",
  "facebook",
  "instagram",
  "threads",
  "tiktok",
  "reddit",
];

export const DESCRIPTION_FONTS: { id: DescriptionFont; label: string }[] = [
  { id: "geist", label: "Geist Sans" },
  { id: "inter", label: "Inter" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
];

export function createDefaultPage(uid: string, username: string): PageDocument {
  return {
    uid,
    username,
    updatedAt: Date.now(),
    is18Plus: false,
    profile: {
      displayName: username,
      description: "Welcome to my links",
      descriptionFont: "geist",
      descriptionColor: "#666666",
      avatarDataUrl: null,
      nameBackground: defaultTextBackground("#ffffff"),
      descriptionBackground: defaultTextBackground("#ffffff"),
    },
    theme: "light",
    background: {
      type: "color",
      color: "#f5f5f5",
      imageDataUrl: null,
      blur: 0,
      zoom: 100,
    },
    buttonStyle: {
      borderRadius: 12,
      opacity: 92,
      blur: 0,
      backgroundColor: "#ffffff",
      textColor: "#111111",
    },
    groupTitleStyle: {
      background: defaultTextBackground("#ffffff"),
    },
    groups: [
      {
        id: crypto.randomUUID(),
        title: "",
        order: 0,
        buttons: [],
      },
    ],
    share: {},
    shareEnabled: [],
  };
}

/** Normalize older Firestore docs that may lack newer fields. */
export function normalizePageDocument(raw: PageDocument): PageDocument {
  return {
    ...createDefaultPage(raw.uid, raw.username),
    ...raw,
    is18Plus: Boolean(raw.is18Plus),
    profile: {
      ...createDefaultPage(raw.uid, raw.username).profile,
      ...raw.profile,
      nameBackground: {
        ...defaultTextBackground(),
        ...raw.profile?.nameBackground,
        enabled: Boolean(raw.profile?.nameBackground?.enabled),
      },
      descriptionBackground: {
        ...defaultTextBackground(),
        ...raw.profile?.descriptionBackground,
        enabled: Boolean(raw.profile?.descriptionBackground?.enabled),
      },
    },
    background: {
      ...createDefaultPage(raw.uid, raw.username).background,
      ...raw.background,
      zoom:
        typeof raw.background?.zoom === "number" &&
        Number.isFinite(raw.background.zoom)
          ? Math.min(200, Math.max(50, raw.background.zoom))
          : 100,
    },
    buttonStyle: {
      ...createDefaultPage(raw.uid, raw.username).buttonStyle,
      ...raw.buttonStyle,
    },
    groupTitleStyle: {
      background: {
        ...defaultTextBackground(),
        ...raw.groupTitleStyle?.background,
        enabled: Boolean(raw.groupTitleStyle?.background?.enabled),
      },
    },
    groups: Array.isArray(raw.groups) ? raw.groups : [],
    share: raw.share ?? {},
    shareEnabled: Array.isArray(raw.shareEnabled) ? raw.shareEnabled : [],
  };
}
