import {
  MessageCircle,
  ShieldCheck,
  BadgeDollarSign,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BadgeDollarSign,
    title: "Giá thỏa thuận linh hoạt",
    description:
      "Không có mức giá cố định. Người thuê và chủ xe tự thỏa thuận điều khoản phù hợp với cả hai bên.",
  },
  {
    icon: MessageCircle,
    title: "Kết nối trực tiếp với chủ xe",
    description:
      "Nhắn tin và hỏi đáp trực tiếp với chủ xe trước khi quyết định — không qua trung gian.",
  },
  {
    icon: ShieldCheck,
    title: "Danh sách xe đã được xác thực",
    description:
      "Mỗi chủ xe được xác minh thông tin và mỗi tin đăng đều được kiểm duyệt để đảm bảo tính xác thực.",
  },
  {
    icon: Users,
    title: "Cộng đồng thuê xe uy tín",
    description:
      "Hàng nghìn chủ xe và người thuê đã kết nối thành công. Hệ thống đánh giá minh bạch giúp bạn chọn lựa đúng.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1572D3]">
            Vì sao chọn EcoRent
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
            Nền tảng kết nối chủ xe &amp; người thuê
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
            EcoRent không đặt xe thay bạn — chúng tôi tạo không gian để bạn tìm đúng xe, nói chuyện đúng chủ xe, và thỏa thuận theo cách của bạn.
          </p>
        </div>

        {/* Features 2×2 grid — reference-style card layout */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1572D3]/20 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-[#1572D3]">
                  <Icon className="h-6 w-6 text-[#1572D3] transition-colors group-hover:text-white" />
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
