export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Chọn mục ở sidebar để quản lý.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <a href="/admin/packages" className="rounded-2xl border p-5 hover:bg-gray-50">
          <p className="text-sm font-medium text-gray-900">Quản lý Packages</p>
          <p className="mt-1 text-sm text-gray-600">Tạo / sửa / xoá gói admin.</p>
        </a>
        <a href="/admin/owners" className="rounded-2xl border p-5 hover:bg-gray-50">
          <p className="text-sm font-medium text-gray-900">Quản lý Owners</p>
          <p className="mt-1 text-sm text-gray-600">Xem nhanh thông tin owner.</p>
        </a>
      </div>
    </div>
  );
}
