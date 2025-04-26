// api.js

// --- Dynamic BASE URL setup ---
const BASE_URL = process.env.NODE_ENV === 'production'
  ? ''   // Production backend URL
  : 'http://127.0.0.1:5000';                          // Local Flask backend

// --- API Functions ---

/**
 * Fetches a list of clients.
 * Optionally filters clients by status (Due, Paid, Overpaid).
 * 
 * @param {Array<string>} statuses - List of statuses to filter by.
 * @returns {Promise<Array>} - List of client names.
 */
export const fetchClients = async (statuses = []) => {
  // Build query parameters if statuses are provided
  const query = statuses.map(s => `status=${encodeURIComponent(s)}`).join('&');
  const url = query ? `${BASE_URL}/api/clients?${query}` : `${BASE_URL}/api/clients`;

  const response = await fetch(url);
  if (!response.ok) {
    // Throw an error if request fails
    throw new Error(`Failed to fetch clients: ${response.statusText}`);
  }

  // Return parsed JSON response
  return await response.json();
};

/**
 * Fetches invoices for a specific client.
 * 
 * @param {string} client - Client name.
 * @returns {Promise<Array>} - List of invoices for the client.
 */
export const fetchInvoicesByClient = async (client) => {
  const url = `${BASE_URL}/api/invoices/${encodeURIComponent(client)}`;

  const response = await fetch(url);
  if (!response.ok) {
    // Throw an error if request fails
    throw new Error(`Failed to fetch invoices: ${response.statusText}`);
  }

  // Return parsed JSON response
  return await response.json();
};

/**
 * Fetches invoice details by group ID.
 * 
 * @param {string} groupId - Invoice Group ID.
 * @returns {Promise<Array>} - Detailed list of invoice records.
 */
export const fetchInvoiceDetailsByGroupId = async (groupId) => {
  const url = `${BASE_URL}/api/invoice-details/${encodeURIComponent(groupId)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch invoice details: ${response.statusText}`);
  }
  return await response.json();
};
