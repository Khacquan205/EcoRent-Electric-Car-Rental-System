"use client";

import { useRef, useState, useEffect } from "react";
import SectionHeader from "@/components/shared/SectionHeader";
import { FeedbackCard } from "@/components/cards";
import { feedbacks } from "@/lib/data/feedbacks";

// CSS to hide scrollbar
const scrollbarHideStyle = `
  .feedback-scroll::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
`;

const Feedback = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll effect (always running, only pauses when dragging)
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    const scrollSpeed = 1;

    const autoScroll = () => {
      if (!isDragging && scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;

        // Reset to start when reaching end
        if (
          scrollContainer.scrollLeft >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationId);
  }, [isDragging]);

  // Global mouse up listener to stop dragging even when mouse is released outside
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    // Add listener to window to catch mouseup anywhere
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mouseleave", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mouseleave", handleGlobalMouseUp);
    };
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <section className="relative overflow-hidden bg-[#F0F7FF] py-16 lg:py-24">
        {/* Background Quote Marks */}
        <div className="pointer-events-none absolute left-10 top-10 text-[200px] font-serif leading-none text-[#1572D3] opacity-10">
          &ldquo;
        </div>
        <div className="pointer-events-none absolute right-10 top-10 text-[200px] font-serif leading-none text-[#1572D3] opacity-10">
          &rdquo;
        </div>
        <div className="container mx-auto px-6">
          <SectionHeader badge="FEEDBACK" title="What people say about us?" />

          {/* Feedback Horizontal Scroll */}
          <div
            ref={scrollRef}
            className={`feedback-scroll mt-12 flex gap-6 overflow-x-scroll pb-4 select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              scrollBehavior: isDragging ? "auto" : "smooth",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onDragStart={(e) => e.preventDefault()}
            draggable={false}
          >
            {/* Duplicate feedbacks for infinite scroll effect */}
            {[...feedbacks, ...feedbacks].map((feedback, index) => (
              <div
                key={`${feedback.name}-${index}`}
                className="w-[400px] flex-shrink-0 md:w-[500px] select-none"
                draggable={false}
              >
                <FeedbackCard feedback={feedback} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Feedback;
