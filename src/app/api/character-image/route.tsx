import { NextResponse, type NextRequest } from "next/server";
import satori from "satori";
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

// Helper to load font
async function loadFont(fontPath: string) {
  const fullPath = path.join(process.cwd(), "public", fontPath);
  try {
    return await fs.readFile(fullPath);
  } catch (error) {
    console.error(`Error loading font from ${fullPath}:`, error);
    throw new Error(`Failed to load font: ${fontPath}`);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get("characterId");
  const characterName = searchParams.get("characterName");
  const wins = searchParams.get("wins");
  const losses = searchParams.get("losses");
  const characterImageUrl = searchParams.get("characterImageUrl");
  const battleRating = searchParams.get("battleRating");
  const rank = searchParams.get("rank");

  if (!characterId || !characterName) {
    return NextResponse.json(
      { error: "Missing required parameters: characterId and characterName" },
      { status: 400 },
    );
  }

  try {
    // Load the font
    const pixeloidSansFont = await loadFont("fonts/PixeloidMono.ttf");

    const imageBackgroundColor = "#1c1917"; // stone-900
    const textColor = "#fafaf9"; // stone-50
    const accentColor = "#f59e0b"; // amber-500
    const secondaryColor = "#a3a3a3"; // neutral-400

    // Format character ID with leading zeros
    const formattedId = characterId.padStart(5, "0");

    // Parse wins/losses with defaults
    const winsCount = wins ? Number.parseInt(wins, 10) : 0;
    const lossesCount = losses ? Number.parseInt(losses, 10) : 0;
    const battleRatingValue = battleRating
      ? Math.round(Number.parseFloat(battleRating))
      : 0;
    const rankValue = rank && rank !== "null" ? `#${rank}` : "Unranked";

    // Define HTML/JSX structure for the character image
    const element = (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: imageBackgroundColor,
          color: textColor,
          fontFamily: '"PixeloidSans"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(28, 25, 23, 0.9) 50%, rgba(0, 0, 0, 0.8) 100%)",
            zIndex: "0",
          }}
        />

        {/* Character Image Section */}
        <div
          style={{
            width: "40%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: "1",
          }}
        >
          {characterImageUrl && (
            <img
              src={characterImageUrl}
              alt={characterName}
              style={{
                width: "280px",
                height: "280px",
                objectFit: "cover",
                borderRadius: "12px",
                border: `3px solid ${accentColor}`,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              }}
            />
          )}
        </div>

        {/* Character Info Section */}
        <div
          style={{
            width: "60%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 40px",
            position: "relative",
            zIndex: "1",
          }}
        >
          {/* Character Name */}
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: accentColor,
              marginBottom: 16,
              lineHeight: "1.1",
              display: "flex",
            }}
          >
            {characterName}
          </div>

          {/* Character ID */}
          <div
            style={{
              fontSize: 24,
              color: secondaryColor,
              marginBottom: 32,
              fontFamily: "monospace",
              display: "flex",
            }}
          >
            ID: {formattedId}
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Battle Record */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#22c55e", // green-500
                  display: "flex",
                }}
              >
                {winsCount}W
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: secondaryColor,
                  display: "flex",
                }}
              >
                -
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#ef4444", // red-500
                  display: "flex",
                }}
              >
                {lossesCount}L
              </div>
            </div>

            {/* Battle Rating & Rank */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: textColor,
                  display: "flex",
                }}
              >
                <span style={{ color: secondaryColor }}>Rating:</span>{" "}
                <span
                  style={{
                    color: accentColor,
                    fontWeight: "bold",
                    display: "flex",
                  }}
                >
                  {battleRatingValue}
                </span>
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: textColor,
                  display: "flex",
                }}
              >
                <span style={{ color: secondaryColor }}>Rank:</span>{" "}
                <span
                  style={{
                    color: accentColor,
                    fontWeight: "bold",
                    display: "flex",
                  }}
                >
                  {rankValue}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Heavy Helms Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 30,
            fontSize: 16,
            color: secondaryColor,
            zIndex: "2",
            display: "flex",
          }}
        >
          Heavy Helms
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
            zIndex: "0",
          }}
        />
      </div>
    );

    // Generate SVG using Satori
    const svg = await satori(element, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "PixeloidSans",
          data: pixeloidSansFont,
          weight: 400,
          style: "normal",
        },
      ],
    });

    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    // console.log("pngBuffer", pngBuffer);
    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating character image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate character image", details: errorMessage },
      { status: 500 },
    );
  }
}
