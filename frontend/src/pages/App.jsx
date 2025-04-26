// App.jsx

// --- Imports ---
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchClients, fetchInvoicesByClient } from '../api/api';
import CustomDropdown from '../components/CustomDropdown/CustomDropdown';
import AdaptiveInvoiceBarChart from '../components/AdaptiveInvoiceBarChart/AdaptiveInvoiceBarChart';
import AvgDaysToPayTrendLine from '../components/AvgDaysToPayTrendLine/AvgDaysToPayTrendLine';
import CreditScoreGauge from '../components/CreditScoreGauge/CreditScoreGauge';
import LoadingOrError from '../components/LoadingOrError/LoadingOrError'; 
import './App.css';

// --- Utility Functions ---

/**
 * Centralized error logging utility.
 * Replace console.error with a real logger when needed.
 */
const logError = (error) => {
  console.error(error);
};

// --- Custom Hooks ---

function useWindowSize() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

function useWindowHeight() {
  const [height, setHeight] = useState(window.innerHeight);
  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return height;
}

// --- Main App Component ---

function App() {
  const width = useWindowSize();
  const height = useWindowHeight();
  const isMobile = width <= 500;

  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [useSearch, setUseSearch] = useState(false);
  const [allInvoices, setAllInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filters, setFilters] = useState({ ref: '', date: '', min: '', max: '', status: '' });
  const [filtersStaged, setFiltersStaged] = useState({ ref: '', date: '', min: '', max: '', status: '' });
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [dueChecked, setDueChecked] = useState(() => localStorage.getItem('dueChecked') === 'true');
  const [overpaidChecked, setOverpaidChecked] = useState(() => localStorage.getItem('overpaidChecked') === 'true');
  const [currentPage, setCurrentPage] = useState(() => parseInt(localStorage.getItem('currentPage') || '1'));
  const filterRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('dueChecked', dueChecked);
  }, [dueChecked]);

  useEffect(() => {
    localStorage.setItem('overpaidChecked', overpaidChecked);
  }, [overpaidChecked]);

  const isNewSession = sessionStorage.getItem('activeSession') !== 'true';

  useEffect(() => {
    const loadClients = async () => {
      try {
        if (isNewSession) {
          localStorage.clear();
          sessionStorage.setItem('activeSession', 'true');
        }
        const allClientList = await fetchClients();
        setAllClients(allClientList);

        const statuses = [];
        if (dueChecked) statuses.push('Due');
        if (overpaidChecked) statuses.push('Overpaid');
        const clientList = await fetchClients(statuses);
        setClients(clientList.sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])));

        if (clientList.length > 0) {
          let defaultClient = localStorage.getItem('selectedClient');
          if (!defaultClient || !clientList.includes(defaultClient)) {
            defaultClient = clientList[0];
            localStorage.setItem('selectedClient', defaultClient);
          }
          setSelectedClient(defaultClient);
          setSearchInput(defaultClient);
        } else {
          setSelectedClient('');
          setSearchInput('');
          localStorage.removeItem('selectedClient');
        }

        const loadedFilters = {
          ref: localStorage.getItem('refFilter') || '',
          date: localStorage.getItem('dateFilter') || '',
          min: localStorage.getItem('minAmount') || '',
          max: localStorage.getItem('maxAmount') || '',
          status: localStorage.getItem('statusFilter') || ''
        };
        setFilters(loadedFilters);
        setFiltersStaged(loadedFilters);
        setActiveFilters(JSON.parse(localStorage.getItem('activeFilters') || '[]'));

        setLoading(false);

      } catch (error) {
        logError(error);
        setError('Failed to load clients. Please try again later.');
        setLoading(false);
      }
    };
    loadClients();
  }, [dueChecked, overpaidChecked, isNewSession]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilters && filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
        setFiltersStaged(filters);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  useEffect(() => {
    if (!selectedClient) return;
    fetchInvoicesByClient(selectedClient)
      .then(data => {
        setAllInvoices(data);

        const filtered = data.filter(inv => {
          const invoiceDate = inv['Date Invoiced']?.split('T')[0] || '';
          const status = inv['Status'].toLowerCase();
          return (!filters.ref || inv['Clean Invoice Ref'].toLowerCase().includes(filters.ref.toLowerCase())) &&
                 (!filters.date || invoiceDate.startsWith(filters.date)) &&
                 (!filters.min || parseFloat(inv['Invoice Amount']) >= parseFloat(filters.min)) &&
                 (!filters.max || parseFloat(inv['Invoice Amount']) <= parseFloat(filters.max)) &&
                 (!filters.status || status === filters.status);
        });

        setFilteredInvoices(filtered);
        setCurrentPage(parseInt(localStorage.getItem('currentPage') || '1'));
      })
      .catch(error => {
        logError(error);
        setError('Failed to load invoices. Please try again later.');
      });
  }, [selectedClient, filters]);

  const getDynamicRows = (height) => {
    const minHeight = 500;
    const maxHeight = 1200;
    const minRows = 5;
    const maxRows = 20;
    const clampedHeight = Math.min(Math.max(height, minHeight), maxHeight);
    const scale = (clampedHeight - minHeight) / (maxHeight - minHeight);
    return Math.round(minRows + scale * (maxRows - minRows));
  };
  const invoicesPerPage = getDynamicRows(height);

  const applyFilters = () => {
    setFilters(filtersStaged);
    const newFilters = Object.entries(filtersStaged)
      .map(([key, value]) => value && {
        key,
        label: `${key.charAt(0).toUpperCase() + key.slice(1)}: ${key === 'min' || key === 'max' ? '$' : ''}${value}`
      }).filter(Boolean);

    setActiveFilters(newFilters);
    localStorage.setItem('activeFilters', JSON.stringify(newFilters));
    localStorage.setItem('currentPage', '1');
    setCurrentPage(1);
    Object.entries(filtersStaged).forEach(([k, v]) => localStorage.setItem(`${k}Filter`, v));
    setShowFilters(false);
  };

  const clearAllFilters = (resetLocal = false) => {
    const empty = { ref: '', date: '', min: '', max: '', status: '' };
    setFilters(empty);
    setFiltersStaged(empty);
    setActiveFilters([]);
    if (resetLocal) {
      ['refFilter', 'dateFilter', 'minAmount', 'maxAmount', 'statusFilter', 'activeFilters'].forEach(k => localStorage.removeItem(k));
      localStorage.setItem('currentPage', '1');
      setCurrentPage(1);
    }
  };

  const clearFilter = (key) => {
    const updated = activeFilters.filter(f => f.key !== key);
    setActiveFilters(updated);
    localStorage.setItem('activeFilters', JSON.stringify(updated));
    localStorage.removeItem(`${key}Filter`);
    setFilters(prev => ({ ...prev, [key]: '' }));
    setFiltersStaged(prev => ({ ...prev, [key]: '' }));
  };

  const handleClientSearch = () => {
    const trimmed = searchInput.trim();
    const id = parseInt(trimmed, 10);
    const maxId = Math.max(...allClients.map(c => parseInt(c.split(' ')[1])));

    if (isNaN(id)) {
      setError('Only whole numbers allowed');
    } else if (id < 1 || id > maxId) {
      setError(`Client ID must be between 1 and ${maxId}`);
    } else {
      const clientStr = `Client ${id}`;
      if (clients.includes(clientStr)) {
        if (clientStr !== selectedClient) clearAllFilters(true);
        setSelectedClient(clientStr);
        setSearchInput(clientStr);
        setError('');
        localStorage.setItem('selectedClient', clientStr);
      } else if (allClients.includes(clientStr)) {
        const reasons = [];
        if (dueChecked && overpaidChecked) {
          reasons.push("Due or Overpaid");
        } else if (dueChecked) {
          reasons.push("Due");
        } else if (overpaidChecked) {
          reasons.push("Overpaid");
        }
        const reasonText = reasons.length > 0 ? ` that are ${reasons.join(" and ")}` : '';
        setError(`Client ${id} has no payments${reasonText}`);
      } else {
        setError(`Client ${id} not found`);
      }
    }
  };

  const indexOfLast = currentPage * invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfLast - invoicesPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  const goToPage = (p) => p >= 1 && p <= totalPages && (setCurrentPage(p), localStorage.setItem('currentPage', p));

  if (loading) {
    return <LoadingOrError loading={true} error="" showBackButton={false} />;
  }  

  return (
    <div className="dashboard-wrapper">
      {/* Dashboard Header */}
      <div className="dashboard-header-section">
        <h1 className="dashboard-header-title">📄 Invoice Dashboard</h1>
      </div>
      {/* Main Content */}
      <div className="dashboard-main-content-grid">
        {/* Widgets */}
        <div className="dashboard-widget">
          <div className="dashboard-selector-wrapper">
            <div className="dashboard-checkbox-toggle-group">
              <span className="dashboard-checkbox-title">Clients Status</span>
              <label className="dashboard-checkbox-label">
                <input type="checkbox" checked={dueChecked} onChange={() => setDueChecked(!dueChecked)} /> Due
              </label>
              <label className="dashboard-checkbox-label">
                <input type="checkbox" checked={overpaidChecked} onChange={() => setOverpaidChecked(!overpaidChecked)} /> Overpaid
              </label>
            </div>
            <div className="dashboard-search-toggle-group">
              {!useSearch ? (
                <CustomDropdown options={clients} value={selectedClient} onChange={(val) => {
                  if (val !== selectedClient) {
                    clearAllFilters(true); // Clear filters properly
                    setCurrentPage(1);      // Reset page to 1
                    localStorage.setItem('currentPage', '1');
                  }
                  setSelectedClient(val);
                  setSearchInput(val);
                  localStorage.setItem('selectedClient', val);
                  setError('');
                }} />                
              ) : (
                <input
                  type="text"
                  value={searchInput}
                  placeholder="Enter Client ID"
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleClientSearch()}
                />
              )}
              <button onClick={() => setUseSearch(!useSearch)} className="dashboard-responsive-toggle-btn">
                <span>{isMobile ? (useSearch ? '⬇' : '🔍') : (useSearch ? '⬇ Dropdown' : '🔍 Search')}</span>
              </button>
            </div>
          </div>

          <div className="dashboard-filter-section">
            {showFilters && (
              <div className="dashboard-filter-curtain" ref={filterRef}>
                <input
                  type="text"
                  placeholder={isMobile ? 'Ref. No.' : 'Reference No.'}
                  value={filtersStaged.ref}
                  onChange={e => setFiltersStaged(f => ({ ...f, ref: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                />
                <input
                  type="text"
                  value={filtersStaged.date}
                  placeholder="yyyy-mm-dd"
                  onChange={e => setFiltersStaged(f => ({ ...f, date: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                />
                <input
                  type="number"
                  placeholder={isMobile ? 'Min' : 'Minimum'}
                  value={filtersStaged.min}
                  onChange={e => setFiltersStaged(f => ({ ...f, min: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                />
                <input
                  type="number"
                  placeholder={isMobile ? 'Max' : 'Maximum'}
                  value={filtersStaged.max}
                  onChange={e => setFiltersStaged(f => ({ ...f, max: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                />
                <select
                  value={filtersStaged.status}
                  onChange={e => setFiltersStaged(f => ({ ...f, status: e.target.value }))}
                  className="dashboard-status-filter-dropdown"
                >
                  <option value="">Status</option>
                  <option value="paid">Paid</option>
                  <option value="overpaid">Overpaid</option>
                  <option value="due">Due</option>
                </select>
                <button onClick={applyFilters}>Apply</button>
              </div>
            )}
            <button
              className="dashboard-filter-icon"
              onClick={() => setShowFilters(prev => !prev)}
              title="Toggle Filters"
            >
              <img src="https://img.icons8.com/material-outlined/24/000000/filter--v1.png" alt="filter" />
            </button>
          </div>

          {activeFilters.length > 0 && (
            <div className="dashboard-filter-tags">
              {activeFilters.map(f => (
                <span key={f.key} className="dashboard-filter-tag">
                  {f.label} <button onClick={() => clearFilter(f.key)}>❌</button>
                </span>
              ))}
            </div>
          )}

          {error && <p className="dashboard-error-msg">{error}</p>}

          {clients.length === 0 ? (
            <p className="dashboard-error-msg">No clients found with the selected statuses.</p>
          ) : filteredInvoices.length === 0 ? (
            <p className="dashboard-error-msg">
              {selectedClient
                ? `Client ${selectedClient?.split(' ')[1]} has no invoices under selected filter(s)`
                : 'No invoices found for this client'}
            </p>
          ) : (
            <>
              <div className="dashboard-table-card" style={{ maxHeight: filteredInvoices.length <= 4 && width > 800 ? '50vh' : 'none' }}>
                <table className="dashboard-styled-table">
                  <thead>
                    <tr>
                      <th>{isMobile ? 'Ref. No.' : 'Reference Number'}</th>
                      <th>{isMobile ? 'Date' : 'Invoice Date'}</th>
                      <th>{isMobile ? 'Amount' : 'Invoice Amount'}</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoices.map((inv, i) => (
                      <tr key={i}>
                        <td>
                          <Link to={`/invoice/${inv['Invoice Group ID']}`} onClick={() => {
                            localStorage.setItem('currentPage', currentPage);
                            localStorage.setItem('scrollY', window.scrollY);
                          }}>{inv['Clean Invoice Ref']}</Link>
                        </td>
                        <td>{inv['Date Invoiced']?.split('T')[0]}</td>
                        <td style={{ textAlign: 'right' }}>${parseFloat(inv['Invoice Amount']).toFixed(2)}</td>
                        <td className={inv['Status'].toLowerCase()}>{inv['Status']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="dashboard-pagination-bar">
                <button disabled={currentPage <= 2} onClick={() => goToPage(currentPage - 2)}>{'<<'}</button>
                <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>{'<'}</button>
                <span className="current-page">{currentPage}</span>
                <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>{'>'}</button>
                <button disabled={currentPage >= totalPages - 1} onClick={() => goToPage(currentPage + 2)}>{'>>'}</button>
              </div>
            </>
          )}
        </div>

        <div className="dashboard-widget"><AdaptiveInvoiceBarChart invoices={filteredInvoices} /></div>
        <div className="dashboard-widget"><AvgDaysToPayTrendLine invoices={filteredInvoices} /></div>
        <div className="dashboard-widget"><CreditScoreGauge invoices={allInvoices} /></div>
      </div>
      {/* Footer Section */}
      <footer className="dashboard-footer">
        <p>
          © 2025 Manohar D 
          <span className="footer-separator">|</span> 
          <a href="mailto:manohar.dlmr@gmail.com" className="footer-link">
            📧 manohar.dlmr@gmail.com
          </a> 
          <span className="footer-separator">|</span> 
          📞 +1 (334) 517-8486
        </p>
      </footer>
    </div>
  );
}

export default App;