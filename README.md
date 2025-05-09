# 📄 Invoice Payment Dashboard 2025 🚀

> **Turning messy financial records into clean insights, dynamic visualizations, and actionable payment behavior analytics!**  
> Developed with precision and passion by **Manohar D**

---

## 📈 Project Overview

The **Invoice Payment Dashboard** is a full-stack financial tool designed to transform real-world payment records into actionable dashboards for companies.  
It enables companies to view, filter, track, and analyze payment patterns dynamically — across invoices, clients, and months — all within an intuitive interface.

✅ Intelligent **Client Filtering** (Due/Overpaid)  
✅ Deep dive into **Invoice History** per client  
✅ **Late payment**, **Duplicate payment**, and **Small Balance** handling  
✅ Dynamic, real-time **Visualization Updates**  
✅ Fully **Responsive** and **Print-Ready** Invoice records

---

## ⚙️ Tech Stack

| Frontend         | Backend       | Visualizations          | Styling                  |
| :--------------- | :------------ | :---------------------- | :----------------------- |
| React + Vite     | Python Flask  | Recharts (Bar, Line, Gauge) | Custom Responsive CSS3  |

---

## ✨ Key Features

### 📊 Dashboard Page
- **Smart Client Filtering**:  
  Use checkboxes to filter clients based on Due, Overpaid statuses.
- **Dynamic Client Search and Switching**:  
  Dropdown + Search Box with instant results.
- **Persistent Navigation**:  
  Remembers Page, Filters, and Scroll position when navigating back from Invoice Details.
- **Invoice Table**:  
  View Invoice Ref, Date, Amount, and Payment Status.
- **Dynamic Visualizations**:  
  Bar Chart → Monthly Invoice Totals  
  Line Chart → Average Days to Pay Trend  
  Credit Score Gauge → Overall client credit health
- **Mobile-Responsive Filter Curtain**:  
  Adaptive filter experience across devices.

### 📄 Invoice Details Page
- **Detailed Invoice Tracking**:  
  Payment dates, Paid Amounts, Pending Amounts, Cumulative history.
- **Payment History Timeline**:  
  Shows clear payment progression with status color indicators (Paid, Due, Overpaid).
- **Credit Completion Visualization**:  
  Circular progress bar showing % Paid toward Invoice Amount.
- **Single Invoice Printing**:  
  Clean, A4-friendly layout for physical invoice records.
- **Mobile First Adaptive Layouts**:  
  Optimized for tablets, phones, and desktops.

### 🧹 Advanced Data Handling
- Cleaned raw `.csv` financial data into structured `.json`
- Smart **Invoice Ref Extraction** (handles messy or missing references)
- **Small Balance Adjustments**:  
  Auto-credits rounding differences (≤ $1).
- **Late Payment Detection**:  
  Automatically flags payments made after 30 days.
- **Duplicate Payment Flagging**:  
  Identifies real duplicates (not just same-day splits).
- **Dynamic Pending Amount Recalculation**:  
  Adjusts after every payment line item.
- **Threshold based Small Overpayment Handling**:  
  Overpayments < $1 handled automatically.

### 🌎 Full Responsiveness
- Tailored for:
  - 4K, Full HD (1080p), 768p laptops
  - iPads, Galaxy Tabs
  - iPhones, Androids
- **Dynamic Table Row Calculation**:  
  Adjusts number of visible table rows based on screen height.

### 🔥 Other UX Enhancements
- Retains active search, filters, and page number across navigation.
- Responsive Dropdown/Search toggling on smaller screens.
- Dynamic Adaptation:
  - Visualizations instantly update when switching clients.
- Meaningful Error Handling:
  - Shows user-friendly messages for data fetch failures.
- Clean loading and no-flash behavior when switching.

---

## 📄 Full Project Documentation

For a complete breakdown of preprocessing, backend API logic, frontend implementation, lazy loading, error handling, and QA validation:

📘 [Invoice-Dashboard-2025_Documentation.pdf](./Invoice-Dashboard-2025_Documentation.pdf)

---

## 🚀 Deployment Links

| Item | Link |
| :--- | :--- |
| **Frontend Live App** | [https://invoice-dashboard-2025.vercel.app/](https://invoice-dashboard-2025.vercel.app/) |
| **Backend API** | [https://invoice-dashboard-2025.onrender.com](https://invoice-dashboard-2025.onrender.com) |

---

## 📚 Thought Process and Design Philosophy

This project wasn't just about building a dashboard —  
It focused on **simulating real-world financial operations** like:

- **Payment Data Cleansing**
- **Invoice Reference Extraction**
- **Threshold Small Balance Credit**
- **Late Payment Detection**
- **Accurate, Dynamic Pending Amount Calculations**

It follows **professional SaaS practices** like:
- Component-based frontend structure
- Separation of concerns between API, Pages, Components
- Persistent, State-aware navigation
- Responsive, Mobile-first philosophy
- Optimized chart and table render performance

The goal was to deliver an experience that's **clean, powerful, intuitive, and professional**.

---

## 🛠️ How to Run Locally

```bash
# Clone repository
git clone https://github.com/Manohar-DLMR/Invoice-Dashboard-2025.git

# Frontend Setup
cd frontend
npm install
npm run dev

# Backend Setup
cd backend
pip install -r requirements.txt
python app.py
```
