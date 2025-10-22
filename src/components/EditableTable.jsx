// src/components/layouts/manager/EditableTable.jsx
import React, { useState } from "react";

const EditableTable = ({ data, searchable, onEdit, onDelete }) => {
  const [rows, setRows] = useState(data);
  const [query, setQuery] = useState("");

  const filteredRows = rows.filter((r) =>
    r.name?.toLowerCase().includes(query.toLowerCase()) ||
    r.store?.toLowerCase().includes(query.toLowerCase()) ||
    r.type?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="table-container">
      {searchable && (
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(178, 201, 173, 0.3)" }}>
          <input
            type="text"
            placeholder="Search inventory..."
            className="search-bar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      <table className="editable-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Store</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.id}>
              <td style={{ fontWeight: 600, color: "#4B5945" }}>{row.name}</td>
              <td>{row.store}</td>
              <td>{row.type}</td>
              <td>
                <span style={{ 
                  fontWeight: 600,
                  color: row.quantity < 20 ? "#dc2626" : "#4B5945"
                }}>
                  {row.quantity}
                </span>
              </td>
              <td style={{ fontWeight: 600 }}>
                ${typeof row.price === 'number' ? row.price.toFixed(2) : parseFloat(row.price).toFixed(2)}
              </td>
              <td>
                {row.quantity < 20 ? (
                  <span style={{
                    display: "inline-block",
                    padding: "0.35rem 0.75rem",
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#dc2626",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600
                  }}>
                    LOW STOCK
                  </span>
                ) : (
                  <span style={{
                    display: "inline-block",
                    padding: "0.35rem 0.75rem",
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#15803d",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600
                  }}>
                    IN STOCK
                  </span>
                )}
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit && onEdit(row)}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDelete && onDelete(row.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableTable;