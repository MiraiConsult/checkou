interface ConformanceGaugeProps {
  value: number;
  size?: number;
}

export function ConformanceGauge({ value, size = 200 }: ConformanceGaugeProps) {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // semi-circle
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? "#006a3a" : value >= 60 ? "#007EF9" : "#ba1a1a";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="#e7e8e9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="-mt-16 text-center">
        <p className="text-4xl font-black text-navy">{value}%</p>
        <p className="text-[11px] text-outline mt-1">Índice de Conformidade</p>
      </div>
    </div>
  );
}
