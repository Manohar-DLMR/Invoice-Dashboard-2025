// InvoiceDetails.jsx

// --- Imports ---
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInvoiceDetailsByGroupId } from '../api/api';
import { lazy, Suspense } from 'react';
import LoadingOrError from '../components/LoadingOrError/LoadingOrError';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import Spinner from '../components/Spinner/Spinner';
import './InvoiceDetails.css';

const InvoicePaymentCompletionCircle = lazy(() => import('../components/InvoicePaymentCompletionCircle/InvoicePaymentCompletionCircle'));
const InvoicePaymentTimeline = lazy(() => import('../components/InvoicePaymentTimeline/InvoicePaymentTimeline'));

// --- Main Component ---

function InvoiceDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); 

  useEffect(() => {
    if (!groupId) {
      setError('Invalid invoice reference.');
      setLoading(false);
      return;
    }
  
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchInvoiceDetailsByGroupId(groupId);
        setDetails(data);
      } catch (err) {
        console.error('Error fetching invoice details:', err);
        setError('Failed to load invoice details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    loadDetails();
  }, [groupId]);

  const errorOrLoading = (
    <LoadingOrError loading={loading} error={error} showBackButton={true} />
  );
  if (loading || error) return errorOrLoading;
  
  if (details.length === 0) {
    return <LoadingOrError loading={false} error="No payment records found for this invoice" showBackButton={true} />;
  }  

  // --- Prepare Data ---
  const summary = details[0];
  const invoiceAmount = parseFloat(summary['Invoice Amount']);
  const totalPaid = details.reduce((sum, row) => sum + (parseFloat(row['Paid Amount']) || 0), 0);
  const pending = parseFloat((invoiceAmount - totalPaid).toFixed(2));

  let status = '';
  if (pending < -1) status = 'Overpaid';
  else if (pending <= 1) status = 'Paid';
  else status = 'Due';

  const adjustedPending = Math.abs(pending) <= 1.0 ? 0.0 : pending;
  const displayRows = details.filter(row => !row['Special Note']);
  const showBalanceNote = (pending > 0 && pending <= 1) || (pending < 0 && pending >= -1);

  const smallBalanceNote = showBalanceNote ? (
    <tr className="invoice-note-row">
      <td colSpan="6">
        <em>
          {pending > 0
            ? `Small balance of $${pending.toFixed(2)} was adjusted to close this invoice.`
            : `Customer overpaid by $${Math.abs(pending).toFixed(2)}. Rounded off to mark invoice as fully paid.`}
        </em>
      </td>
    </tr>
  ) : null;

  // --- Render ---
  return (
    <div className="invoice-wrapper">
      {/* Top Controls */}
      <div className="invoice-top-controls">
        <button onClick={() => navigate('/')} className="invoice-back-button">
          <span className="hide-on-small">← Back to Dashboard</span>
          <span className="show-on-small">← Back</span>
        </button>
        <button className="invoice-print-button" onClick={() => window.print()}>
          🖨️ <span className="hide-on-small">Print</span>
        </button>
      </div>

      {/* Invoice Header */}
      <div className="invoice-header">
        <h3>Customer Invoice</h3>
        <h1>{summary['Clean Invoice Ref']}</h1>
      </div>

      {/* Main Content */}
      <div className="invoice-main-content">
        {/* Invoice Details Card */}
        <div className="invoice-widget">
          <div className="invoice-table-card">
            {/* Invoice Meta Info */}
            <div className="invoice-meta-grid">
              <div>Client ID:</div> <div>{summary['Client ID']}</div>
              <div>Invoice Date:</div> <div>{summary['Date Invoiced']?.split('T')[0]}</div>
              <div>Invoice Amount:</div> <div>${summary['Invoice Amount']}</div>
              <div>Status:</div> <div><span className={status.toLowerCase()}>{status}</span></div>
              <div>Payment Terms:</div> <div>30 Days</div>
            </div>

            {/* Invoice Payment Table */}
            <div className="invoice-table-scroll-wrapper">
              <table className="invoice-styled-table">
                <thead>
                  <tr>
                    <th>Date Paid</th>
                    <th>Amount Paid</th>
                    <th>Pending Amount</th>
                    <th>Days to Pay</th>
                    <th>Late</th>
                    <th>Duplicate</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, i) => (
                    <tr key={i}>
                      <td>{row['Date Paid']?.split('T')[0]}</td>
                      <td>{row['Paid Amount'] ? `$${row['Paid Amount']}` : ''}</td>
                      <td>{row['Pending Amount'] != null && !isNaN(row['Pending Amount']) ? `$${parseFloat(row['Pending Amount']).toFixed(2)}` : ''}</td>
                      <td>{row['Days to Pay']}</td>
                      <td>{row['Is Late'] ? '⚠️' : ''}</td>
                      <td>{row['Is Possible Duplicate'] ? '❗' : ''}</td>
                    </tr>
                  ))}
                  {smallBalanceNote}
                </tbody>
              </table>
            </div>

            {/* Invoice Legend */}
            <div className="invoice-legend">
              ⚠️ Late: Payment exceeded the 30-day term<br />
              ❗ Duplicate: Possible repeated payment record
            </div>

            {/* Invoice Summary */}
            <div className="invoice-summary">
              <p><strong>Invoice Summary</strong></p>
              <p>Invoice Total: ${invoiceAmount.toFixed(2)}</p>
              <p>Total Paid: ${totalPaid.toFixed(2)}</p>
              <p>Adjusted Pending: ${adjustedPending.toFixed(2)}</p>
            </div>

            {/* Footer Note */}
            <div className="invoice-footer-note">
              Payment is due within 30 days from the invoice date.<br />
              Please reference invoice number <strong>{summary['Clean Invoice Ref']}</strong> during the payment.
            </div>
          </div>
        </div>

        {/* Visualization Widgets */}
        <div className="invoice-widget visualization-widget">
          <ErrorBoundary>
            <Suspense fallback={<Spinner size={36} />}><InvoicePaymentCompletionCircle paid={totalPaid} total={invoiceAmount} status={status} /></Suspense>
          </ErrorBoundary>
          <ErrorBoundary>
            <Suspense fallback={<Spinner size={36} />}><InvoicePaymentTimeline details={details} status={status} pending={pending} /></Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetails;
