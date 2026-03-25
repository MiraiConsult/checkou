interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

export function ScoreRing({ score, size = 56, strokeWidth = 5, className, color }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = color || (score >= 80 ? "text-tertiary" : score >= 60 ? "text-primary" : "text-error");

  return (
    <div className={`relative inline-flex items-center justify-center ${className || ""}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-container-high"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={ringColor}
        />
      </svg>
      <span className="absolute text-xs font-bold text-on-surface">{score}%</span>
    </div>
  );
}
