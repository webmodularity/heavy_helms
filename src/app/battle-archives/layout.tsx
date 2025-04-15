export default function BattleArchivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This simple layout ensures no extra container constraints are added,
  // allowing the page component to control its own width.
  return <div>{children}</div>;
}
