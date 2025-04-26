// CustomDropdown.jsx

// --- Imports ---
import { useState, useRef, useEffect } from 'react';
import './CustomDropdown.css';

// --- Main Component ---

export default function CustomDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown" ref={ref}>
      <button
        className="custom-dropdown-toggle"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        {value || 'Select Client'}
        <span className="arrow">▾</span>
      </button>

      {open && (
        <ul className="custom-dropdown-list">
          {options.map((opt, i) => (
            <li
              key={i}
              className={`custom-dropdown-item ${value === opt ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
