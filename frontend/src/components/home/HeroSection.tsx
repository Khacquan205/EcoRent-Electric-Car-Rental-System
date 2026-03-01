"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search, Zap, Users } from "lucide-react";

const EV_IMAGE_URL =
  "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1400&auto=format&fit=crop";

const carTypes = ["Tất cả xe", "Sedan", "SUV", "Hatchback", "MPV", "Pickup"];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background: faded brand watermark (reference-inspired depth) */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none text-[220px] font-black leading-none text-slate-100 lg:text-[300px]"
        aria-hidden="true"
      >
        EV
      </div>

      {/* Ambient glow — right */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-blue-50 blur-3xl" />

      <div className="container mx-auto px-6 py-14 lg:px-12 lg:py-20 xl:px-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">

          {/* ── Left column ── */}
          <div className="max-w-xl">

            {/* Eyebrow */}
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#1572D3]">
              <Zap className="h-4 w-4" />
              Nền tảng xe điện P2P
            </p>

            {/* Headline — bold, reference-scale */}
            <h1 className="mt-4 text-5xl font-black leading-[1.08] tracking-tight text-slate-900 md:text-6xl lg:text-[4rem]">
              Tìm xe điện,
              <br />
              <span className="text-[#1572D3]">Kết nối</span> chủ xe,
              <br />
              Thuê đúng giá.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-500">
              Cộng đồng cho thuê xe điện P2P đầu tiên tại Việt Nam — không trung gian, không định giá cứng, chỉ có kết nối thực.
            </p>

            {/* Search bar */}
            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_2px_20px_rgba(21,114,211,0.10)] ring-1 ring-slate-100">
              <div className="flex flex-col divide-y divide-slate-100 sm:flex-row sm:divide-x sm:divide-y-0">

                <div className="flex flex-1 items-center gap-3 px-5 py-4">
                  <MapPin className="h-4 w-4 shrink-0 text-[#1572D3]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1572D3]">
                      Khu vực
                    </p>
                    <input
                      type="text"
                      placeholder="Thành phố, quận/huyện..."
                      className="mt-0.5 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-5 py-4 sm:min-w-[160px]">
                  <Zap className="h-4 w-4 shrink-0 text-[#1572D3]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1572D3]">
                      Loại xe
                    </p>
                    <select className="mt-0.5 w-full bg-transparent text-sm text-slate-800 outline-none">
                      {carTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-2">
                  <Link href="/cars" className="block h-full">
                    <button className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-[#1572D3] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#1260B0] hover:shadow-md active:scale-[0.98] sm:w-auto">
                      <Search className="h-4 w-4" />
                      Tìm xe
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Social proof chips — reference-inspired */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
                <span className="text-xl font-black text-[#1572D3]">500+</span>
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                    Xe điện
                  </p>
                  <p className="text-[10px] text-slate-400">đang cho thuê</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
                <Users className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                    1.200+ chủ xe
                  </p>
                  <p className="text-[10px] text-slate-400">đã đăng ký</p>
                </div>
              </div>

              <Link
                href="/become-a-renter"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#1572D3] transition-colors hover:text-[#1260B0]"
              >
                Đăng xe của bạn
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ── Right column — prominent EV visual ── */}
          <div className="relative flex items-center justify-center lg:justify-end">

            {/* Soft backdrop glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[400px] w-[400px] rounded-full bg-sky-100/60 blur-3xl" />
            </div>

            {/* Car image */}
            <div className="relative z-10 w-full max-w-[560px] transition-transform duration-700 ease-out hover:-translate-y-2">
              <Image
                src={EV_IMAGE_URL}
                alt="Electric Vehicle"
                width={700}
                height={467}
                className="h-auto w-full rounded-2xl object-cover shadow-xl"
                priority
              />

              {/* Price pill */}
              <div className="absolute -bottom-3 right-4 hidden items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md lg:flex">
                <span className="text-xs font-semibold text-slate-700">
                  Từ 1.5M₫/ngày
                </span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-xs font-semibold text-amber-500">
                  4.9★
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
