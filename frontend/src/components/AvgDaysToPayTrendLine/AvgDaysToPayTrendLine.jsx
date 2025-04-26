// AvgDaysToPayTrendLine.jsx

// --- Imports ---
import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import './AvgDaysToPayTrendLine.css';

// --- Utility Functions ---

/**
 * Group invoices and calculate average days to pay based on aggregation mode.
 */
function groupByAggregation(invoices, mode) {
  const map = {};

  invoices.forEach(inv => {
    const date = new Date(inv['Date Invoiced']);
    const days = parseFloat(inv['Days to Pay']) || 0;
    if (!days) return;

    let key = '';
    if (mode === 'month') {
      key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    } else if (mode === 'quarter') {
      const q = Math.floor(date.getMonth() / 3) + 1;
      key = `Q${q} ${date.getFullYear()}`;
    } else {
      key = `${date.getFullYear()}`;
    }

    if (!map[key]) map[key] = { sum: 0, count: 0 };
    map[key].sum += days;
    map[key].count += 1;
  });

  return Object.entries(map).map(([label, { sum, count }]) => ({
    label,
    average: parseFloat((sum / count).toFixed(2))
  }));
}

// --- Main Component ---

export default function AvgDaysToPayTrendLine({ invoices }) {
  const [activeIndex, setActiveIndex] = useState(null);

  // Filter invoices with valid 'Days to Pay'
  const validInvoices = useMemo(() => invoices.filter(i => i['Days to Pay']), [invoices]);

  // Determine aggregation type (month, quarter, or year)
  const aggregation = useMemo(() => {
    if (!validInvoices || validInvoices.length <= 1) return 'summary';

    const byMonth = groupByAggregation(validInvoices, 'month');
    if (byMonth.length <= 6) return 'month';

    const byQuarter = groupByAggregation(validInvoices, 'quarter');
    if (byQuarter.length <= 8) return 'quarter';

    return 'year';
  }, [validInvoices]);

  // Prepare chart data
  const data = useMemo(() => {
    if (aggregation === 'summary') return [];
    return groupByAggregation(validInvoices, aggregation);
  }, [validInvoices, aggregation]);

  // Handle empty or insufficient data
  if (!validInvoices || validInvoices.length <= 1 || data.length === 0) {
    return (
      <div className="avg-days-chart-card">
        <h3>📈 Payment Trend Summary</h3>
        <p className="avg-days-friendly-message">
          📉 Not enough completed records to evaluate payment trends. At least two valid invoices with payment dates are required.
        </p>
      </div>
    );
  }

  // Render Line Chart
  return (
    <div className="avg-days-chart-card">
      <div className="avg-days-header">
        <h3>📈 Avg Days to Pay – {aggregation.charAt(0).toUpperCase() + aggregation.slice(1)}ly</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          onMouseLeave={() => setActiveIndex(null)}
          onMouseMove={(state) => {
            if (state && state.activeTooltipIndex !== undefined) {
              setActiveIndex(state.activeTooltipIndex);
            } else {
              setActiveIndex(null);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            wrapperStyle={{ visibility: activeIndex !== null ? 'visible' : 'hidden' }}
            formatter={(v) => `${v} days`}
          />
          <Line type="monotone" dataKey="average" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="avg-days-chart-legend">
        <p><strong>Legend:</strong> Line shows average time taken by the client to settle invoices across {aggregation}s.</p>
      </div>
    </div>
  );
}
