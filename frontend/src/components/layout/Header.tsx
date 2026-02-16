// frontend/src/components/layout/Header.tsx
export default function Header() {
  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-4">
        <h1 className="text-lg font-semibold">DJ Library Manager</h1>
      </div>
    </header>
  );
}
