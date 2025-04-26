// AdaptiveInvoiceBarChart.jsx

// --- Imports ---
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import './AdaptiveInvoiceBarChart.css';

// --- Utility Functions ---

/**
 * Format currency value for axis and tooltips.
 */
function formatCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Group invoices based on aggregation mode (month, quarter, year).
 */
function groupInvoices(invoices, mode) {
  const dataMap = {};

  invoices.forEach(inv => {
    const date = new Date(inv['Date Invoiced']);
    let key = '';

    if (mode === 'month') {
      key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    } else if (mode === 'quarter') {
      const q = Math.floor(date.getMonth() / 3) + 1;
      key = `Q${q} ${date.getFullYear()}`;
    } else {
      key = `${date.getFullYear()}`;
    }

    if (!dataMap[key]) {
      dataMap[key] = { total: 0, count: 0 };
    }

    dataMap[key].total += parseFloat(inv['Invoice Amount']);
    dataMap[key].count += 1;
  });

  return Object.entries(dataMap).map(([label, { total, count }]) => ({
    label,
    total: parseFloat(total.toFixed(2)),
    average: parseFloat((total / count).toFixed(2)),
    count
  }));
}

// --- Main Component ---

export default function AdaptiveInvoiceBarChart({ invoices }) {
  const [valueType, setValueType] = useState('total');
  const [activeIndex, setActiveIndex] = useState(null);

  // Determine aggregation level
  const aggregation = useMemo(() => {
    if (!invoices || invoices.length <= 2) return 'summary';

    const byMonth = groupInvoices(invoices, 'month');
    if (byMonth.length <= 6) return 'month';

    const byQuarter = groupInvoices(invoices, 'quarter');
    if (byQuarter.length <= 8) return 'quarter';

    return 'year';
  }, [invoices]);

  // Prepare grouped data for chart
  const groupedData = useMemo(() => {
    if (aggregation === 'summary') return [];
    return groupInvoices(invoices, aggregation);
  }, [invoices, aggregation]);

  // Handle case when there are too few invoices
  if (!invoices || invoices.length <= 2) {
    const msg = invoices.length === 1
      ? `Only 1 invoice found so far. Nothing major — just a simple deal for $${parseFloat(invoices[0]['Invoice Amount']).toFixed(2)} on ${invoices[0]['Date Invoiced']?.split('T')[0]}.`
      : `Just 2 invoices recorded. A small but important start!`;

    return (
      <div className="adaptive-bar-chart-card">
        <h3>📄 Quick Summary</h3>
        <p className="adaptive-friendly-message">✨ {msg}</p>
        {invoices.map((inv, i) => (
          <div key={i} className="adaptive-mini-summary">
            <p><strong>{inv['Clean Invoice Ref']}</strong></p>
            <p>📅 {inv['Date Invoiced']?.split('T')[0]}</p>
            <p>💰 ${parseFloat(inv['Invoice Amount']).toFixed(2)}</p>
            <p>Status: <span className={inv['Status'].toLowerCase()}>{inv['Status']}</span></p>
            {inv['Days to Pay'] && <p>⏱️ {inv['Days to Pay']} Days to Pay</p>}
            {inv['Is Late'] && <p>⚠️ Late Payment</p>}
            {inv['Is Possible Duplicate'] && <p>❗ Possible Duplicate</p>}
          </div>
        ))}
      </div>
    );
  }

  const chartTitle = {
    total: 'Total Invoiced Amount',
    average: 'Average Invoice Value',
    count: 'Number of Invoices'
  }[valueType];

  return (
    <div className="adaptive-bar-chart-card">
      {/* Header */}
      <div className="adaptive-bar-chart-header">
        <h3>📊 {chartTitle} – {aggregation.charAt(0).toUpperCase() + aggregation.slice(1)}ly</h3>
        <select
          onChange={(e) => setValueType(e.target.value)}
          value={valueType}
          className="adaptive-bar-chart-toggle"
        >
          <option value="total">Total</option>
          <option value="average">Average</option>
          <option value="count">Count</option>
        </select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={groupedData}
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
          <YAxis tickFormatter={valueType === 'count' ? (v) => v : formatCurrency} />
          <Tooltip
            wrapperStyle={{ visibility: activeIndex !== null ? 'visible' : 'hidden' }}
            formatter={(value) => valueType === 'count' ? value : formatCurrency(value)}
          />
          <Bar dataKey={valueType} fill="#004aad" />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="adaptive-chart-legend">
        <p><strong>Legend:</strong> Bars show <em>{chartTitle.toLowerCase()}</em> per <em>{aggregation}</em>.</p>
        <p>Use the dropdown to switch views between Total, Average, or Count.</p>
      </div>
    </div>
  );
}
