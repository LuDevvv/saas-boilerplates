import { useEffect, useRef } from "react";
import gsap from "gsap";
import heroImage from "@/assets/resorces/hero-screenshot.png";

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
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Advanced Text Reveal (3D Flip Stagger)
      gsap.set([titleMainRef.current, titleAccentRef.current, subtitleRef.current], { 
        y: 50, 
        opacity: 0,
        rotationX: -45,
        transformOrigin: "50% 100%"
      });

      tl.to([titleMainRef.current, titleAccentRef.current, subtitleRef.current], {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.1
      });

      // Advanced Image Entrance (3D Spatial Reveal)
      gsap.set(imageRef.current, {
        opacity: 0,
        scale: 0.85,
        rotationX: 15,
        rotationY: -10,
        z: -100,
        transformOrigin: "center center"
      });

      tl.to(imageRef.current, {
        opacity: 1,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        z: 0,
        duration: 1.8,
        ease: "expo.out",
      }, "-=0.8"); // Starts smoothly while text is still entering

    }, containerRef);

    return () => ctx.revert();
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
          
          {/* Text Section with perspective for 3D rotation */}
          <div ref={textRef} style={{ perspective: "1000px" }} className="text-white text-center w-full max-w-xl mx-auto mb-12 shrink-0">
            <h2 className="text-[32px] lg:text-[40px] xl:text-[48px] mb-6 leading-[1.15] tracking-tight font-semibold flex flex-col items-center justify-center">
              <span ref={titleMainRef} className="block">{titleMain}</span>
              <span ref={titleAccentRef} className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E6E6] to-white block mt-1 pb-1">
                {titleAccent}
              </span>
            </h2>
            <p ref={subtitleRef} className="text-white/80 text-base lg:text-lg leading-relaxed max-w-md mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Image Section with perspective for 3D reveal */}
          <div style={{ perspective: "1000px" }} className="relative w-full flex justify-center items-center shrink-0">
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
