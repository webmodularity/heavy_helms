import "@/styles/globals.css";
import "./sunset.css";

export const metadata = {
  title: 'Heavy Helms - Thank You',
  description: 'Thank you for playing Heavy Helms on Shape Network',
}

export default function SunsetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>{children}</body>
    </html>
  )
}
