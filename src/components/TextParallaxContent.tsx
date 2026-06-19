import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const IMG_PADDING = 12;

interface TextParallaxContentProps {
  imgUrl: string;
  subheading: string;
  heading: string;
  children: React.ReactNode;
}

export const TextParallaxContent = ({
  imgUrl,
  subheading,
  heading,
  children,
}: TextParallaxContentProps) => {
  return (
    <div style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}>
      <div className="parallax-block">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }: { imgUrl: string }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      ref={targetRef}
      className="parallax-sticky-img"
      style={{
        backgroundImage: `url(${imgUrl})`,
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
    >
      <motion.div className="parallax-overlay" style={{ opacity }} />
    </motion.div>
  );
};

const OverlayCopy = ({
  subheading,
  heading,
}: {
  subheading: string;
  heading: string;
}) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      ref={targetRef}
      className="parallax-overlay-copy"
      style={{ y, opacity }}
    >
      <p className="parallax-subheading">{subheading}</p>
      <p className="parallax-heading">
        {heading.split('\n').map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
        ))}
      </p>
    </motion.div>
  );
};

interface ParallaxSectionContentProps {
  title: string;
  body: string;
  ctaLabel: string;
  ctaTo: string;
}

export const ParallaxSectionContent = ({
  title,
  body,
  ctaLabel,
  ctaTo,
}: ParallaxSectionContentProps) => (
  <div className="parallax-content">
    <h3 className="parallax-content-title">{title}</h3>
    <div className="parallax-content-body">
      <p>{body}</p>
      <Link to={ctaTo} className="parallax-cta">
        {ctaLabel} <ArrowUpRight size={18} className="parallax-cta-icon" />
      </Link>
    </div>
  </div>
);
