import SectionHeader from "@/components/shared/SectionHeader";
import { FeedbackCard } from "@/components/cards";
import { feedbacks } from "@/lib/data/feedbacks";

const Feedback = () => {
  return (
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

        {/* Feedback Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {feedbacks.map((feedback) => (
            <FeedbackCard key={feedback.name} feedback={feedback} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feedback;
