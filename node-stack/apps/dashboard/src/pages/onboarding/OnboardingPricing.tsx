import React from "react";
import Pricing from "../payments/Pricing";

const OnboardingPricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-canvas pt-12 px-6">
      <div className="max-w-6xl mx-auto">
        <Pricing isOnboarding={true} />
        
        {/* Progress indicator */}
        <div className="mt-10 pb-12 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="w-8 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPricing;
