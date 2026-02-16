// frontend/src/components/layout/Sidebar.tsx
export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>Library</li>
          <li>Crates</li>
          <li>Playlists</li>
        </ul>
      </nav>
    </aside>
  );
}
