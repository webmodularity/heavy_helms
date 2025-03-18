export default function CharacterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      {children}
    </div>
  );
} 