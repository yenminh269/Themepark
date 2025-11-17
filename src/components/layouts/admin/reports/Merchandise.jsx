import { useEffect, useState } from "react";
import CustomButton from "../../../button/CustomButton";
import "../Add.css";
import { api } from '../../../../services/api';
import { useToast, Tooltip } from '@chakra-ui/react';
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

  // Items dropdown options (only for Total Revenues type)
  const itemsGroupOption = [
    { value: 'all', label: 'All Merchandise' },
    { value: 'specific', label: 'Specific Merchandise' },
  ];

  // Store dropdown options
  const storeGroupOption = [
    { value: 'all', label: 'All Stores' },
    { value: 'specific', label: 'Specific Store' },
  ];

  // Category dropdown options (only shown when "All Merchandise" is selected for Total Revenues)
  const categoryOptions = [
    { value: 'all', label: 'All' },
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
    { value: 'growth', label: 'Store Average Growth' },
    { value: 'monthly_growth', label: 'Monthly Growth Analysis' },
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
        type,
        store,
        startDate,
        endDate,
        ...(type === 'total_revenue' && { items }),
        ...(items === 'all' && category && { category }),
        ...(items === 'specific' && selectedItemId && { itemId: selectedItemId }),
        ...(store === 'specific' && selectedStoreId && { storeId: selectedStoreId })
      };

      const data = await api.getMerchandiseReport(params);
      setReportData(data);

      // Generate conclusion based on report type
      if (type === 'total_revenue' && data.length > 0) {
        const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const totalQuantity = data.reduce((sum, item) => sum + parseInt(item.quantity), 0);

        // Find best-selling item
        const itemSales = {};
        data.forEach(item => {
          if (!itemSales[item.item_name]) {
            itemSales[item.item_name] = { quantity: 0, revenue: 0 };
          }
          itemSales[item.item_name].quantity += parseInt(item.quantity);
          itemSales[item.item_name].revenue += parseFloat(item.subtotal);
        });
        const bestSellingItem = Object.entries(itemSales).reduce((max, [name, stats]) =>
          stats.revenue > max.revenue ? { name, ...stats } : max,
          { name: '', revenue: 0, quantity: 0 }
        );

        let conclusionText = `<strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}<br/><strong>Total Items Sold:</strong> ${totalQuantity}`;

        if (items === 'all') {
          conclusionText += `<br/><strong>Best-Selling Item:</strong> ${bestSellingItem.name} (${bestSellingItem.quantity} units, $${bestSellingItem.revenue.toFixed(2)})`;
        }

        if (store === 'all') {
          // Find best performing store
          const storeSales = {};
          data.forEach(item => {
            if (!storeSales[item.store_name]) {
              storeSales[item.store_name] = 0;
            }
            storeSales[item.store_name] += parseFloat(item.subtotal);
          });
          const bestStore = Object.entries(storeSales).reduce((max, [name, revenue]) =>
            revenue > max.revenue ? { name, revenue } : max,
            { name: '', revenue: 0 }
          );
          conclusionText += `<br/><strong>Best Performing Store:</strong> ${bestStore.name} ($${bestStore.revenue.toFixed(2)})`;
        }

        setConclusion(conclusionText);
      } else if (type === 'growth' && data.length > 0) {
        const avgGrowth = data.reduce((sum, item) => sum + parseFloat(item.growth_rate), 0) / data.length;
        const topGrowing = data.reduce((max, item) => parseFloat(item.growth_rate) > parseFloat(max.growth_rate) ? item : max);
        const topDate = new Date(topGrowing.order_date).toLocaleDateString();
        const growthExplanation = store === 'specific'
          ? 'Average of daily revenue changes compared to previous day'
          : 'Average performance compared to other stores';
        setConclusion(`<strong>Average Growth Rate:</strong> ${avgGrowth.toFixed(2)}% <span style="color: #666; font-size: 0.9em;">(${growthExplanation})</span><br/><strong>Top Performing:</strong> ${topGrowing.store_name} on ${topDate} (${parseFloat(topGrowing.growth_rate).toFixed(2)}%)`);
      } else if (type === 'monthly_growth' && data.length > 0) {
        const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0);
        const avgMonthlyGrowth = data.reduce((sum, item) => sum + parseFloat(item.growth_rate), 0) / data.length;
        const topMonth = data.reduce((max, item) => parseFloat(item.growth_rate) > parseFloat(max.growth_rate) ? item : max);

        if (store === 'specific') {
          // For specific store: show which month had highest growth
          setConclusion(`<strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}<br/><strong>Average Monthly Growth:</strong> ${avgMonthlyGrowth.toFixed(2)}%<br/><strong>Best Growth Month:</strong> ${topMonth.month_name} ${topMonth.year} (${parseFloat(topMonth.growth_rate).toFixed(2)}%)`);
        } else {
          // For all stores: show which store led the best month
          setConclusion(`<strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}<br/><strong>Average Monthly Growth:</strong> ${avgMonthlyGrowth.toFixed(2)}%<br/><strong>Best Month:</strong> ${topMonth.month_name} ${topMonth.year} (${parseFloat(topMonth.growth_rate).toFixed(2)}% growth, led by ${topMonth.top_contributor})`);
        }
      }
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
      else if (type === 'growth') reportTitle = 'STORE AVERAGE GROWTH REPORT';
      else if (type === 'monthly_growth') reportTitle = 'MONTHLY GROWTH ANALYSIS REPORT';

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
    <div className="w-full max-w-6xl mx-auto my-6">
      <form onSubmit={handleSubmit}
            className="flex flex-col px-5 rounded w-full mb-6"
            style={{ boxShadow: '-8px -5px 12px  rgba(0,0,0,0.25)' }}
      >
        <h2 className="text-2xl text-center font-extrabold mb-4 pt-3" style={{ color: '#4B5945' }}>
          Merchandise Report
        </h2>

        {/* Report Type Selection - Show First */}
        <div className="mt-2">
          <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">Report Type</FormLabel>
            <Select
              options={typeOptions}
              placeholder="Select report type"
              className="custom-react-select"
              classNamePrefix="react-select"
              onChange={(option) => {
                setType(option.value);
                // Reset dependent fields when type changes
                setItems('');
                setStore('');
                setCategory('');
                setSelectedItemId(null);
                setSelectedStoreId(null);
              }}
            />
          </FormControl>
        </div>

        {/* Show Items and Store fields only for Total Revenues type */}
        {type === 'total_revenue' && (
          <div className="flex gap-4 mt-2">
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
                    setCategory(''); // Clear category when not "All Merchandise"
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
        )}

        {/* Show only Store field for Growth type and Monthly Growth type */}
        {(type === 'growth' || type === 'monthly_growth') && (
          <div className="mt-2">
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
        )}

        {/* Show specific item selector when "Specific Merchandise" is selected for Total Revenues */}
        {type === 'total_revenue' && items === 'specific' && (
          <div className="mt-2">
            <FormControl isRequired>
              <FormLabel color="#4B5945" fontWeight="500">Select Merchandise</FormLabel>
              <Select
                options={itemOptions}
                placeholder="Select merchandise"
                className="custom-react-select"
                classNamePrefix="react-select"
                onChange={(option) => setSelectedItemId(option.value)}
              />
            </FormControl>
          </div>
        )}

        {/* Show category selector only when "All Merchandise" is selected for Total Revenues */}
        {type === 'total_revenue' && items === 'all' && (
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

        {/* Show specific store selector when "Specific Store" is selected (for both types) */}
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
        <div className="flex flex-col items-center justify-center mt-4 rounded w-full relative" >
          <button
            onClick={handleCloseReport}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            style={{ cursor: 'pointer' }}
            aria-label="Close report"
          >
            X
          </button>

          <h3 className="bg-white border !border-gray-500 px-4 py-3 text-xl font-bold mb-4">
            {type === 'total_revenue' && ' Merchandise Total Revenues Report'}
            {type === 'growth' && 'Store Average Growth Report'}
            {type === 'monthly_growth' && 'Monthly Growth Analysis Report'}
          </h3>

          <div className="overflow-x-auto w-full">
            <table className="mx-auto">
              <thead className="!bg-[#91C8E4]">
                <tr>
                  {type === 'total_revenue' && (
                    <>
                      <th className="py-3 !px-6 border !border-black font-semibold">Customer Name</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Order Date</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Item Name</th>
                      {store === 'all' && <th className="py-3 !px-6 border !border-black font-semibold">Store</th>}
                      {items === 'all' && <th className="py-3 !px-6 border !border-black font-semibold">Category</th>}
                      <th className="py-3 !px-6 border !border-black font-semibold">Quantity</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Price/Item</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Subtotal</th>
                    </>
                  )}
                  {type === 'growth' && (
                    <>
                      <th className="py-3 !px-6 border !border-black font-semibold" colSpan="2">Order Date & Store</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Count Orders</th>
                      <th className="py-3 !px-6 border !border-black font-semibold" colSpan="2">Total Revenue</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">
                        <Tooltip
                          label={
                            store === 'specific'
                              ? "Growth rate compares each day's revenue to the previous day's revenue: ((Current Day - Previous Day) / Previous Day) × 100"
                              : "Growth rate compares each store's revenue to the average of other stores on the same date: ((Store Revenue - Avg of Others) / Avg of Others) × 100"
                          }
                          placement="top"
                          hasArrow
                          bg="gray.700"
                          color="white"
                          fontSize="sm"
                          px={3}
                          py={2}
                        >
                          <span style={{ color: 'white', cursor: 'help', borderBottom: '1px dotted white' }}>
                            Growth Rate (%)
                          </span>
                        </Tooltip>
                      </th>
                    </>
                  )}
                  {type === 'monthly_growth' && (
                    <>
                      <th className="py-3 !px-6 border !border-black font-semibold">Month</th>
                      {store === 'specific' && <th className="py-3 !px-6 border !border-black font-semibold">Store</th>}
                      <th className="py-3 !px-6 border !border-black font-semibold">Total Orders</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">Total Revenue</th>
                      <th className="py-3 !px-6 border !border-black font-semibold">
                        <Tooltip
                          label="Month-over-month growth rate: ((Current Month - Previous Month) / Previous Month) × 100"
                          placement="top"
                          hasArrow
                          bg="gray.700"
                          color="white"
                          fontSize="sm"
                          px={3}
                          py={2}
                        >
                          <span style={{ color: 'black', cursor: 'help', borderBottom: '1px dotted white' }}>
                            Growth Rate (%)
                          </span>
                        </Tooltip>
                      </th>
                      {store === 'all' && (
                        <>
                          <th className="py-3 !px-6 border !border-black font-semibold">Top Contributor</th>
                          <th className="py-3 !px-6 border !border-black font-semibold">Contribution %</th>
                        </>
                      )}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <>
                    {/* Order Details Row - Display BEFORE the summary row for Growth type */}
                    {type === 'growth' && item.details && item.details.length > 0 && (
                      <tr key={`${index}-details`}>
                        <td colSpan="6" className="!py-4 border !border-gray-500 bg-gray-50">
                          <div className="!px-3">
                            <table className="min-w-full border-collapse">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Customer Name</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Email</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Phone</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Item Name</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Quantity</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Price/Item</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Subtotal</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Order Total</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Status</th>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Payment</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.details.map((detail, detailIndex) => (
                                  <tr key={detailIndex} className="hover:bg-gray-100">
                                    <td className="py-2 px-4 border border-gray-300 text-sm">
                                      {detail.first_name} {detail.last_name}
                                    </td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm">{detail.email}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm">{detail.phone}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm">{detail.item_name}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm text-center">{detail.quantity}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm text-right">${parseFloat(detail.price_per_item).toFixed(2)}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm text-right">${parseFloat(detail.subtotal).toFixed(2)}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm text-right">${parseFloat(detail.order_total).toFixed(2)}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm capitalize">{detail.status}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm">{detail.payment_method?.replace('_', ' ')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Summary Row */}
                    <tr key={index} className="bg-blue-100">
                      {type === 'total_revenue' && (
                        <>
                          <td className="py-3 !px-6 border !border-gray-400">{item.first_name} {item.last_name}</td>
                          <td className="py-3 !px-6 border !border-gray-400">{new Date(item.order_date).toLocaleDateString()}</td>
                          <td className="py-3 !px-6 border !border-gray-400">{item.item_name}</td>
                          {store === 'all' && <td className="py-3 !px-6 border !border-gray-400">{item.store_name}</td>}
                          {items === 'all' && <td className="py-3 !px-6 border !border-gray-400 capitalize">{item.category}</td>}
                          <td className="py-3 !px-6 border !border-gray-400 text-center">{item.quantity}</td>
                          <td className="py-3 !px-6 border !border-gray-400 text-right">${parseFloat(item.price_per_item).toFixed(2)}</td>
                          <td className="py-3 !px-6 border !border-gray-400 text-right">${parseFloat(item.subtotal).toFixed(2)}</td>
                        </>
                      )}
                      {type === 'growth' && (
                        <>
                          <td className="py-3 !px-6 border !border-gray-400" colSpan="2">
                            <strong>{new Date(item.order_date).toLocaleDateString()}</strong> - {item.store_name}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-400 text-center">{item.order_count}</td>
                          <td className="py-3 !px-6 border !border-gray-400 text-right" colSpan="2">
                            ${parseFloat(item.total_revenue).toFixed(2)}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-400 text-center">
                            <span className={`font-semibold ${
                              item.growth_rate > 0 ? '!text-green-600' :
                              item.growth_rate < 0 ? '!text-red-600' :
                              'text-gray-600'
                            }`}>
                              {item.growth_rate > 0 ? '+' : ''}{parseFloat(item.growth_rate).toFixed(2)}%
                            </span>
                          </td>
                        </>
                      )}
                      {type === 'monthly_growth' && (
                        <>
                          <td className="py-3 !px-6 border !border-gray-400">
                            <strong>{item.month_name} {item.year}</strong>
                          </td>
                          {store === 'specific' && (
                            <td className="py-3 !px-6 border !border-gray-400">{item.store_name}</td>
                          )}
                          <td className="py-3 !px-6 border !border-gray-400 text-center">{item.total_orders}</td>
                          <td className="py-3 !px-6 border !border-gray-400 text-right">
                            ${parseFloat(item.total_revenue).toFixed(2)}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-400 text-center">
                            <span className={`font-semibold ${
                              item.growth_rate > 0 ? 'text-green-600' :
                              item.growth_rate < 0 ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {item.growth_rate > 0 ? '+' : ''}{parseFloat(item.growth_rate).toFixed(2)}%
                            </span>
                          </td>
                          {store === 'all' && (
                            <>
                              <td className="py-3 !px-6 border !border-gray-400">{item.top_contributor}</td>
                              <td className="py-3 !px-6 border !border-gray-400 text-center">
                                {parseFloat(item.top_contributor_percentage).toFixed(1)}%
                              </td>
                            </>
                          )}
                        </>
                      )}
                    </tr>

                    {/* Store Breakdown for Monthly Growth - Only for All Stores */}
                    {type === 'monthly_growth' && store === 'all' && item.stores && item.stores.length > 0 && (
                      <tr key={`${index}-stores`}>
                        <td colSpan="6" className="!py-4 border !border-gray-500 bg-gray-50">
                          <div className="!px-4">
                            <h4 className="font-semibold text-gray-700 mb-3">Store Performance Breakdown:</h4>
                            <table className="min-w-full border-collapse">
                              <thead className="bg-[#91C8E4]">
                                <tr>
                                  <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Store Name</th>
                                  <th className="py-2 px-4 border border-gray-400 text-center text-sm font-semibold">Orders</th>
                                  <th className="py-2 px-4 border border-gray-400 text-right text-sm font-semibold">Revenue</th>
                                  <th className="py-2 px-4 border border-gray-400 text-center text-sm font-semibold">Contribution %</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.stores.map((store, storeIndex) => (
                                  <tr key={storeIndex} className="hover:bg-gray-100">
                                    <td className="py-2 px-4 border border-gray-300 text-sm">
                                      {store.store_name}
                                    </td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm text-center">{store.order_count}</td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm text-right">
                                      ${parseFloat(store.total_revenue).toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 border border-gray-300 text-sm text-center">
                                      <span className={`font-semibold ${
                                        store.contribution_percentage >= 40 ? 'text-green-600' :
                                        store.contribution_percentage >= 25 ? 'text-blue-600' :
                                        'text-gray-600'
                                      }`}>
                                        {parseFloat(store.contribution_percentage).toFixed(1)}%
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}

                {/* Grand Total Row for Total Revenue */}
                {type === 'total_revenue' && reportData.length > 0 && (
                  <tr className="bg-green-100 font-bold">
                    <td className="py-3 !px-6 border !border-black" colSpan={items === 'all' && store === 'all' ? '5' : items === 'all' || store === 'all' ? '4' : '3'}>
                      <strong>GRAND TOTAL:</strong>
                    </td>
                    <td className="py-3 !px-6 border !border-black text-center">
                      {reportData.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0)}
                    </td>
                    <td className="py-3 !px-6 border !border-black text-right" colSpan="2">
                      ${reportData.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0).toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Grand Total Row for Store Average Growth */}
                {type === 'growth' && reportData.length > 0 && (
                  <tr className="bg-green-100 font-bold">
                    <td className="py-3 !px-6 border !border-black" colSpan="2">
                      <strong>GRAND TOTAL:</strong>
                    </td>
                    <td className="py-3 !px-6 border !border-black text-center">
                      {reportData.reduce((sum, item) => sum + parseInt(item.order_count || 0), 0)}
                    </td>
                    <td className="py-3 !px-6 border !border-black text-right" colSpan="2">
                      ${reportData.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0).toFixed(2)}
                    </td>
                    <td className="py-3 !px-6 border !border-black text-center">
                      <span className={`font-semibold ${
                        (reportData.reduce((sum, item) => sum + parseFloat(item.growth_rate || 0), 0) / reportData.length) > 0 ? 'text-green-600' :
                        (reportData.reduce((sum, item) => sum + parseFloat(item.growth_rate || 0), 0) / reportData.length) < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {((reportData.reduce((sum, item) => sum + parseFloat(item.growth_rate || 0), 0) / reportData.length) > 0 ? '+' : '')}
                        {(reportData.reduce((sum, item) => sum + parseFloat(item.growth_rate || 0), 0) / reportData.length).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
           {conclusion && (
            <div className="mt-3 w-full bg-[#EEEFE0] p-2 rounded">
                <span className="font-bold">Insights: </span><p className="my-1 !text-gray-700" dangerouslySetInnerHTML={{ __html: conclusion }}></p>
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
