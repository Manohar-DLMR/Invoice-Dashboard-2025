// CreditScoreGauge.jsx

// --- Imports ---
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import './CreditScoreGauge.css';

// --- Constants ---

const scoreRanges = [
  { name: 'Poor', value: 60, color: '#ff3333' },
  { name: 'Fair', value: 60, color: '#ff9933' },
  { name: 'Good', value: 60, color: '#ffcc00' },
  { name: 'Very Good', value: 60, color: '#99cc00' },
  { name: 'Excellent', value: 60, color: '#00cc00' }
];

// --- Utility Functions ---

/**
 * Calculate a credit score based on average Days to Pay.
 * Faster payments → higher score.
 */
function calculateCreditScore(invoices) {
  const MAX_SCORE = 850;
  const MIN_SCORE = 300;

  if (!invoices || invoices.length === 0) return MIN_SCORE;

  const valid = invoices.filter(inv => inv['Days to Pay'] && !isNaN(inv['Days to Pay']));
  if (valid.length === 0) return MIN_SCORE;

  const totalDays = valid.reduce((sum, inv) => sum + parseFloat(inv['Days to Pay']), 0);
  const avgDays = totalDays / valid.length;

  const cappedAvg = Math.min(avgDays, 90);
  return Math.round(MAX_SCORE - ((cappedAvg / 90) * (MAX_SCORE - MIN_SCORE)));
}

// --- Main Component ---

export default function CreditScoreGauge({ invoices }) {
  const score = useMemo(() => calculateCreditScore(invoices), [invoices]);
  const angle = 180 * ((score - 300) / (850 - 300)) - 90;

  return (
    <div className="credit-gauge-card">
      <h3>🏦 Credit Score Overview</h3>
      <div className="gauge-wrapper">
        <PieChart width={300} height={150}>
          <Pie
            startAngle={180}
            endAngle={0}
            data={scoreRanges}
            dataKey="value"
            cx="50%"
            cy="100%"
            innerRadius={60}
            outerRadius={80}
            stroke="none"
          >
            {scoreRanges.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="needle" style={{ transform: `rotate(${angle}deg)` }} />
        <div className="score-label">{score}</div>
      </div>

      <p className="credit-score-caption">
        📊 This score is based on all invoices of the client (not affected by filters). It reflects payment consistency and average days to settle invoices. Lower days = better score.
      </p>

      <div className="credit-legend">
        {scoreRanges.map((r, i) => (
          <div key={i} className="legend-item">
            <span style={{ backgroundColor: r.color }}></span>{r.name}
          </div>
        ))}
      </div>
    </div>
  );
}
