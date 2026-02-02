import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Tìm xe phù hợp",
      description:
        "Duyệt danh sách xe, lọc theo vị trí, số chỗ, hộp số và mức giá để chọn chiếc xe điện phù hợp.",
    },
    {
      title: "Liên hệ chủ xe",
      description:
        "Chat trên EcoRent hoặc gọi trực tiếp để xác nhận lịch, địa điểm nhận xe và các điều khoản.",
    },
    {
      title: "Nhận xe & trải nghiệm",
      description:
        "Kiểm tra tình trạng xe, giấy tờ, pin và phụ kiện trước khi nhận. Lái xe an toàn và tận hưởng hành trình.",
    },
    {
      title: "Hoàn tất & đánh giá",
      description:
        "Trả xe đúng hẹn, xác nhận chi phí phát sinh (nếu có) và để lại đánh giá để cộng đồng tin cậy hơn.",
    },
  ];

  const faqs = [
    {
      q: "EcoRent có thu phí không?",
      a: "EcoRent là nền tảng môi giới. Phí (nếu có) sẽ được hiển thị rõ trong từng tin đăng hoặc điều khoản thỏa thuận với chủ xe.",
    },
    {
      q: "Tôi cần chuẩn bị gì khi thuê xe?",
      a: "Bạn nên chuẩn bị giấy tờ tùy thân, bằng lái phù hợp, và kiểm tra điều kiện đặt cọc/giới hạn km theo thỏa thuận với chủ xe.",
    },
    {
      q: "Nếu xe gặp sự cố thì sao?",
      a: "Hãy liên hệ ngay với chủ xe qua số điện thoại hoặc chat. Nếu cần hỗ trợ thêm, bạn có thể gửi report trên trang chi tiết xe.",
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold text-foreground">
            How it works
          </h1>
          <p className="mt-3 text-muted-foreground">
            Quy trình thuê xe điện trên EcoRent đơn giản, minh bạch và nhanh
            chóng.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {steps.map((s, idx) => (
              <Card key={s.title}>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {s.title}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-10">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Mẹo nhanh</CardTitle>
              <CardDescription>
                Ưu tiên xác nhận rõ: thời gian nhận/trả, mức pin khi giao xe, chi
                phí sạc, và các khoản phát sinh (nếu có).
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="mt-12">
            <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
            <div className="mt-4 grid gap-4">
              {faqs.map((f) => (
                <Card key={f.q}>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm">{f.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{f.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <Button asChild className="h-11">
              <Link href="/cars">Xem xe đang có</Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link href="/become-renter">Trở thành chủ xe</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
