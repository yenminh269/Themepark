import React, { useState } from "react";

const TransactionTable = ({ data, searchable }) => {
  const [query, setQuery] = useState("");

  const filteredData = data.filter(
    (tx) =>
      tx.customer.toLowerCase().includes(query.toLowerCase()) ||
      tx.status.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="table-container">
      {searchable && (
        <input
          type="text"
          placeholder="Search transactions..."
          className="search-bar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Total ($)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.date}</td>
              <td>{tx.customer}</td>
              <td>${tx.total.toFixed(2)}</td>
              <td
                className={
                  tx.status === "Completed" ? "status-complete" : "status-pending"
                }
              >
                {tx.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
