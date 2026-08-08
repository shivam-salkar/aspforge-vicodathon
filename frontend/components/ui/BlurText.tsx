"use client";

import { motion, TargetAndTransition, Transition } from "framer-motion";
import { useEffect, useRef, useState, useMemo, FC } from "react";

type AnimationStep = Record<string, string | number>;

export interface BlurTextProps {
  /** The text content to animate. */
  text?: string;
  /** Delay between animations for each word/letter (in ms). Default: 200 */
  delay?: number;
  /** Additional CSS class names. */
  className?: string;
  /** Determines whether to animate by 'words' or 'letters'. Default: 'words' */
  animateBy?: "words" | "letters";
  /** Direction from which the words/letters appear ('top' or 'bottom'). Default: 'top' */
  direction?: "top" | "bottom";
  /** Intersection threshold for triggering the animation. Default: 0.1 */
  threshold?: number;
  /** Root margin for the intersection observer. Default: '0px' */
  rootMargin?: string;
  /** Custom initial animation state. */
  animationFrom?: TargetAndTransition;
  /** Custom keyframe step array for animation. */
  animationTo?: AnimationStep[];
  /** Custom easing function. */
  easing?: (t: number) => number;
  /** Callback function triggered when all animations complete. */
  onAnimationComplete?: () => void;
  /** The time taken for each letter/word to animate (in seconds). Default: 0.35 */
  stepDuration?: number;
}

const buildKeyframes = (
  from: TargetAndTransition,
  steps: AnimationStep[]
): Record<string, (string | number)[]> => {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);

  const keyframes: Record<string, (string | number)[]> = {};
  keys.forEach((k) => {
    const fromVal = from[k as keyof TargetAndTransition];
    keyframes[k] = [
      fromVal !== undefined ? (fromVal as string | number) : 0,
      ...steps.map((s) => s[k] ?? 0),
    ];
  });
  return keyframes;
};

export const BlurText: FC<BlurTextProps> = ({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}) => {
  const elements = useMemo(() => {
    return animateBy === "words" ? text.split(" ") : text.split("");
  }, [text, animateBy]);

  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(currentRef);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo<TargetAndTransition>(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo<AnimationStep[]>(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <p
      ref={ref}
      className={`flex flex-wrap ${className}`}
    >
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            key={index}
            className="inline-block will-change-[transform,filter,opacity]"
            initial={fromSnapshot as TargetAndTransition}
            animate={inView ? animateKeyframes : (fromSnapshot as TargetAndTransition)}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
          </motion.span>
        );
      })}
    </p>
  );
};

export default BlurText;
