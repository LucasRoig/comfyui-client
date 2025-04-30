import Link from "next/link";

export function Header() {
  return (
    <div className="flex px-4 items-center h-full border-b border-gray-100">
      <div className="flex items-center gap-4 mr-6">
        <Link href="/">
          <span className="font-bold">ComfyUI Client</span>
        </Link>
        <nav className="flex gap-2 text-sm">
          <Link href="/components">Components</Link>
          <Link href="/datagrid">Datagrid</Link>
          <Link href="/forms">Forms</Link>
        </nav>
      </div>
    </div>
  );
}
