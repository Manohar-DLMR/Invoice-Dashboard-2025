// InvoicePaymentCompletionCircle.jsx

// --- Imports ---
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './InvoicePaymentCompletionCircle.css';

// --- Constants ---
const COLORS = {
  paid: '#4CAF50',     // green
  due: '#F44336',      // red
  overpaid: '#FF9800', // orange
};

// --- Main Component ---

export default function InvoicePaymentCompletionCircle({ paid, total, status = 'default' }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const finalPercentage = Math.min(100, Math.round((paid / total) * 100));
  const isOverpaid = status.toLowerCase() === 'overpaid';

  const width = window.innerWidth;
  const isMobile = width < 600;
  const innerRadius = isMobile ? 40 : 60;
  const outerRadius = isMobile ? 52 : 80;
  const strokeW = isMobile ? 6 : 10;

  const message = isOverpaid
    ? `Whoa! You've overpaid this invoice.`
    : finalPercentage === 100
    ? `All dues cleared — you're all set!`
    : finalPercentage >= 80
    ? `You're nearly there. Just a little more to wrap this up.`
    : `A significant amount is still pending. Consider clearing it soon.`;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValue(prev => {
        if (prev >= finalPercentage) {
          clearInterval(interval);
          return finalPercentage;
        }
        return prev + 1;
      });
    }, 15);

    return () => clearInterval(interval);
  }, [finalPercentage]);

  return (
    <div className="completion-chart-flex">
      <div className="completion-creative-message">
        <p>{message}</p>
      </div>

      <div className="completion-chart-container">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            {/* Background ring */}
            <Pie
              data={[{ value: 100 }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={isOverpaid ? COLORS.overpaid : COLORS.due} />
            </Pie>

            {/* Foreground animated ring */}
            <Pie
              data={[{ value: animatedValue }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={90}
              endAngle={90 - (animatedValue / 100) * 360}
              stroke="none"
              cornerRadius={strokeW}
              isAnimationActive={false}
            >
              <Cell fill={isOverpaid ? COLORS.overpaid : COLORS.paid} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <p className="completion-percentage-label">{animatedValue}% Paid</p>

        <div className="completion-legend-box">
          <div><span className="completion-legend-dot" style={{ backgroundColor: COLORS.paid }}></span> Paid</div>
          <div><span className="completion-legend-dot" style={{ backgroundColor: COLORS.due }}></span> Due</div>
          <div><span className="completion-legend-dot" style={{ backgroundColor: COLORS.overpaid }}></span> Overpaid</div>
        </div>
      </div>
    </div>
  );
}
