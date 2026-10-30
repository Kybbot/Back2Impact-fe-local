
type ProgressCircleProps = {
  progress: number;
  label?: string;
};

function ProgressCircle({
  progress,
  label = `${progress}%`,
}: ProgressCircleProps) {
  const value = Math.min(100, Math.max(0, progress));

  return (
    <div
      className="progress-circle"
      style={{ '--progress': value } as React.CSSProperties}
    >
      <svg viewBox="0 0 100 100">
        <circle
          className="progress-circle__background"
          cx="50"
          cy="50"
          r="42"
        />

        <circle
          className="progress-circle__progress"
          cx="50"
          cy="50"
          r="42"
          pathLength="100"
        />
      </svg>

      <span className="progress-circle__label">
        {label}
      </span>
    </div>
  );
};

export default ProgressCircle;