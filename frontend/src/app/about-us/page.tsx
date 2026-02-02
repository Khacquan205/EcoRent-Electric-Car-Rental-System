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

export default function AboutUsPage() {
  const values = [
    {
      title: "Minh bạch",
      description:
        "Thông tin xe, giá tham khảo và điều khoản đều được hiển thị rõ ràng để bạn dễ ra quyết định.",
    },
    {
      title: "An toàn",
      description:
        "Khuyến nghị xác minh danh tính và cung cấp kênh report để giảm rủi ro trong giao dịch.",
    },
    {
      title: "Trải nghiệm tốt",
      description:
        "Giao diện tối giản, tốc độ nhanh, và luồng thao tác rõ ràng giúp bạn thuê xe dễ dàng.",
    },
  ];

  const stats = [
    { label: "Xe đang hiển thị", value: "100+" },
    { label: "Chủ xe tham gia", value: "50+" },
    { label: "Lượt xem mỗi tháng", value: "10k+" },
    { label: "Tỉ lệ phản hồi", value: "95%" },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                About us
              </h1>
              <p className="mt-4 text-muted-foreground">
                EcoRent là nền tảng môi giới thuê xe điện, giúp bạn tìm kiếm, so
                sánh và liên hệ chủ xe nhanh chóng. Chúng tôi tập trung vào minh
                bạch thông tin và trải nghiệm người dùng.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {stats.map((s) => (
                  <Card key={s.label}>
                    <CardContent>
                      <p className="text-2xl font-semibold text-foreground">
                        {s.value}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {s.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="h-11">
                  <Link href="/cars">Khám phá xe</Link>
                </Button>
                <Button asChild variant="outline" className="h-11">
                  <Link href="/how-it-works">Xem cách hoạt động</Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">EcoRent</CardTitle>
                <CardDescription>
                  Ảnh minh hoạ. Nội dung có thể thay đổi theo từng khu vực.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1619767886558-efdc259cde1d?auto=format&fit=crop&w=1600&q=80"
                    alt="Electric car"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-14">
            <h2 className="text-xl font-semibold text-foreground">
              Giá trị cốt lõi
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {values.map((v) => (
                <Card key={v.title}>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm">{v.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {v.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mt-14">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Liên hệ</CardTitle>
              <CardDescription>
                Nếu bạn có góp ý hoặc cần hỗ trợ, vui lòng liên hệ qua email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                support@ecorent.local
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
