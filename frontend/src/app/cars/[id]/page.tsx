import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <div className="bg-background">
        <div className="container mx-auto px-6 py-14">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Không tìm thấy xe</CardTitle>
              <CardDescription>
                Xe bạn tìm không tồn tại trong mock data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="px-0">
                <Link href="/cars">Quay lại danh sách xe</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-6 py-10">
        <Button asChild variant="link" className="px-0">
          <Link href="/cars">← Quay lại</Link>
        </Button>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
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

                <h1 className="mt-5 text-3xl font-semibold">{car.name}</h1>
                <p className="mt-1 text-muted-foreground">
                  {car.location} • {car.seats} chỗ • {car.transmission} • {car.rangeKm} km
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {car.features.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Giá tham khảo</p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {formatVnd(car.pricePerDay)} / ngày
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    *EcoWheels là nền tảng môi giới. Giao dịch/thoả thuận sẽ làm việc trực tiếp với chủ xe.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl">Đánh giá</CardTitle>
                <CardDescription>
                  {car.ratingAvg} / 5 • {car.reviewCount} lượt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {car.reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{r.authorName}</p>
                        <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                      </div>
                      <p className="mt-1 text-sm text-primary">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{r.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl">Report</CardTitle>
                <CardDescription>
                  Báo cáo tin đăng nếu bạn thấy có dấu hiệu lừa đảo hoặc thông tin không chính xác.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="reportReason" className="text-sm font-medium">
                      Lý do
                    </label>
                    <Select>
                      <SelectTrigger id="reportReason" className="w-full">
                        <SelectValue placeholder="Chọn lý do" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wrong-info">Thông tin sai lệch</SelectItem>
                        <SelectItem value="scam">Nghi ngờ lừa đảo</SelectItem>
                        <SelectItem value="duplicate">Trùng lặp tin đăng</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="reportNote" className="text-sm font-medium">
                      Mô tả thêm
                    </label>
                    <Textarea id="reportNote" rows={4} placeholder="Mô tả ngắn gọn..." />
                  </div>

                  <Button type="button" variant="destructive" className="h-10">
                    Gửi report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Liên hệ chủ xe</CardTitle>
                <CardDescription>
                  Bạn có thể chat qua website hoặc gọi trực tiếp.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-sm font-medium">{car.owner.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{car.owner.location}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Phản hồi: {car.owner.responseRate}
                  </p>
                </div>

                <div className="mt-4 grid gap-3">
                  <Button type="button" className="h-11">
                    Chat trên EcoWheels
                  </Button>
                  <Button asChild type="button" variant="outline" className="h-11">
                    <a href={`tel:${car.owner.phone.replace(/\s/g, "")}`}>
                      Gọi: {car.owner.phone}
                    </a>
                  </Button>
                </div>

                <div className="mt-6 rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">
                    Lưu ý: Không chuyển khoản đặt cọc khi chưa xác minh danh tính chủ xe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
