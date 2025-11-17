import { useEffect, useState } from "react";
import CustomButton from "../../../button/CustomButton";
import "../Add.css";
import { api } from '../../../../services/api';
import { useToast } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import Select from 'react-select';

function MerchandiseReport() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [conclusion, setConclusion] = useState("");
  const toast = useToast();

  // Form states
  const [items, setItems] = useState("");
  const [store, setStore] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selected specific values
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  // Options states
  const [itemOptions, setItemOptions] = useState([]);
  const [storeOptions, setStoreOptions] = useState([]);

  // Clear report data when parameters change
  useEffect(() => {
    setReportData(null);
    setConclusion("");
  }, [type, items, store, category]);

  // Items dropdown options
  const itemsGroupOption = [
    { value: 'all', label: 'All Items' },
    { value: 'specific', label: 'Specific Item' },
  ];

  // Store dropdown options
  const storeGroupOption = [
    { value: 'all', label: 'All Stores' },
    { value: 'specific', label: 'Specific Store' },
  ];

  // Category dropdown options (only shown when "All Items" is selected)
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'drinkware', label: 'Drinkware' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'apparel', label: 'Apparel' },
    { value: 'toys', label: 'Toys' },
    { value: 'accessories', label: 'Accessories' },
  ];

  // Type dropdown options
  const typeOptions = [
    { value: 'total_revenue', label: 'Total Revenues' },
    { value: 'best_worst_selling', label: 'Best-selling and Worst-selling Items' },
    { value: 'inventory_depletion', label: 'Inventory Depletion' },
  ];

  // Fetch merchandise items for the dropdown
  useEffect(() => {
    const fetchMerchandise = async () => {
      try {
        const merchandise = await api.getAllMerchandise();
        const options = merchandise.map(item => ({
          value: item.item_id,
          label: item.name
        }));
        setItemOptions(options);
      } catch (error) {
        console.error("Error fetching merchandise:", error);
        setItemOptions([]);
      }
    };
    fetchMerchandise();
  }, []);

  // Fetch stores for the dropdown
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const stores = await api.getAllStores();
        const options = stores.map(store => ({
          value: store.store_id,
          label: store.name  // Store table uses 'name' column, not 'store_name'
        }));
        setStoreOptions(options);
      } catch (error) {
        console.error("Error fetching stores:", error);
        setStoreOptions([]);
      }
    };
    fetchStores();
  }, []);

  const handleCloseReport = () => {
    setReportData(null);
    setConclusion("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReportData(null);
    setConclusion("");

    try {
      const params = {
        items,
        store,
        type,
        startDate,
        endDate,
        ...(items === 'all' && category && { category }),
        ...(items === 'specific' && selectedItemId && { itemId: selectedItemId }),
        ...(store === 'specific' && selectedStoreId && { storeId: selectedStoreId })
      };

      // TODO: Replace with actual API call when backend is ready
      // const data = await api.getMerchandiseReport(params);
      // For now, using mock data
      const data = [];
      setReportData(data);

      // Generate conclusion based on report type
      // TODO: Add conclusion generation logic based on report type
    } catch (err) {
      setError(err.message || "Failed to fetch report data");
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = () => {
    if (!reportData || reportData.length === 0) return;

    try {
      let reportTitle = '';
      if (type === 'total_revenue') reportTitle = 'MERCHANDISE TOTAL REVENUES REPORT';
      else if (type === 'best_worst_selling') reportTitle = 'BEST-SELLING AND WORST-SELLING ITEMS REPORT';
      else if (type === 'inventory_depletion') reportTitle = 'INVENTORY DEPLETION REPORT';

      let reportText = `${reportTitle}
Generated: ${new Date().toLocaleString()}
Date Range: ${startDate} to ${endDate}
Items: ${items === 'all' ? 'All Items' : 'Specific Item'}
${items === 'all' && category ? `Category: ${category}` : ''}
Store: ${store === 'all' ? 'All Stores' : 'Specific Store'}

==============================
`;

      // TODO: Add report data formatting based on type

      reportText += `==============================\n`;
      if (conclusion) {
        reportText += `${conclusion.replace(/<\/?strong>/g, '').replace(/<br\s*\/?>/g, '\n')}\n`;
        reportText += '==============================';
      }

      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const reportTypeSlug = type.replace(/_/g, '-');
      a.download = `merchandise-${reportTypeSlug}-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: 'Report saved',
        description: `Report saved successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error',
        description: 'Failed to save report. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6">
      <form onSubmit={handleSubmit}
            className="flex flex-col px-5 rounded w-full mb-6"
            style={{ boxShadow: '-8px -8px 12px 8px rgba(0,0,0,0.25)' }}
      >
        <h2 className="text-2xl text-center font-extrabold mb-4 pt-3" style={{ color: '#4B5945' }}>
          Merchandise Report
        </h2>

        <div className="flex gap-4">
          <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">Items</FormLabel>
            <Select
              options={itemsGroupOption}
              placeholder="Select items"
              className="custom-react-select"
              classNamePrefix="react-select"
              onChange={(option) => {
                setItems(option.value);
                if (option.value !== 'all') {
                  setCategory(''); // Clear category when not "All Items"
                }
              }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">Store</FormLabel>
            <Select
              options={storeGroupOption}
              placeholder="Select store"
              className="custom-react-select"
              classNamePrefix="react-select"
              onChange={(option) => setStore(option.value)}
            />
          </FormControl>
        </div>

        {/* Show specific item selector when "Specific Item" is selected */}
        {items === 'specific' && (
          <div className="mt-2">
            <FormControl isRequired>
              <FormLabel color="#4B5945" fontWeight="500">Select Item</FormLabel>
              <Select
                options={itemOptions}
                placeholder="Select item"
                className="custom-react-select"
                classNamePrefix="react-select"
                onChange={(option) => setSelectedItemId(option.value)}
              />
            </FormControl>
          </div>
        )}

        {/* Show specific store selector when "Specific Store" is selected */}
        {store === 'specific' && (
          <div className="mt-2">
            <FormControl isRequired>
              <FormLabel color="#4B5945" fontWeight="500">Select Store</FormLabel>
              <Select
                options={storeOptions}
                placeholder="Select store"
                className="custom-react-select"
                classNamePrefix="react-select"
                onChange={(option) => setSelectedStoreId(option.value)}
              />
            </FormControl>
          </div>
        )}

        {/* Show category selector only when "All Items" is selected */}
        {items === 'all' && (
          <div className="mt-2">
            <FormControl isRequired>
              <FormLabel color="#4B5945" fontWeight="500">Category</FormLabel>
              <Select
                options={categoryOptions}
                placeholder="Select category"
                className="custom-react-select"
                classNamePrefix="react-select"
                onChange={(option) => setCategory(option.value)}
              />
            </FormControl>
          </div>
        )}

        <div className="mt-2">
          <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">Report Type</FormLabel>
            <Select
              options={typeOptions}
              placeholder="Select report type"
              className="custom-react-select"
              classNamePrefix="react-select"
              onChange={(option) => setType(option.value)}
            />
          </FormControl>
        </div>

        <div className="flex gap-2 justify-between mt-2">
          <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">Date from</FormLabel>
            <input
              type="date"
              className="custom-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">Date to</FormLabel>
            <input
              type="date"
              className="custom-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormControl>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <CustomButton
            text={loading ? "Generating..." : "View Report"}
            className="custom-button"
            style={{ backgroundColor: '#176B87' }}
            disabled={loading}
          />
          {reportData && reportData.length > 0 && (
            <button
              type="button"
              onClick={handleSaveReport}
              className="btn-custom mb-4 text-white px-5 py-2 rounded-md hover:bg-[#5b7e5f] transition"
            >
              Save Report
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </form>

      {reportData && reportData.length > 0 && (
        <div
          className="flex flex-col items-center justify-center p-6 mt-4 rounded w-full relative"
          style={{ boxShadow: '-8px -8px 12px 8px rgba(0,0,0,0.25)' }}
        >
          <button
            onClick={handleCloseReport}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            style={{ cursor: 'pointer' }}
            aria-label="Close report"
          >
            X
          </button>

          <h3 className="text-xl font-bold mb-4" style={{ color: '#4B5945' }}>
            {type === 'total_revenue' && '📋 Merchandise Total Revenues Report'}
            {type === 'best_worst_selling' && '📋 Best-selling and Worst-selling Items Report'}
            {type === 'inventory_depletion' && '📋 Inventory Depletion Report'}
          </h3>

          <div className="overflow-x-auto w-full">
            <table className="mx-auto">
              <thead className="bg-[#176B87] text-white">
                <tr>
                  {type === 'total_revenue' && (
                    <>
                      <th className="py-3 !px-6 border !border-black font-semibold">Item Name</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Store</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Category</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Total Quantity Sold</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Total Revenue</th>
                    </>
                  )}
                  {type === 'best_worst_selling' && (
                    <>
                      <th className="py-3 !px-6 border !border-black font-semibold">Rank</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Item Name</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Store</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Category</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Total Quantity Sold</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Total Revenue</th>
                    </>
                  )}
                  {type === 'inventory_depletion' && (
                    <>
                      <th className="py-3 !px-6 border !border-black font-semibold">Item Name</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Store</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Current Stock</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Quantity Sold</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Depletion Rate (%)</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    {/* TODO: Add table rows based on report type */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {conclusion && (
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: '#4B5945' }}>
                📝 Insights
              </h4>
              <div className="bg-[#EEEFE0] p-4 rounded">
                <p className="my-2 text-gray-700" dangerouslySetInnerHTML={{ __html: conclusion }}></p>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-700">
            Generated on: {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {reportData && reportData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
          <p className="text-yellow-800">No merchandise data available for the selected criteria.</p>
        </div>
      )}
    </div>
  );
}

export default MerchandiseReport;
