// src/app/leaderboards/layout.tsx
export default function LeaderboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple layout to prevent root layout container constraints
  return <div>{children}</div>;
}
