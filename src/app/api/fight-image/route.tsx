import { NextResponse, type NextRequest } from "next/server";
import satori from "satori";
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

// Helper to load font
async function loadFont(fontPath: string) {
  // Assumes the font is in the `public` directory, adjust if necessary
  const fullPath = path.join(process.cwd(), "public", fontPath);
  try {
    return await fs.readFile(fullPath);
  } catch (error) {
    console.error(`Error loading font from ${fullPath}:`, error);
    // Fallback or re-throw, depending on how critical the font is.
    // For this example, we'll throw, as the image generation relies on it.
    throw new Error(`Failed to load font: ${fontPath}`);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const winnerName = searchParams.get("winnerName");
  const loserName = searchParams.get("loserName");
  const fightId = searchParams.get("fightId"); // Optional

  if (!winnerName || !loserName) {
    return NextResponse.json(
      { error: "Missing winnerName or loserName query parameters" },
      { status: 400 },
    );
  }

  try {
    // Load the font(s)
    // IMPORTANT: Ensure 'fonts/PixeloidSans.ttf' exists in your 'public' directory
    // or update the path and font name accordingly.
    const pixeloidSansFont = await loadFont("fonts/PixeloidMono.ttf");

    const imageBackgroundColor = "#2e1b3b";
    const textColor = "#fafafa"; // A light color for good contrast on the dark background

    // Define HTML/JSX structure for the image content
    const element = (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: imageBackgroundColor,
          color: textColor,
          fontFamily: '"PixeloidSans"', // Must match the name in the fonts array
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 70, marginBottom: 30, lineHeight: "1.2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {winnerName}
        </div>
        <div style={{ fontSize: 45, marginBottom: 40, color: "#cccccc", display: "flex", alignItems: "center", justifyContent: "center" }}>
          defeated
        </div>
        <div style={{ fontSize: 70, marginBottom: 50, lineHeight: "1.2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {loserName}!
        </div>
        {fightId && (
          <div style={{ fontSize: 25, color: "#a0a0a0", marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Fight ID: {fightId}
          </div>
        )}
        <div
          style={{
            fontSize: 20,
            color: "#a0a0a0",
            marginTop: 10,
            position: "absolute",
            bottom: 20,
          }}
        >
          Copyright Warlock Forge
        </div>
      </div>
    );

    // Generate SVG using Satori
    const svg = await satori(element, {
      width: 1200, // Standard Open Graph image width
      height: 630, // Standard Open Graph image height
      fonts: [
        {
          name: "PixeloidSans", // This name is used in the CSS `fontFamily`
          data: pixeloidSansFont,
          weight: 400, // Adjust weight as needed
          style: "normal",
        },
        // You can add more fonts (e.g., a bold version) here if needed
        // {
        //   name: 'PixeloidSans-Bold',
        //   data: await loadFont('fonts/PixeloidSans-Bold.ttf'),
        //   weight: 700,
        //   style: 'normal',
        // },
      ],
      // You can enable debug logging for Satori if you encounter issues
      // debug: true,
    });

    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        // Cache good for production: public, immutable, no-transform, max-age=31536000
        // Cache for development: public, no-cache, no-transform, must-revalidate
        "Cache-Control": "public, no-cache, no-transform, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating fight image:", error);
    // Log the specific error message if available
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate image", details: errorMessage },
      { status: 500 },
    );
  }
}
