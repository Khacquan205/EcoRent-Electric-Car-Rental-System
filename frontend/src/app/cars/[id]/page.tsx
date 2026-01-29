import Image from "next/image";
import Link from "next/link";
import { getCarById, formatVnd } from "@/lib/mockCars";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = getCarById(id);

  if (!car) {
    return (
      <div className="container mx-auto px-6 py-14">
        <h1 className="text-2xl font-semibold text-gray-900">Không tìm thấy xe</h1>
        <p className="mt-2 text-gray-600">Xe bạn tìm không tồn tại trong mock data.</p>
        <Link href="/cars" className="mt-6 inline-block text-emerald-700 hover:underline">
          Quay lại danh sách xe
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-10">
        <Link href="/cars" className="text-sm font-medium text-emerald-700 hover:underline">
          ← Quay lại
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                <Image
                  src={car.images[0]}
                  alt={car.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
              <h1 className="mt-5 text-3xl font-semibold text-gray-900">{car.name}</h1>
              <p className="mt-1 text-gray-600">
                {car.location} • {car.seats} chỗ • {car.transmission} • {car.rangeKm} km
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {car.features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                <p className="text-sm text-gray-700">Giá tham khảo</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">
                  {formatVnd(car.pricePerDay)} / ngày
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  *EcoWheels là nền tảng môi giới. Giao dịch/thoả thuận sẽ làm việc trực tiếp với chủ xe.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Đánh giá</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {car.ratingAvg} / 5 • {car.reviewCount} lượt
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {car.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{r.authorName}</p>
                      <p className="text-xs text-gray-500">{r.createdAt}</p>
                    </div>
                    <p className="mt-1 text-sm text-emerald-700">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                    <p className="mt-2 text-sm text-gray-700">{r.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Report</h2>
              <p className="mt-1 text-sm text-gray-600">
                Báo cáo tin đăng nếu bạn thấy có dấu hiệu lừa đảo hoặc thông tin không chính xác.
              </p>

              <form className="mt-6 grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Lý do</label>
                  <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Thông tin sai lệch</option>
                    <option>Nghi ngờ lừa đảo</option>
                    <option>Trùng lặp tin đăng</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Mô tả thêm</label>
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Mô tả ngắn gọn..."
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-6 text-sm font-medium text-white hover:bg-red-700"
                >
                  Gửi report
                </button>
              </form>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Liên hệ chủ xe</h2>
              <p className="mt-1 text-sm text-gray-600">
                Bạn có thể chat qua website hoặc gọi trực tiếp.
              </p>

              <div className="mt-5 rounded-xl border p-4">
                <p className="text-sm font-medium text-gray-900">{car.owner.name}</p>
                <p className="mt-1 text-sm text-gray-600">{car.owner.location}</p>
                <p className="mt-2 text-xs text-gray-500">Phản hồi: {car.owner.responseRate}</p>
              </div>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Chat trên EcoWheels
                </button>
                <a
                  href={`tel:${car.owner.phone.replace(/\s/g, "")}`}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-600 px-4 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Gọi: {car.owner.phone}
                </a>
              </div>

              <div className="mt-6 rounded-xl bg-sky-50 p-4">
                <p className="text-xs text-sky-900">
                  Lưu ý: Không chuyển khoản đặt cọc khi chưa xác minh danh tính chủ xe.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
