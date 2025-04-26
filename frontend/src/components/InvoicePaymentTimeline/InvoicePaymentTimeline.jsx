// InvoicePaymentTimeline.jsx

// --- Imports ---
import React from 'react';
import './InvoicePaymentTimeline.css';

// --- Main Component ---

export default function InvoicePaymentTimeline({ details, status, pending }) {
  if (!details || details.length === 0) return null;

  const summary = details[0];
  const invoiceDate = summary['Date Invoiced']?.split('T')[0] || 'N/A';
  const invoiceAmount = summary['Invoice Amount'] || '0.00';

  // Prepare timeline steps
  const steps = [
    {
      label: `Invoice Created – $${invoiceAmount}`,
      date: invoiceDate,
      icon: '🧾'
    },
    ...details.map((row) => {
      const isLate = row['Is Late'];
      const isDup = row['Is Possible Duplicate'];
      let note = '';

      if (isLate && isDup) note = 'Late Payment & Possible Duplicate';
      else if (isLate) note = 'Late Payment';
      else if (isDup) note = 'Possible Duplicate';

      return {
        label: `Paid $${row['Paid Amount'] || 0}`,
        date: row['Date Paid']?.split('T')[0] || 'N/A',
        icon: isLate ? '⚠️' : isDup ? '❗' : '💸',
        note
      };
    }),
    {
      label: status === 'Paid' ? 'Invoice Paid' : status === 'Due' ? 'Still Due' : 'Overpaid',
      date: new Date().toISOString().split('T')[0],
      icon: status === 'Paid' ? '✅' : status === 'Due' ? '⌛' : '💰',
      note:
        status === 'Due'
          ? `Pending Amount: $${pending.toFixed(2)}`
          : status === 'Overpaid'
          ? `Overpaid by: $${Math.abs(pending).toFixed(2)}`
          : 'Fully Settled',
      isFinal: true
    }
  ];

  return (
    <div className="timeline-card">
      <h3 style={{ textAlign: 'center' }}>Payment History</h3>
      <div className="timeline-scroll-hint-left" />
      <div className="timeline-zigzag-grid timeline-scrollable">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`timeline-step ${index % 2 === 0 ? 'left' : 'right'} ${step.isFinal ? `final-step ${status.toLowerCase()}` : ''}`}
          >
            <div className="timeline-step-icon">{step.icon}</div>
            <div className="timeline-step-box">
              <div className="timeline-step-label">{step.label}</div>
              <div className="timeline-step-date">{step.date}</div>
              {step.note && <div className="timeline-step-note">{step.note}</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="timeline-scroll-hint-right" />
    </div>
  );
}
