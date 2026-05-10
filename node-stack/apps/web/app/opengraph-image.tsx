import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NodeStack — Production-Ready SaaS Boilerplate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial gradient accent — top-left */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Radial gradient accent — bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                background: "white",
                borderRadius: 4,
              }}
            />
          </div>
          <span
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            NodeStack
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Production-Ready
          <span style={{ color: "#818cf8" }}> SaaS</span>
          <br />
          Boilerplate
        </div>

        {/* Sub-headline */}
        <div
          style={{
            color: "#94a3b8",
            fontSize: 24,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          NestJS + Next.js + Drizzle · Ship in days, not months
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 48,
            padding: "16px 40px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {(
            [
              ["10k+", "Developers"],
              ["99.9%", "Uptime"],
              ["< 5min", "Setup"],
            ] as const
          ).map(([number, label]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{ color: "#818cf8", fontSize: 28, fontWeight: 800 }}
              >
                {number}
              </span>
              <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
