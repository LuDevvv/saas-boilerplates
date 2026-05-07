import { useEffect, useRef } from "react";
import { animate } from "@motionone/dom";
import heroImage from "@/assets/resorces/hero-screenshot.png";
import { easing, duration } from "@/lib/motion";

interface AuthSidebarProps {
  titleMain: string;
  titleAccent: string;
  subtitle: string;
  imageSrc?: string;
}

export const AuthSidebar = ({ titleMain, titleAccent, subtitle, imageSrc = heroImage }: AuthSidebarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Refs for staggered text animation
  const titleMainRef = useRef<HTMLSpanElement>(null);
  const titleAccentRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const textElements = [titleMainRef.current, titleAccentRef.current, subtitleRef.current].filter(Boolean) as HTMLElement[];
    const imageEl = imageRef.current;
    if (!textElements.length || !imageEl) return;

    // Set initial states before animation
    textElements.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(50px)";
    });
    imageEl.style.opacity = "0";
    imageEl.style.transform = "scale(0.85)";

    // Cinematic text reveal — staggered entrance with deceleration
    const textAnimation = animate(
      textElements,
      { opacity: 1, transform: "translateY(0px)" },
      {
        duration: duration.cinematic,
        easing: easing.entrance,
        delay: (_, i) => 0.1 + i * 0.15,
      }
    );

    // Cinematic image entrance — spatial reveal with gentle deceleration
    const imageAnimation = animate(
      imageEl,
      { opacity: 1, transform: "scale(1)" },
      {
        duration: 1.2,
        easing: easing.entrance,
        delay: 0.4,
      }
    );

    return () => {
      textAnimation.cancel();
      imageAnimation.cancel();
    };
  }, []);

  return (
    <div ref={containerRef} className="hidden lg:flex lg:w-1/2 h-full relative font-geist overflow-hidden bg-[#001D4A]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#002D62] via-[#004080] to-primary flex flex-col items-center justify-center">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary-light/20 blur-[120px]"></div>
          <div className="absolute bottom-[10%] -left-[20%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[100px]"></div>
        </div>

        {/* Centered Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-[800px] px-8 lg:px-12 py-12 m-auto">

          {/* Text Section */}
          <div ref={textRef} className="text-white text-center w-full max-w-xl mx-auto mb-12 shrink-0">
            <h2 className="text-[32px] lg:text-[40px] xl:text-[48px] mb-6 leading-[1.15]  font-semibold flex flex-col items-center justify-center">
              <span ref={titleMainRef} className="block">{titleMain}</span>
              <span ref={titleAccentRef} className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E6E6] to-white block mt-1 pb-1">
                {titleAccent}
              </span>
            </h2>
            <p ref={subtitleRef} className="text-white/80 text-base lg:text-lg leading-relaxed max-w-md mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Image Section */}
          <div className="relative w-full flex justify-center items-center shrink-0">
            <div ref={imageRef} className="relative w-full max-w-[700px] transform-gpu">
              <img
                src={imageSrc}
                alt="Dashboard Mockup"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
