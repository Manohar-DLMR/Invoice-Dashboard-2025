# app.py

# --- Imports ---
from flask import Flask, jsonify, request
from flask_cors import CORS
import json

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- Load Invoice Data ---
# Load pre-cleaned invoice data from a local JSON file
with open('cleaned_data.json', 'r') as f:
    invoice_data = json.load(f)
    print(f"Loaded {len(invoice_data)} invoices")


# --- Precompute Unique Clients and Their Statuses ---
# Extract all unique client names from the data
unique_clients = sorted(list(set(row['Client Name'] for row in invoice_data)))

# Prepare a dictionary to store each client's associated payment statuses
client_statuses = {}

for client in unique_clients:
    # Filter records belonging to the current client
    client_data = [row for row in invoice_data if row['Client Name'] == client]

    # Group invoices by reference, date, and amount
    grouped = {}
    for row in client_data:
        key = (row['Clean Invoice Ref'], row['Date Invoiced'], row['Invoice Amount'])
        grouped.setdefault(key, []).append(row)

    # Determine the status (Paid, Overpaid, Due) for each client
    statuses = set()
    for key, rows in grouped.items():
        last_row = max(rows, key=lambda r: float(r.get('Cumulative Paid', 0)))
        pending = float(last_row.get('Pending Amount', 0))

        if -1.0 <= pending <= 1.0:
            status = 'Paid'
        elif pending < -1.0:
            status = 'Overpaid'
        else:
            status = 'Due'

        statuses.add(status)

    client_statuses[client] = statuses

# --- API Endpoints ---

@app.route('/api/invoices', methods=['GET'])
def get_all_invoices():
    """
    Returns all invoice data.
    """
    return jsonify(invoice_data)


@app.route('/api/clients', methods=['GET'])
def get_clients():
    """
    Returns a list of unique clients.
    Can filter by payment status (Due, Paid, Overpaid) if provided via query parameters.
    """
    requested_statuses = set(s.capitalize() for s in request.args.getlist('status'))  # Normalize status input
    if not requested_statuses:
        return jsonify(unique_clients)
    else:
        # Return only clients who match at least one requested status
        filtered_clients = [client for client in unique_clients if client_statuses[client] & requested_statuses]
        return jsonify(filtered_clients)


@app.route('/api/invoices/<client>', methods=['GET'])
def get_invoices_by_client(client):
    """
    Returns all grouped invoices for a given client.
    Includes total paid, pending amount, status, and days to pay.
    """
    # Normalize client name for matching
    client = client.strip().lower()

    # Find all invoice rows related to the client
    client_data = [row for row in invoice_data if row['Client Name'].strip().lower() == client]

    # Group by Clean Invoice Ref + Date Invoiced + Invoice Amount
    grouped = {}
    for row in client_data:
        key = (row['Clean Invoice Ref'], row['Date Invoiced'], row['Invoice Amount'])
        grouped.setdefault(key, []).append(row)

    # Prepare response
    result = []
    for (ref, date, amount), rows in grouped.items():
        last_row = max(rows, key=lambda r: float(r.get('Cumulative Paid', 0)))
        pending = float(last_row.get('Pending Amount', 0))
        cumulative = float(last_row.get('Cumulative Paid', 0))

        if -1.0 <= pending <= 1.0:
            status = 'Paid'
        elif pending < -1.0:
            status = 'Overpaid'
        else:
            status = 'Due'

        result.append({
            'Invoice Group ID': last_row['Invoice Group ID'],
            'Clean Invoice Ref': ref,
            'Date Invoiced': date,
            'Invoice Amount': amount,
            'Total Paid': cumulative,
            'Status': status,
            'Days to Pay': last_row.get('Days to Pay')
        })

    return jsonify(result)


@app.route('/api/invoice-details/<group_id>', methods=['GET'])
def get_invoice_details(group_id):
    """
    Returns detailed records for a given Invoice Group ID.
    """
    matching_rows = [row for row in invoice_data if row['Invoice Group ID'] == group_id]
    print(f"Looking for Group ID: {group_id}, Found {len(matching_rows)} rows")

    if not matching_rows:
        return jsonify([])

    return jsonify(matching_rows)

# --- Run App ---
if __name__ == '__main__':
    app.run(debug=True)
