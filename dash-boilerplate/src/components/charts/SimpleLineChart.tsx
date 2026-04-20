import { FC, useState, useEffect, useRef } from "react";

export const SimpleLineChart: FC<{
  data: number[];
  labels: string[];
  color: string;
  isMobile: boolean;
  dark?: boolean;
  valueLabel?: string;
}> = ({
  data,
  labels,
  color,
  isMobile,
  dark = false,
  valueLabel = "visitas",
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Scroll container ref for mobile
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Measure container size in real-time
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Auto-scroll to end on mount if mobile
  useEffect(() => {
    if (isMobile && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
    }
  }, [isMobile, data]);

  if (!data || data.length < 2) {
    return (
      <div
        ref={containerRef}
        className="w-full relative mt-4 z-20 h-full min-h-[300px]"
      />
    );
  }

  // Determine render width: if mobile, enforce a minimum width per data point to ensure readability
  const minWidthPerPoint = 40;
  const computedMobileWidth = data.length * minWidthPerPoint;

  // If mobile, we use the computed width, else we use the observed container width
  const chartRenderWidth = isMobile
    ? Math.max(dimensions.width, computedMobileWidth)
    : dimensions.width;
  const chartRenderHeight = dimensions.height;

  // VISUAL CONFIGURATION
  const config = isMobile
    ? {
        strokeWidth: 3,
        dotRadius: 5,
        hoverDotRadius: 8,
        fontSizeX: 10,
        fontSizeTooltipValue: 20, // Smaller font
        fontSizeTooltipLabel: 12,
        tooltipHeight: 50, // Smaller minimalist box
        tooltipWidth: 80,
        tooltipRadius: 12,
        paddingX: 10, // Reduced padding
        paddingY: 30, // Adjusted padding
      }
    : {
        strokeWidth: 2,
        dotRadius: 4,
        hoverDotRadius: 6,
        fontSizeX: 11,
        fontSizeTooltipValue: 24,
        fontSizeTooltipLabel: 15,
        tooltipHeight: 85,
        tooltipWidth: 140,
        tooltipRadius: 10,
        paddingX: 50,
        paddingY: 40,
      };

  const chartHeight = Math.max(0, chartRenderHeight - config.paddingY * 2);
  const chartWidth = Math.max(0, chartRenderWidth - config.paddingX * 2);

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Generate ticks
  const ticks = [
    max,
    min + range * 0.75,
    min + range * 0.5,
    min + range * 0.25,
    min,
  ];

  // Calculate generic points
  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * chartWidth + config.paddingX;
      const y =
        chartRenderHeight -
        config.paddingY -
        ((val - min) / range) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  // Create area fill path (closed loop)
  const firstX = config.paddingX;
  const lastX = chartWidth + config.paddingX;
  const areaPath = `${points} L ${lastX},${
    chartRenderHeight - config.paddingY
  } L ${firstX},${chartRenderHeight - config.paddingY} Z`;

  // --- Helper to calculate tooltip data for the currently hovered index ---
  const getTooltipData = (index: number) => {
    const val = data[index] ?? 0;
    const x = (index / (data.length - 1)) * chartWidth + config.paddingX;
    const y =
      chartRenderHeight - config.paddingY - ((val - min) / range) * chartHeight;
    const label = labels[index];
    return { x, y, val, label };
  };

  return (
    <div ref={containerRef} className="w-full h-full relative z-20">
      {/* Scrollable Container for Mobile */}
      <div
        ref={scrollContainerRef}
        className={`w-full h-full ${
          isMobile
            ? "overflow-x-auto no-scrollbar touch-pan-x"
            : "overflow-hidden"
        }`}
        style={{ position: "relative" }}
      >
        {dimensions.width > 0 && dimensions.height > 0 && (
          <>
            <div className="absolute top-0 left-0 h-full w-full pointer-events-none sticky-axis-container">
              {ticks.map((tick, i) => {
                const percentage = (tick - min) / range;
                const topPixel =
                  chartRenderHeight -
                  config.paddingY -
                  percentage * chartHeight;

                if (isMobile && i !== 0 && i !== 4) return null;

                return (
                  <div
                    key={i}
                    className={`absolute left-0 font-bold text-right transform -translate-y-1/2 z-10 
                                            ${
                                              isMobile
                                                ? "text-[9px] min-w-[20px] px-0.5 rounded backdrop-blur-sm"
                                                : "text-[10px] w-[40px]"
                                            }
                                        `}
                    style={{
                      top: `${topPixel}px`,
                      left: isMobile ? 2 : 0,
                      color: dark ? "rgba(196,181,253,0.6)" : undefined,
                      background: isMobile
                        ? dark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.8)"
                        : undefined,
                    }}
                  >
                    {Math.round(tick)}
                  </div>
                );
              })}
            </div>

            {/* SVG Chart */}
            <svg
              width={chartRenderWidth}
              height={chartRenderHeight}
              viewBox={`0 0 ${chartRenderWidth} ${chartRenderHeight}`}
              className="overflow-visible"
              style={{ minWidth: isMobile ? computedMobileWidth : "100%" }}
              onClick={() => {
                if (isMobile) setHoveredIndex(null);
              }} // Click outside to clear
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {ticks.map((tick, i) => {
                const y =
                  chartRenderHeight -
                  config.paddingY -
                  ((tick - min) / range) * chartHeight;
                return (
                  <line
                    key={i}
                    x1={config.paddingX}
                    y1={y}
                    x2={chartRenderWidth - config.paddingX}
                    y2={y}
                    stroke={dark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}
                    strokeWidth={isMobile ? 2 : 1}
                    strokeDasharray="6 6"
                  />
                );
              })}

              {/* Area Fill */}
              <path
                d={"M " + areaPath}
                fill="url(#chartGradient)"
                stroke="none"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke={color}
                strokeWidth={config.strokeWidth}
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />

              {/* Interaction Areas & Tooltip Logic */}
              {data.map((val, index) => {
                const x =
                  (index / (data.length - 1)) * chartWidth + config.paddingX;
                const y =
                  chartRenderHeight -
                  config.paddingY -
                  ((val - min) / range) * chartHeight;
                const isHovered = hoveredIndex === index;

                return (
                  <g
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredIndex(index);
                    }}
                  >
                    <rect
                      x={
                        index === 0 ? 0 : x - chartWidth / (data.length - 1) / 2
                      }
                      y={0}
                      width={chartWidth / (data.length - 1)}
                      height={chartRenderHeight}
                      fill="transparent"
                      onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                      onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                      className="cursor-pointer"
                    />

                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? config.hoverDotRadius : config.dotRadius}
                      fill="white"
                      stroke={color}
                      strokeWidth={isMobile ? 3 : 2}
                      className="transition-all duration-200 pointer-events-none"
                    />
                    {/* optimized labels rendering */}
                    {(() => {
                      // Show max ~8 labels on desktop, ~4 on mobile
                      const maxLabels = isMobile ? 4 : 8;
                      const step = Math.ceil(data.length / maxLabels);
                      const shouldShow = index % step === 0; // Always show first? index 0 is first.

                      // Always show last one if it's not too close to the previous one
                      // But simplified logic: just modulo step.

                      if (!shouldShow) return null;

                      return (
                        <text
                          x={x}
                          y={chartRenderHeight - 5}
                          textAnchor="middle"
                          fill={dark ? "rgba(196,181,253,0.7)" : "#9ca3af"}
                          fontSize={config.fontSizeX}
                          fontWeight="600"
                          className="select-none"
                          style={{ fontFamily: "sans-serif" }}
                        >
                          {labels[index]}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}

              {/* Hover Line */}
              {hoveredIndex !== null && (
                <line
                  x1={getTooltipData(hoveredIndex).x}
                  y1={chartRenderHeight - config.paddingY}
                  x2={getTooltipData(hoveredIndex).x}
                  y2={config.paddingY}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  pointerEvents="none"
                />
              )}

              {/* Tooltip */}
              {hoveredIndex !== null &&
                (() => {
                  const { x, y, val, label } = getTooltipData(hoveredIndex);

                  const tooltipW = isMobile ? 80 : 110;
                  const tooltipH = isMobile ? 64 : 72;
                  const tooltipY = Math.max(config.paddingY, y - tooltipH - 14);

                  // Clamp X
                  let tooltipX = x - tooltipW / 2;
                  if (tooltipX < config.paddingX) tooltipX = config.paddingX;
                  if (tooltipX + tooltipW > chartRenderWidth - config.paddingX)
                    tooltipX = chartRenderWidth - config.paddingX - tooltipW;

                  const cx = tooltipX + tooltipW / 2;

                  // Triangle tip pointing down at the dot
                  const triSize = 6;
                  const triY = tooltipY + tooltipH;
                  const triPoints = `${cx - triSize},${triY} ${
                    cx + triSize
                  },${triY} ${cx},${triY + triSize}`;

                  return (
                    <g
                      pointerEvents="none"
                      style={{
                        filter: "drop-shadow(0px 6px 16px rgba(0,0,0,0.12))",
                      }}
                    >
                      {/* Box */}
                      <rect
                        x={tooltipX}
                        y={tooltipY}
                        width={tooltipW}
                        height={tooltipH}
                        rx={12}
                        fill={dark ? "rgba(30,20,60,0.92)" : "#fff"}
                        stroke={dark ? "rgba(167,139,250,0.3)" : "#ede9fe"}
                        strokeWidth={1.5}
                      />
                      {/* Triangle */}
                      <polygon
                        points={triPoints}
                        fill={dark ? "rgba(30,20,60,0.92)" : "#fff"}
                      />
                      {/* Label line */}
                      <text
                        x={cx}
                        y={tooltipY + (isMobile ? 17 : 20)}
                        textAnchor="middle"
                        fill={dark ? "rgba(196,181,253,0.8)" : "#8B5CF6"}
                        fontSize={isMobile ? 9 : 11}
                        fontWeight="700"
                        style={{ fontFamily: "sans-serif" }}
                      >
                        {label}
                      </text>
                      {/* Value */}
                      <text
                        x={cx}
                        y={tooltipY + (isMobile ? 38 : 46)}
                        textAnchor="middle"
                        fill={dark ? "#fff" : "#111827"}
                        fontSize={isMobile ? 16 : 20}
                        fontWeight="900"
                        style={{ fontFamily: "sans-serif" }}
                      >
                        {val}
                      </text>
                      {/* Unit label */}
                      <text
                        x={cx}
                        y={tooltipY + (isMobile ? 54 : 64)}
                        textAnchor="middle"
                        fill={dark ? "rgba(196,181,253,0.6)" : "#9CA3AF"}
                        fontSize={isMobile ? 8 : 10}
                        fontWeight="600"
                        style={{ fontFamily: "sans-serif" }}
                      >
                        {valueLabel}
                      </text>
                    </g>
                  );
                })()}
            </svg>
          </>
        )}
      </div>
    </div>
  );
};
