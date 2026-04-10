import { useRef } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import type { Meal } from "../types/meal";

const FLY_OUT_X = 600;
const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 0.5;
const TAP_THRESHOLD = 6;

interface SwipeCardProps {
  meal: Meal;
  onSwipe: (direction: "left" | "right") => void;
  onTap?: (meal: Meal) => void;
  isTop: boolean;
  stackIndex: number;
}

export default function SwipeCard({
  meal,
  onSwipe,
  onTap,
  isTop,
  stackIndex,
}: SwipeCardProps) {
  const gone = useRef(false);
  const hasDragged = useRef(false);

  const [style, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    scale: 1 - stackIndex * 0.05,
    y: stackIndex * 10,
    opacity: 1,
    config: { tension: 300, friction: 25 },
  }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx], velocity: [vx] }) => {
      if (gone.current) return;

      if (active && Math.abs(mx) > TAP_THRESHOLD) {
        hasDragged.current = true;
      }

      const trigger =
        Math.abs(mx) > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD;

      if (!active && trigger && hasDragged.current) {
        gone.current = true;
        const dir = mx > 0 ? "right" : "left";
        const flyX = dx > 0 ? FLY_OUT_X : -FLY_OUT_X;

        api.start({
          x: flyX,
          rotate: flyX / 8,
          opacity: 0,
          config: { tension: 200, friction: 30 },
          onRest: () => onSwipe(dir),
        });
        return;
      }

      if (!active) {
        hasDragged.current = false;
      }

      api.start({
        x: active ? mx : 0,
        rotate: active ? mx / 12 : 0,
        scale: 1 - stackIndex * 0.05,
        immediate: active,
      });
    },
    { enabled: isTop, axis: "x" }
  );

  const handleTap = () => {
    if (!hasDragged.current && !gone.current && isTop) {
      onTap?.(meal);
    }
  };

  const likeOpacity = style.x.to((x) =>
    x > 0 ? Math.min(1, x / SWIPE_THRESHOLD) : 0
  );
  const nopeOpacity = style.x.to((x) =>
    x < 0 ? Math.min(1, -x / SWIPE_THRESHOLD) : 0
  );

  return (
    <animated.div
      {...(isTop ? bind() : {})}
      onClick={handleTap}
      className="swipe-card"
      style={{
        x: style.x,
        rotate: style.rotate.to((r) => `${r}deg`),
        scale: style.scale,
        y: style.y,
        opacity: style.opacity,
        zIndex: 10 - stackIndex,
        touchAction: "pan-y",
      }}
    >
      <div className="swipe-card__image-wrap">
        <img src={meal.strMealThumb} alt={meal.strMeal} draggable={false} />
        <animated.div
          className="swipe-overlay swipe-overlay--like"
          style={{ opacity: likeOpacity }}
        >
          YUM!
        </animated.div>
        <animated.div
          className="swipe-overlay swipe-overlay--nope"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </animated.div>
      </div>
      <div className="swipe-card__info">
        <h2 className="swipe-card__title">{meal.strMeal}</h2>
        <div className="swipe-card__tags">
          {meal.strCategory && (
            <span className="tag tag--category">{meal.strCategory}</span>
          )}
          {meal.strArea && (
            <span className="tag tag--area">{meal.strArea}</span>
          )}
        </div>
      </div>
    </animated.div>
  );
}

export function triggerSwipe(
  api: ReturnType<typeof useSpring>[1],
  direction: "left" | "right",
  onSwipe: (dir: "left" | "right") => void,
  goneRef: React.RefObject<boolean>
) {
  if (goneRef.current) return;
  goneRef.current = true;
  const flyX = direction === "right" ? FLY_OUT_X : -FLY_OUT_X;
  api.start({
    x: flyX,
    rotate: flyX / 8,
    opacity: 0,
    config: { tension: 200, friction: 30 },
    onRest: () => onSwipe(direction),
  });
}
