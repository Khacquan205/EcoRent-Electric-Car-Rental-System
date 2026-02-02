import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CarNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold text-[#1572D3]">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-[#242424]">
        Car Not Found
      </h2>
      <p className="mt-2 text-center text-[#747474]">
        The car you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link href="/" className="mt-6">
        <Button className="bg-[#1572D3] text-white hover:bg-[#1260B0]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
