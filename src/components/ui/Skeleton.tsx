interface SkeletonProps {
  variant?: "text" | "card" | "table-row" | "circle";
  count?: number;
  width?: string;
  height?: string;
}

function SkeletonItem({ variant = "text", width, height }: Omit<SkeletonProps, "count">) {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return <div className={`skeleton skeleton--${variant}`} style={style} />;
}

export default function Skeleton({ variant = "text", count = 1, width, height }: SkeletonProps) {
  if (count === 1) return <SkeletonItem variant={variant} width={width} height={height} />;

  return (
    <div className="skeleton-group">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonItem key={i} variant={variant} width={width} height={height} />
      ))}
    </div>
  );
}
