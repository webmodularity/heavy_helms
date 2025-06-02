import { type VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const retroCarouselVariants = cva("relative w-full pixel-perfect", {
  variants: {
    variant: {
      battle: "max-w-full",
      warrior: "max-w-full",
      default: "max-w-full",
    },
    size: {
      sm: "",
      default: "",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const retroCarouselContainerVariants = cva(
  "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide items-start overscroll-x-contain",
  {
    variants: {
      variant: {
        battle: "gap-3 pb-2",
        warrior: "gap-4 pb-3 pt-1 px-[10%]",
        default: "gap-3 pb-2",
      },
      itemWidth: {
        narrow: "[&>*]:w-[75%] sm:[&>*]:w-[50%] lg:[&>*]:w-[33%]",
        medium: "[&>*]:w-[80%] sm:[&>*]:w-[60%] lg:[&>*]:w-[40%]",
        wide: "[&>*]:w-[85%] sm:[&>*]:w-[60%] lg:[&>*]:w-[45%]",
        full: "[&>*]:w-[90%] sm:[&>*]:w-[70%] lg:[&>*]:w-[50%]",
      },
    },
    defaultVariants: {
      variant: "default",
      itemWidth: "wide",
    },
  },
);

const retroCarouselItemVariants = cva(
  "flex-shrink-0 snap-center transition-all duration-300",
  {
    variants: {
      variant: {
        battle: "",
        warrior:
          "scale-95 opacity-85 data-[active=true]:scale-105 data-[active=true]:opacity-100 data-[active=true]:z-10",
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface RetroCarouselProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof retroCarouselVariants> {
  items: React.ReactNode[];
  itemWidth?: "narrow" | "medium" | "wide" | "full";
  showNavigation?: boolean;
  showDots?: boolean;
  autoSelect?: boolean;
  onActiveIndexChange?: (index: number) => void;
  onItemIntersect?: (index: number, isIntersecting: boolean) => void;
  animationDelay?: number;
  loading?: boolean;
}

const RetroCarousel = React.forwardRef<HTMLDivElement, RetroCarouselProps>(
  (
    {
      className,
      variant,
      size,
      itemWidth = "wide",
      items,
      showNavigation = false,
      showDots = true,
      autoSelect = false,
      onActiveIndexChange,
      onItemIntersect,
      animationDelay = 0,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Update scroll indicators
    const updateScrollIndicators = useCallback(() => {
      if (!scrollContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }, []);

    // Handle scroll events
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const handleScroll = () => {
        updateScrollIndicators();

        // Update current index based on scroll position
        const cardWidthPercent =
          itemWidth === "narrow"
            ? 0.75
            : itemWidth === "medium"
              ? 0.8
              : itemWidth === "wide"
                ? 0.85
                : 0.9;
        const cardWidth = container.clientWidth * cardWidthPercent;
        const newIndex = Math.round(container.scrollLeft / cardWidth);
        const clampedIndex = Math.min(newIndex, items.length - 1);

        if (clampedIndex !== activeIndex) {
          setActiveIndex(clampedIndex);
          onActiveIndexChange?.(clampedIndex);
        }
      };

      container.addEventListener("scroll", handleScroll);
      updateScrollIndicators();

      return () => container.removeEventListener("scroll", handleScroll);
    }, [
      updateScrollIndicators,
      items.length,
      itemWidth,
      activeIndex,
      onActiveIndexChange,
    ]);

    // Intersection Observer for auto-selection
    useEffect(() => {
      if (
        !autoSelect ||
        loading ||
        !scrollContainerRef.current ||
        items.length <= 1
      ) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              const elementNode = entry.target as HTMLElement;
              const index = Array.from(
                scrollContainerRef.current?.children ?? [],
              ).indexOf(elementNode);

              if (index !== -1 && index !== activeIndex) {
                setActiveIndex(index);
                onActiveIndexChange?.(index);
                onItemIntersect?.(index, true);
              }
            } else {
              const elementNode = entry.target as HTMLElement;
              const index = Array.from(
                scrollContainerRef.current?.children ?? [],
              ).indexOf(elementNode);

              if (index !== -1) {
                onItemIntersect?.(index, false);
              }
            }
          }
        },
        {
          root: scrollContainerRef.current,
          threshold: 0.5,
        },
      );

      const children = scrollContainerRef.current.children;
      for (let i = 0; i < children.length; i++) {
        observer.observe(children[i]);
      }

      return () => {
        for (let i = 0; i < children.length; i++) {
          observer.unobserve(children[i]);
        }
        observer.disconnect();
      };
    }, [
      autoSelect,
      loading,
      items.length,
      activeIndex,
      onActiveIndexChange,
      onItemIntersect,
    ]);

    // Scroll to specific item
    const scrollToItem = useCallback(
      (index: number) => {
        if (!scrollContainerRef.current) return;

        const cardWidthPercent =
          itemWidth === "narrow"
            ? 0.75
            : itemWidth === "medium"
              ? 0.8
              : itemWidth === "wide"
                ? 0.85
                : 0.9;
        const cardWidth =
          scrollContainerRef.current.clientWidth * cardWidthPercent;
        const scrollLeft = index * cardWidth;

        scrollContainerRef.current.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      },
      [itemWidth],
    );

    // Navigation handlers
    const scrollLeft = useCallback(() => {
      const newIndex = Math.max(activeIndex - 1, 0);
      scrollToItem(newIndex);
    }, [activeIndex, scrollToItem]);

    const scrollRight = useCallback(() => {
      const newIndex = Math.min(activeIndex + 1, items.length - 1);
      scrollToItem(newIndex);
    }, [activeIndex, scrollToItem, items.length]);

    const handleDotClick = useCallback(
      (index: number) => {
        scrollToItem(index);
      },
      [scrollToItem],
    );

    if (loading) {
      return (
        <div
          className={cn(retroCarouselVariants({ variant, size }), className)}
          ref={ref}
          {...props}
        >
          <div className="flex justify-center items-center p-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      );
    }

    return (
      <motion.div
        className={cn(retroCarouselVariants({ variant, size }), className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: animationDelay }}
        ref={ref}
        {...props}
      >
        {/* Navigation Arrows */}
        {showNavigation && items.length > 1 && (
          <>
            <motion.button
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 bg-card/80 border border-primary/30 rounded-pixel-md backdrop-blur-sm transition-all duration-200",
                canScrollLeft
                  ? "text-primary hover:bg-primary/20 hover:border-primary/50 retro-glow"
                  : "text-primary/30 cursor-not-allowed",
              )}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: animationDelay + 0.4 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>

            <motion.button
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 bg-card/80 border border-primary/30 rounded-pixel-md backdrop-blur-sm transition-all duration-200",
                canScrollRight
                  ? "text-primary hover:bg-primary/20 hover:border-primary/50 retro-glow"
                  : "text-primary/30 cursor-not-allowed",
              )}
              onClick={scrollRight}
              disabled={!canScrollRight}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: animationDelay + 0.4 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </>
        )}

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            retroCarouselContainerVariants({ variant, itemWidth }),
            "scrollbar-none",
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(retroCarouselItemVariants({ variant }))}
              data-active={index === activeIndex}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        {showDots && items.length > 1 && (
          <motion.div
            className="flex justify-center gap-1.5 mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: animationDelay + 0.5 }}
          >
            {items.map((_, index) => (
              <button
                type="button"
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-pixel transition-all duration-200",
                  index === activeIndex
                    ? variant === "warrior"
                      ? "bg-yellow-400 retro-glow"
                      : "bg-primary retro-glow"
                    : variant === "warrior"
                      ? "bg-gray-600 hover:bg-yellow-400/50"
                      : "bg-primary/30 hover:bg-primary/50",
                )}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  },
);

RetroCarousel.displayName = "RetroCarousel";

export { RetroCarousel, retroCarouselVariants };
