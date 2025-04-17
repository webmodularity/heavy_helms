export default function DuelLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full absolute inset-0">
      {children}
    </div>
  );
}
