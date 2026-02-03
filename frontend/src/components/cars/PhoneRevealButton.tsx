"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhoneRevealButtonProps {
  phoneNumber: string;
  maskedPhone: string;
}

export function PhoneRevealButton({
  phoneNumber,
  maskedPhone,
}: PhoneRevealButtonProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <Button
      className="h-12 bg-[#1572D3] text-white hover:bg-[#155ed3]"
      onClick={handleReveal}
    >
      <Phone className="mr-2 h-5 w-5" />
      {isRevealed ? phoneNumber : `Hiện số ${maskedPhone}`}
    </Button>
  );
}
