import { Search, MessageCircle, Handshake } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Tìm xe điện phù hợp",
    description: "Khám phá hàng trăm xe điện đang được chia sẻ tại khu vực của bạn.",
  },
  {
    icon: MessageCircle,
    step: "02",
    title: "Kết nối với chủ xe",
    description: "Xem thông tin chi tiết và trò chuyện trực tiếp với chủ xe, không qua trung gian.",
  },
  {
    icon: Handshake,
    step: "03",
    title: "Thỏa thuận & thuê xe",
    description: "Thống nhất điều khoản thuê linh hoạt, minh bạch theo nhu cầu hai bên.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1572D3]">
            Cách thức hoạt động
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
            Thuê xe điện chỉ 3 bước
          </h2>
        </div>

        {/* Steps grid */}
        <div className="relative mt-12 grid gap-6 md:grid-cols-3 lg:mt-16">

          {/* Connector line */}
          <div className="absolute left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] top-10 hidden h-px border-t border-dashed border-[#1572D3]/30 md:block" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm"
              >
                {/* Step number badge */}
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                    <Icon className="h-7 w-7 text-[#1572D3]" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1572D3] text-[11px] font-black text-white">
                    {step.step}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
