import React, { useState, useEffect } from "react";
import "./saleEmployee.css";

export default function SaleEmployee() {
  const [salesData, setSalesData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAttr, setSearchAttr] = useState("item");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const rowsPerPage = 5;

  useEffect(() => {
    async function fetchSales() {
      try {
        const response = await fetch("/api/saleEmployee"); // DB endpoint
        const data = await response.json();
        setSalesData(data);
      } catch (err) {
        console.error("Failed to fetch sales data:", err);
      }
    }
    fetchSales();
  }, []);

  const handleEditClick = (sale) => {
    setEditId(sale.saleId);
    setEditFormData({ ...sale });
  };

  const handleCancelClick = () => {
    setEditId(null);
    setEditFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      await fetch(`/api/saleEmployee/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      setSalesData((prev) =>
        prev.map((item) => (item.saleId === editId ? editFormData : item))
      );
      setEditId(null);
      setEditFormData({});
    } catch (err) {
      console.error("Failed to update sale:", err);
    }
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    setEditId(null);
  };

  const filteredData = salesData.filter((sale) =>
    sale[searchAttr]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentRows = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleLogout = () => alert("Logging out!");

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-top">
          {/* 3-dash toggle */}
          <div
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            &#9776;
          </div>

          <div className="sidebar-title">Theme Park</div>

          <div className="store-list">
            <h4>Stores</h4>
            <ul>{/* replace with DB stores */}</ul>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="user-info">Username: SalesUser001</div>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="card">
          <h2>Sales Records</h2>

          {/* Search */}
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={searchAttr}
              onChange={(e) => setSearchAttr(e.target.value)}
            >
              <option value="saleId">Sale ID</option>
              <option value="storeId">Store ID</option>
              <option value="item">Item</option>
              <option value="quantity">Quantity</option>
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Store ID</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((sale) => (
                  <tr key={sale.saleId}>
                    <td>{sale.saleId}</td>
                    <td>
                      {editId === sale.saleId ? (
                        <input
                          type="number"
                          name="storeId"
                          value={editFormData.storeId}
                          onChange={handleFormChange}
                        />
                      ) : (
                        sale.storeId
                      )}
                    </td>
                    <td>
                      {editId === sale.saleId ? (
                        <input
                          type="text"
                          name="item"
                          value={editFormData.item}
                          onChange={handleFormChange}
                        />
                      ) : (
                        sale.item
                      )}
                    </td>
                    <td>
                      {editId === sale.saleId ? (
                        <input
                          type="number"
                          name="quantity"
                          value={editFormData.quantity}
                          onChange={handleFormChange}
                        />
                      ) : (
                        sale.quantity
                      )}
                    </td>
                    <td>
                      {editId === sale.saleId ? (
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleFormChange}
                        />
                      ) : (
                        sale.date
                      )}
                    </td>
                    <td>
                      {editId === sale.saleId ? (
                        <select
                          name="status"
                          value={editFormData.status}
                          onChange={handleFormChange}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        sale.status
                      )}
                    </td>
                    <td>
                      {editId === sale.saleId ? (
                        <>
                          <button
                            className="save-button"
                            onClick={handleSaveClick}
                          >
                            Save
                          </button>
                          <button
                            className="cancel-button"
                            onClick={handleCancelClick}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="edit-button"
                          onClick={() => handleEditClick(sale)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={currentPage === pageNum ? "active" : ""}
                  disabled={currentPage === pageNum}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
