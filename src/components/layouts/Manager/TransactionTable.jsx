// src/components/layouts/manager/TransactionTable.jsx
import React, { useState } from "react";

const TransactionTable = ({ data, searchable }) => {
  const [query, setQuery] = useState("");

  const filteredData = data.filter(
    (tx) =>
      tx.customer?.toLowerCase().includes(query.toLowerCase()) ||
      tx.status?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="table-container">
      {searchable && (
        <div style={{ padding: "2rem", borderBottom: "1px solid rgba(178, 201, 173, 0.3)" }}>
          <input
            type="text"
            placeholder="Search transactions..."
            className="search-bar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Store</th>
            <th>Items</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((tx) => (
            <tr key={tx.id}>
              <td style={{ fontWeight: 600, color: "#4B5945" }}>#{tx.id}</td>
              <td>{tx.date}</td>
              <td>{tx.customer}</td>
              <td>{tx.status}</td>
              <td style={{ fontWeight: 600, color: "#4B5945" }}>
                ${tx.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;