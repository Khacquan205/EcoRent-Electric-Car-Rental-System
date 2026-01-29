import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-128px)] bg-white">
      <div className="container mx-auto px-6 py-14">
        <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Đăng ký</h1>
          <p className="mt-1 text-sm text-gray-600">
            Tạo tài khoản để bắt đầu thuê xe điện nhanh chóng.
          </p>

          <form className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Họ và tên</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="button"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Tạo tài khoản
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Đã có tài khoản? {" "}
            <Link href="/login" className="font-medium text-emerald-700 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
