import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-white to-emerald-50">
        <div className="container mx-auto px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                Nền tảng môi giới thuê xe điện
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
                Thuê xe điện dễ dàng,
                <span className="text-emerald-700"> xanh hơn mỗi chuyến đi</span>
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Kết nối bạn với các đối tác cho thuê xe điện uy tín. Tìm xe phù hợp theo
                địa điểm, thời gian và ngân sách.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-600 px-6 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Đăng nhập
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-gray-600 sm:grid-cols-3">
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-gray-900 font-semibold">Đối tác</p>
                  <p className="mt-1">Đã xác minh</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-gray-900 font-semibold">Xe đa dạng</p>
                  <p className="mt-1">Nhiều phân khúc</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-gray-900 font-semibold">Hỗ trợ</p>
                  <p className="mt-1">Nhanh chóng</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Tìm xe nhanh</h2>
              <p className="mt-1 text-sm text-gray-600">
                Nhập thông tin để bắt đầu tìm xe điện phù hợp.
              </p>

              <form className="mt-6 grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Địa điểm</label>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="VD: Hồ Chí Minh"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nhận xe</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trả xe</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Tìm xe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Xe nổi bật</h2>
            <p className="mt-1 text-gray-600">
              Một vài lựa chọn phổ biến (UI demo, chưa nối dữ liệu).
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline">
            Xem tất cả
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "VinFast VF e34", meta: "SUV • 5 chỗ • Tự động", price: "Từ 700k/ngày" },
            { name: "Wuling Mini EV", meta: "Mini • 4 chỗ • Tự động", price: "Từ 450k/ngày" },
            { name: "VinFast VF 5", meta: "Crossover • 5 chỗ • Tự động", price: "Từ 650k/ngày" },
          ].map((item) => (
            <div key={item.name} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="aspect-[16/9] w-full rounded-xl bg-gradient-to-br from-emerald-100 to-sky-100" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{item.meta}</p>
              <p className="mt-4 text-sm font-semibold text-emerald-700">{item.price}</p>
              <button
                type="button"
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md border border-emerald-600 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
