export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Bảng điều khiển</h1>
      <p className="mt-2 text-sm text-gray-600">
        Chọn mục ở thanh bên để quản lý.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/pending-posts"
          className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 hover:bg-amber-50"
        >
          <p className="text-sm font-medium text-gray-900">
            Bài đăng xe chờ duyệt
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Duyệt hoặc từ chối bài đăng xe.
          </p>
        </a>
        <a
          href="/admin/categories"
          className="rounded-2xl border p-5 hover:bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-900">Danh mục</p>
          <p className="mt-1 text-sm text-gray-600">
            Tạo / sửa / xoá loại xe (danh mục).
          </p>
        </a>
        <a
          href="/admin/packages"
          className="rounded-2xl border p-5 hover:bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-900">Quản lý gói</p>
          <p className="mt-1 text-sm text-gray-600">
            Tạo / sửa / xoá gói quản trị.
          </p>
        </a>
        <a
          href="/admin/owners"
          className="rounded-2xl border p-5 hover:bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-900">Quản lý chủ xe</p>
          <p className="mt-1 text-sm text-gray-600">
            Xem nhanh thông tin chủ xe.
          </p>
        </a>
      </div>
    </div>
  );
}
