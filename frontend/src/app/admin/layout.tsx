export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">EcoRent</p>
              </div>
            </div>

            <nav className="mt-4 grid gap-1">
              <a
                href="/admin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                Dashboard
              </a>
              <a
                href="/admin/packages"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                Packages
              </a>
              <a
                href="/admin/owners"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                Owners
              </a>
            </nav>

            <div className="mt-6 rounded-xl bg-sky-50 p-4">
              <p className="text-xs text-sky-900">
                Tip: Nếu API admin cần token, hãy đăng nhập trước và lưu accessToken.
              </p>
            </div>
          </aside>

          <section className="min-w-0 rounded-2xl border bg-white p-6 shadow-sm">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
