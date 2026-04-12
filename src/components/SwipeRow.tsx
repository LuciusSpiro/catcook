import { useRef } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { Check, X } from "lucide-react";

const SWIPE_THRESHOLD = 80;
const FLY_OUT = 400;

interface SwipeRowProps {
  icon: string;
  label: string;
  sublabel?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function SwipeRow({
  icon,
  label,
  sublabel,
  onSwipeLeft,
  onSwipeRight,
}: SwipeRowProps) {
  const gone = useRef(false);

  const [style, api] = useSpring(() => ({
    x: 0,
    opacity: 1,
    config: { tension: 300, friction: 25 },
  }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx] }) => {
      if (gone.current) return;

      if (!active && Math.abs(mx) > SWIPE_THRESHOLD) {
        gone.current = true;
        const flyX = dx > 0 ? FLY_OUT : -FLY_OUT;
        api.start({
          x: flyX,
          opacity: 0,
          config: { tension: 200, friction: 30 },
          onRest: () => {
            if (dx > 0) onSwipeRight?.();
            else onSwipeLeft?.();
          },
        });
        return;
      }

      api.start({
        x: active ? mx : 0,
        immediate: active,
      });
    },
    { axis: "x" }
  );

  const leftOpacity = style.x.to((x) =>
    x < 0 ? Math.min(1, -x / SWIPE_THRESHOLD) : 0
  );
  const rightOpacity = style.x.to((x) =>
    x > 0 ? Math.min(1, x / SWIPE_THRESHOLD) : 0
  );

  return (
    <div className="swipe-row-wrap">
      {/* Background actions */}
      <animated.div className="swipe-row-bg swipe-row-bg--left" style={{ opacity: leftOpacity }}>
        <X size={20} />
      </animated.div>
      <animated.div className="swipe-row-bg swipe-row-bg--right" style={{ opacity: rightOpacity }}>
        <Check size={20} />
      </animated.div>

      {/* Draggable row */}
      <animated.div {...bind()} className="swipe-row" style={{ x: style.x, opacity: style.opacity, touchAction: "pan-y" }}>
        <span className="swipe-row__icon">{icon}</span>
        <div className="swipe-row__info">
          <span className="swipe-row__label">{label}</span>
          {sublabel && <span className="swipe-row__sub">{sublabel}</span>}
        </div>
        <div className="swipe-row__actions">
          {onSwipeLeft && (
            <button className="swipe-row__btn swipe-row__btn--left" onClick={() => { gone.current = true; api.start({ x: -FLY_OUT, opacity: 0, onRest: onSwipeLeft }); }}>
              <X size={16} />
            </button>
          )}
          {onSwipeRight && (
            <button className="swipe-row__btn swipe-row__btn--right" onClick={() => { gone.current = true; api.start({ x: FLY_OUT, opacity: 0, onRest: onSwipeRight }); }}>
              <Check size={16} />
            </button>
          )}
        </div>
      </animated.div>
    </div>
  );
}
