import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card. Rendered with the Satori-backed `ImageResponse`, so only
 * the layout subset of CSS is available — no `background-clip: text`, no custom
 * fonts unless they are fetched and passed explicitly.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(140deg, #06050a 0%, #17141c 55%, #0b0a08 100%)",
          color: "#f5f1e8",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(to right, #06050a, #d4a537, #f2d07a, #d4a537, #06050a)",
          }}
        />

        <div
          style={{
            fontSize: 26,
            letterSpacing: 14,
            textTransform: "uppercase",
            color: "#d4a537",
          }}
        >
          Maxwell
        </div>

        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            letterSpacing: 6,
            lineHeight: 1,
            marginTop: 8,
            color: "#f2d07a",
          }}
        >
          AU
        </div>

        <div
          style={{
            width: 220,
            height: 2,
            marginTop: 34,
            background: "linear-gradient(to right, transparent, #d4a537, transparent)",
          }}
        />

        <div
          style={{
            fontSize: 27,
            letterSpacing: 10,
            textTransform: "uppercase",
            marginTop: 30,
            color: "#a79e8c",
          }}
        >
          Worship · Encounter · Transformation
        </div>
      </div>
    ),
    size,
  );
}
