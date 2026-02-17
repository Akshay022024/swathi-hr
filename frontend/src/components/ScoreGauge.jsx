export default function ScoreGauge({ score = 0, size = 140 }) {
    const radius = (size / 2) - 10
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    let color = '#ef4444'
    if (score >= 80) color = '#10b981'
    else if (score >= 60) color = '#3b82f6'
    else if (score >= 40) color = '#f59e0b'

    return (
        <div className="score-gauge" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="gauge-bg"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="gauge-fill"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        stroke: color,
                    }}
                />
            </svg>
            <div className="gauge-text">
                <span className="gauge-value">{score}</span>
                <span className="gauge-label">Match %</span>
            </div>
        </div>
    )
}
