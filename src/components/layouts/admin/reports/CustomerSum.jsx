import { useEffect, useState } from "react";
import CustomButton from "../../../button/CustomButton";
import "../Add.css";
import { api } from '../../../../services/api';
import { useToast } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import Select from 'react-select';

function CustomerSummary() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [conclusion, setConclusion] = useState("");
  const toast = useToast();
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("summary"); // summary or daily
  const [period, setPeriod] = useState("weekly"); // for daily view

  // Clear report data when any form parameter changes
  useEffect(() => {
    setReportData(null);
    setConclusion("");
  }, [type, viewMode, period, startDate, endDate]);

  const typeOption = [
    { value: 'new_customers', label: 'Number of New Customers Registered' },
    { value: 'purchase_activity', label: 'Customer Purchase Activity' }
  ];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

  const handleCloseReport = () => {
    setReportData(null);
    setConclusion("");
  };

  const generateNewCustomersConclusion = (data) => {
    if (!data || data.length === 0) return "";

    const totalNew = data[data.length - 1].cumulative_customers || 0;
    const avgPerPeriod = (totalNew / data.length).toFixed(2);

    // Find peak period
    let peakPeriod = data[0];
    data.forEach(item => {
      if (item.new_customer > peakPeriod.new_customer) {
        peakPeriod = item;
      }
    });

    let conclusionText = `A total of <strong>${totalNew.toLocaleString()}</strong> new customers registered during this period, averaging <strong>${avgPerPeriod}</strong> registrations per day `;
    conclusionText += `(calculated as: ${totalNew.toLocaleString()} total customers ÷ ${data.length} days). `;
    const formattedDate = peakPeriod.sign_up_date?.split('T')[0] || peakPeriod.sign_up_date;
    conclusionText += `The highest registration was <strong>${peakPeriod.new_customer.toLocaleString()}</strong> new customers on ${formattedDate}.`;

    return conclusionText;
  };

  const generatePurchaseActivityConclusion = (data, mode) => {
    if (!data || data.length === 0) return "";

    if (mode === 'summary') {
      // Summary view conclusion
      const item = data[0]; // Backend returns single row with aggregated data
      const avgCustomer = parseFloat(item.avg_customer || 0);
      const totalUnique = item.total_unique_customers || 0;
      const numDays = item.num_days || 0;

      let conclusionText = `During this period, there were <strong>${totalUnique.toLocaleString()}</strong> unique customers. `;
      conclusionText += `Store customers: <strong>${item.store_customers?.toLocaleString() || 0}</strong>, `;
      conclusionText += `Ride customers: <strong>${item.ride_customers?.toLocaleString() || 0}</strong>. `;
      conclusionText += `<br/>The average number of customers per day is <strong>${avgCustomer.toFixed(2)}</strong> `;
      conclusionText += `(calculated as: ${totalUnique.toLocaleString()} unique customers ÷ ${numDays} days).`;

      return conclusionText;
    } else {
      // Daily breakdown conclusion
      const spikes = data.filter(item => item.status === 'Spike');
      const totalDays = data.length;

      if (spikes.length === 0) {
        const totalUnique = data.reduce((sum, item) => sum + (item.num_customers || 0), 0);
        const avgPerDay = (totalUnique / totalDays).toFixed(2);
        return `Analyzed ${totalDays} days with an average of <strong>${avgPerDay}</strong> unique customers per day. No significant spikes (>20% above ${period === 'weekly' ? 'week' : 'month'} average) were detected.`;
      }

      const avgDuringSpikes = (spikes.reduce((sum, item) => sum + (item.num_customers || 0), 0) / spikes.length).toFixed(2);
      const maxSpike = Math.max(...spikes.map(item => item.num_customers || 0));
      const spikePercentage = ((spikes.length / totalDays) * 100).toFixed(1);

      // Get period info from first item
      const periodType = period === 'weekly' ? 'week' : 'month';

      let conclusionText = `<strong>${spikes.length}</strong> spike(s) detected out of ${totalDays} days (${spikePercentage}% of period). `;
      conclusionText += `During spike periods, the average number of customers during spike days was <strong>${avgDuringSpikes}</strong>, `;
      conclusionText += `with the highest spike reaching <strong>${maxSpike.toLocaleString()}</strong> customers.`;
      conclusionText += `<br/><br/><strong>How it's calculated:</strong> `;
      conclusionText += `The ${periodType} average is computed from the daily unique customer count across all days in each ${periodType}. `;
      conclusionText += `A "Spike" is detected when a day's customer count exceeds the ${periodType} average by more than 20%.`;

      return conclusionText;
    }
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
        startDate,
        endDate,
        ...(type === 'purchase_activity' && { viewMode }),
        ...(type === 'purchase_activity' && viewMode === 'daily' && { period })
      };

      const data = await api.getCustomerReport(params);
      setReportData(data);

      // Generate conclusion based on report type
      if (type === 'new_customers') {
        setConclusion(generateNewCustomersConclusion(data));
      } else if (type === 'purchase_activity') {
        setConclusion(generatePurchaseActivityConclusion(data, viewMode));
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
      // Create a formatted report text based on report type
      let reportTitle = '';
      if (type === 'new_customers') {
        reportTitle = 'NUMBER OF NEW CUSTOMERS REGISTERED REPORT';
      } else if (type === 'purchase_activity') {
        reportTitle = viewMode === 'summary'
          ? 'CUSTOMER PURCHASE ACTIVITY REPORT - SUMMARY VIEW'
          : 'CUSTOMER PURCHASE ACTIVITY REPORT - DAILY BREAKDOWN';
      }

      let reportText = `${reportTitle}
Generated: ${new Date().toLocaleString()}
Date Range: ${startDate} to ${endDate}
${type === 'purchase_activity' && viewMode === 'daily' ? `Period: ${period.charAt(0).toUpperCase() + period.slice(1)}` : ''}

==============================
`;

      reportData.forEach((item, index) => {
        if (type === 'new_customers') {
          const formattedDate = item.sign_up_date?.split('T')[0] || item.sign_up_date;

          // Customer Details
          if (item.customer_details && item.customer_details.length > 0) {
            reportText += `\nNEW CUSTOMERS ON ${formattedDate} (${item.new_customer || 0} customers):\n`;
            reportText += `${'='.repeat(180)}\n`;
            reportText += `${'First Name'.padEnd(15)} | ${'Last Name'.padEnd(15)} | ${'Gender'.padEnd(8)} | ${'Email'.padEnd(30)} | ${'DOB'.padEnd(12)} | ${'Phone'.padEnd(15)} | ${'Created At'.padEnd(20)} | ${'Ride Purchase'.padEnd(15)} | ${'Store Purchase'.padEnd(15)}\n`;
            reportText += `${'-'.repeat(180)}\n`;

            item.customer_details.forEach(detail => {
              const firstName = (detail.first_name || '').substring(0, 15).padEnd(15);
              const lastName = (detail.last_name || '').substring(0, 15).padEnd(15);
              const gender = (detail.gender || '').padEnd(8);
              const email = (detail.email || '').substring(0, 30).padEnd(30);
              const dob = (detail.formatted_dob || '').padEnd(12);
              const phone = (detail.phone || '').padEnd(15);
              const createdAt = (detail.formatted_created_at || '').padEnd(10);
              const ridePurchase = (detail.has_ride_purchase || 'No').padEnd(15);
              const storePurchase = (detail.has_store_purchase || 'No').padEnd(15);

              reportText += `${firstName} | ${lastName} | ${gender} | ${email} | ${dob} | ${phone} | ${createdAt} | ${ridePurchase} | ${storePurchase}\n`;
            });
            reportText += `${'='.repeat(180)}\n\n`;
          }

          // Summary for this date
          reportText += `Date: ${formattedDate}\n`;
          reportText += `  New Customers: ${item.new_customer?.toLocaleString() || 0}\n`;
          reportText += `  Cumulative Customers: ${item.cumulative_customers?.toLocaleString() || 0}\n\n`;
        } else if (type === 'purchase_activity' && viewMode === 'summary') {
          // Store Customers Details
          if (item.store_customer_details && item.store_customer_details.length > 0) {
            reportText += `\nSTORE CUSTOMERS (${item.store_customers || 0}):\n`;
            reportText += `${'='.repeat(150)}\n`;
            reportText += `${'Customer Name'.padEnd(25)} | ${'Email'.padEnd(30)} | ${'Phone'.padEnd(15)} | ${'Order Date'.padEnd(12)} | ${'Amount'.padEnd(12)} | ${'Status'.padEnd(12)} | ${'Payment'.padEnd(15)}\n`;
            reportText += `${'-'.repeat(150)}\n`;

            item.store_customer_details.forEach(detail => {
              const customerName = `${detail.first_name} ${detail.last_name}`.substring(0, 25).padEnd(25);
              const email = (detail.email || '').substring(0, 30).padEnd(30);
              const phone = (detail.phone || '').padEnd(15);
              const orderDate = (detail.formatted_order_date || '').padEnd(12);
              const amount = `$${detail.total_amount?.toFixed(2) || '0.00'}`.padEnd(12);
              const status = (detail.status || '').padEnd(12);
              const payment = (detail.payment_method || '').padEnd(15);

              reportText += `${customerName} | ${email} | ${phone} | ${orderDate} | ${amount} | ${status} | ${payment}\n`;
            });
            reportText += `${'='.repeat(150)}\n\n`;
          }

          // Ride Customers Details
          if (item.ride_customer_details && item.ride_customer_details.length > 0) {
            reportText += `\nRIDE CUSTOMERS (${item.ride_customers || 0}):\n`;
            reportText += `${'='.repeat(130)}\n`;
            reportText += `${'Customer Name'.padEnd(25)} | ${'Email'.padEnd(30)} | ${'Phone'.padEnd(15)} | ${'Order Date'.padEnd(12)} | ${'Amount'.padEnd(12)} | ${'Status'.padEnd(12)}\n`;
            reportText += `${'-'.repeat(130)}\n`;

            item.ride_customer_details.forEach(detail => {
              const customerName = `${detail.first_name} ${detail.last_name}`.substring(0, 25).padEnd(25);
              const email = (detail.email || '').substring(0, 30).padEnd(30);
              const phone = (detail.phone || '').padEnd(15);
              const orderDate = (detail.formatted_order_date || '').padEnd(12);
              const amount = `$${detail.total_amount?.toFixed(2) || '0.00'}`.padEnd(12);
              const status = (detail.status || '').padEnd(12);

              reportText += `${customerName} | ${email} | ${phone} | ${orderDate} | ${amount} | ${status}\n`;
            });
            reportText += `${'='.repeat(130)}\n\n`;
          }

          // Summary Section
          reportText += `\n${'='.repeat(80)}\n`;
          reportText += `SUMMARY:\n`;
          reportText += `${'-'.repeat(80)}\n`;
          reportText += `Total Store Customers:      ${item.store_customers?.toLocaleString() || 0}\n`;
          reportText += `Total Ride Customers:       ${item.ride_customers?.toLocaleString() || 0}\n`;
          reportText += `Total Unique Customers:     ${item.total_unique_customers?.toLocaleString() || 0}\n`;
          reportText += `Number of Days:             ${item.num_days || 0}\n`;
          reportText += `Average Customers per Day:  ${parseFloat(item.avg_customer || 0).toFixed(2)}\n`;
          reportText += `  (Calculated as: ${item.total_unique_customers?.toLocaleString() || 0} unique customers ÷ ${item.num_days || 0} days)\n`;
          reportText += `${'='.repeat(80)}\n\n`;
        } else if (type === 'purchase_activity' && viewMode === 'daily') {
          const formattedDate = item.visit_date?.split('T')[0] || item.visit_date;

          // Store Orders Details
          if (item.store_order_details && item.store_order_details.length > 0) {
            reportText += `\nSTORE ORDERS ON ${formattedDate} (${item.store_customer_count || 0} unique customers):\n`;
            reportText += `${'='.repeat(150)}\n`;
            reportText += `${'Customer Name'.padEnd(25)} | ${'Email'.padEnd(30)} | ${'Phone'.padEnd(15)} | ${'Order Time'.padEnd(20)} | ${'Amount'.padEnd(12)} | ${'Status'.padEnd(12)} | ${'Payment'.padEnd(15)}\n`;
            reportText += `${'-'.repeat(150)}\n`;

            item.store_order_details.forEach(detail => {
              const customerName = `${detail.first_name} ${detail.last_name}`.substring(0, 25).padEnd(25);
              const email = (detail.email || '').substring(0, 30).padEnd(30);
              const phone = (detail.phone || '').padEnd(15);
              const orderTime = (detail.formatted_order_date || '').padEnd(10);
              const amount = `$${detail.total_amount?.toFixed(2) || '0.00'}`.padEnd(12);
              const status = (detail.status || '').padEnd(12);
              const payment = (detail.payment_method || '').padEnd(15);

              reportText += `${customerName} | ${email} | ${phone} | ${orderTime} | ${amount} | ${status} | ${payment}\n`;
            });
            reportText += `${'='.repeat(150)}\n\n`;
          }

          // Ride Orders Details
          if (item.ride_order_details && item.ride_order_details.length > 0) {
            reportText += `\nRIDE ORDERS ON ${formattedDate} (${item.ride_customer_count || 0} unique customers):\n`;
            reportText += `${'='.repeat(130)}\n`;
            reportText += `${'Customer Name'.padEnd(25)} | ${'Email'.padEnd(30)} | ${'Phone'.padEnd(15)} | ${'Order Time'.padEnd(20)} | ${'Amount'.padEnd(12)} | ${'Status'.padEnd(12)}\n`;
            reportText += `${'-'.repeat(130)}\n`;

            item.ride_order_details.forEach(detail => {
              const customerName = `${detail.first_name} ${detail.last_name}`.substring(0, 25).padEnd(25);
              const email = (detail.email || '').substring(0, 30).padEnd(30);
              const phone = (detail.phone || '').padEnd(15);
              const orderTime = (detail.formatted_order_date || '').padEnd(10);
              const amount = `$${detail.total_amount?.toFixed(2) || '0.00'}`.padEnd(12);
              const status = (detail.status || '').padEnd(12);

              reportText += `${customerName} | ${email} | ${phone} | ${orderTime} | ${amount} | ${status}\n`;
            });
            reportText += `${'='.repeat(130)}\n\n`;
          }

          // Summary for this date
          reportText += `Date: ${formattedDate}\n`;
          reportText += `  Total Unique Customers: ${item.num_customers?.toLocaleString() || 0}\n`;
          reportText += `  Store Customers: ${item.store_customer_count || 0}\n`;
          reportText += `  Ride Customers: ${item.ride_customer_count || 0}\n`;
          reportText += `  ${period === 'weekly' ? 'Week' : 'Month'} Average: ${parseFloat(item.avg_customers || 0).toFixed(2)}\n`;
          reportText += `    (Calculated from ${item.days_in_week || item.days_in_month || 0} days in this ${period === 'weekly' ? 'week' : 'month'})\n`;
          reportText += `  Status: ${item.status}${item.status === 'Spike' ? ' (>20% above average)' : ''}\n\n`;
        }
      });

      // Add grand total for new_customers report
      if (type === 'new_customers' && reportData.length > 0) {
        const totalCumulative = reportData[reportData.length - 1]?.cumulative_customers || 0;

        reportText += `==============================\n`;
        reportText += `GRAND TOTAL:\n`;
        reportText += `  Total Cumulative Customers: ${totalCumulative.toLocaleString()}\n`;
      }

      reportText += `==============================\n`;
      if (conclusion) {
        reportText += `${conclusion.replace(/<\/?strong>/g, '').replace(/<br\s*\/?>/g, '\n')}\n`;
        reportText += '==============================';
      }

      // Create a blob and download it
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const reportTypeSlug = type.replace(/_/g, '-');
      a.download = `customer-${reportTypeSlug}-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      // Show success message
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
          style={{ boxShadow: '-8px -5px 12px 5px rgba(0,0,0,0.25)' }}
    >
      <h2 className="text-2xl text-center font-extrabold mb-4 pt-3" style={{ color: '#4B5945' }}>
         Customer Activity Report
      </h2>
      <div className="flex gap-4">
       <FormControl isRequired>
           <FormLabel color="#4B5945" fontWeight="500">Type</FormLabel>
              <Select options={typeOption}
                placeholder="Select report type"
                 className="custom-react-select"
                  classNamePrefix="react-select"
                 onChange={(option) => setType(option.value)}
            />
         </FormControl>
      </div>

      {type === 'purchase_activity' && (
        <div className="mt-3">
          <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">View Mode</FormLabel>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="viewMode"
                  value="summary"
                  checked={viewMode === 'summary'}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="w-4 h-4 text-[#176B87] focus:ring-[#176B87]"
                />
                <span style={{ color: '#4B5945' }}>Summary</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="viewMode"
                  value="daily"
                  checked={viewMode === 'daily'}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="w-4 h-4 text-[#176B87] focus:ring-[#176B87]"
                />
                <span style={{ color: '#4B5945' }}>Daily Breakdown</span>
              </label>
            </div>
          </FormControl>
        </div>
      )}

      {type === 'purchase_activity' && viewMode === 'daily' && (
        <div className="mt-3">
          <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">Period</FormLabel>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="period"
                  value="weekly"
                  checked={period === 'weekly'}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-4 h-4 text-[#176B87] focus:ring-[#176B87]"
                />
                <span style={{ color: '#4B5945' }}>Weekly</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="period"
                  value="monthly"
                  checked={period === 'monthly'}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-4 h-4 text-[#176B87] focus:ring-[#176B87]"
                />
                <span style={{ color: '#4B5945' }}>Monthly</span>
              </label>
            </div>
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
              >Save Report
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
    <div className="flex flex-col items-center justify-center p-6 mt-4 rounded w-full relative" >
      <button onClick={handleCloseReport}
              className="px-1 !border !border-gray-700 !rounded-sm absolute top-2 right-4 text-gray-500 text-2xl font-bold"
              style={{ cursor: 'pointer' }}
              aria-label="Close report"
      >X</button>
      <h3 className="bg-white border !border-gray-500 px-4 py-3 text-xl font-bold mb-4">
       {type === 'new_customers' && 'Number of New Customers Registered Report'}
         {type === 'purchase_activity' && viewMode === 'summary' && 'Customer Purchase Activity Report - Summary View'}
        {type === 'purchase_activity' && viewMode === 'daily' && 'Customer Purchase Activity Report - Daily Breakdown'}
      </h3>
      <div className="overflow-x-auto w-full">
         <table className="mx-auto">
                <thead className="bg-gray-500 text-white">
                  <tr>
                    {type === 'new_customers' && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Date</th>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">New Customers</th>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Cumulative Customers</th>
                      </>
                    )}
                    {type === 'purchase_activity' && viewMode === 'summary' && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Store Customers</th>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Ride Customers</th>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Total Unique Customers</th>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Average Customers</th>
                      </>
                    )}
                    {type === 'purchase_activity' && viewMode === 'daily' && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Date</th>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Unique Customer Count</th>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">{period === 'weekly' ? 'Week' : 'Month'} Average</th>
                        <th className="py-3 !px-6 border !border-black font-semibold text-center">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                {reportData.map((item, index) => (
                    <>
                      {type === 'new_customers' && (
                        <>
                          {/* Customer Details */}
                          {item.customer_details && item.customer_details.length > 0 && (
                            <tr key={`${index}-details`}>
                              <td colSpan="3" className=" !py-4 border !border-gray-500 bg-gray-50">
                                <div className="pl-4">
                                  <table className="min-w-full border-collapse">
                                    <thead className="bg-[#91C8E4]">
                                      <tr>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">First Name</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Last Name</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Gender</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Email</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">DOB</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Phone</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Created At</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Ride Purchase</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Store Purchase</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.customer_details.map((detail, detailIndex) => (
                                        <tr key={detailIndex} className="hover:bg-gray-100">
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.first_name}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.last_name}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.gender}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.email}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_dob}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.phone}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_created_at}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm text-center">
                                            <span className={detail.has_ride_purchase === 'Yes' ? '!text-[#66785F] font-semibold' : '!text-red-600'}>
                                              {detail.has_ride_purchase}
                                            </span>
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm text-center">
                                            <span className={detail.has_store_purchase === 'Yes' ? '!text-[#66785F] font-semibold' : '!text-red-600'}>
                                              {detail.has_store_purchase}
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

                          {/* Summary Row */}
                          <tr key={`${index}-summary`} className="bg-blue-100 font-semibold">
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.sign_up_date?.split('T')[0] || item.sign_up_date}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.new_customer?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.cumulative_customers?.toLocaleString() || 0}
                            </td>
                          </tr>
                        </>
                      )}
                      {type === 'purchase_activity' && viewMode === 'summary' && (
                        <>
                          {/* Store Customers Detail */}
                          {item.store_customer_details && item.store_customer_details.length > 0 && (
                            <tr key={`${index}-store-details`}>
                              <td colSpan="4" className="!px-6 !py-4 border !border-gray-500 bg-gray-50">
                                <div className="pl-4">
                                  <h4 className="font-semibold text-gray-700 mb-3">Store Customers ({item.store_customers || 0}):</h4>
                                  <table className="min-w-full border-collapse">
                                    <thead className="!bg-[#91C8E4]">
                                      <tr>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Customer Name</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Email</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Phone</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Order Date</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Total Amount</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Status</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Payment Method</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.store_customer_details.map((detail, detailIndex) => (
                                        <tr key={detailIndex} className="hover:bg-gray-100">
                                          <td className="py-2 px-4 border border-gray-300 text-sm">
                                            {detail.first_name} {detail.last_name}
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.email}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.phone}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_order_date}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm text-right">
                                            ${detail.total_amount?.toFixed(2) || '0.00'}
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.status}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.payment_method}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Ride Customers Detail */}
                          {item.ride_customer_details && item.ride_customer_details.length > 0 && (
                            <tr key={`${index}-ride-details`}>
                              <td colSpan="4" className="!px-6 !py-4 border !border-gray-500 bg-gray-50">
                                <div className="pl-4">
                                  <h4 className="font-semibold text-gray-700 mb-3">Ride Customers ({item.ride_customers || 0}):</h4>
                                  <table className="min-w-full border-collapse">
                                    <thead className="bg-green-200">
                                      <tr>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Customer Name</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Email</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Phone</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Order Date</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Total Amount</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.ride_customer_details.map((detail, detailIndex) => (
                                        <tr key={detailIndex} className="hover:bg-gray-100">
                                          <td className="py-2 px-4 border border-gray-300 text-sm">
                                            {detail.first_name} {detail.last_name}
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.email}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.phone}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_order_date}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm text-right">
                                            ${detail.total_amount?.toFixed(2) || '0.00'}
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.status}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                          {/* Summary Row */}
                          <tr key={`${index}-summary`} className="bg-gray-500 border-t-4 text-white">
                            <td className="py-4 !px-6 border !border-gray-500 font-bold text-center">
                              Total Store Customers
                            </td>
                            <td className="py-4 !px-6 border !border-gray-500 font-bold text-center">
                              Total Ride Customers
                            </td>
                            <td className="py-4 !px-6 border !border-gray-500 font-bold text-center">
                              Total Unique Customers
                            </td>
                            <td className="py-4 !px-6 border !border-gray-500 font-bold text-center">
                              Average Customers
                            </td>
                          </tr>
                          <tr key={`${index}-summary-values`} className="bg-[white]">
                            <td className="py-4 !px-6 border !border-gray-500 text-center font-semibold text-lg">
                              {item.store_customers?.toLocaleString() || 0}
                            </td>
                            <td className="py-4 !px-6 border !border-gray-500 text-center font-semibold text-lg">
                              {item.ride_customers?.toLocaleString() || 0}
                            </td>
                            <td className="py-4 !px-6 border !border-gray-500 text-center font-semibold text-lg">
                              {item.total_unique_customers?.toLocaleString() || 0}
                            </td>
                            <td className="py-4 !px-6 border !border-gray-500 text-center font-semibold text-lg">
                              {parseFloat(item.avg_customer || 0).toFixed(2)}
                            </td>
                          </tr>
                        </>
                      )}
                      {type === 'purchase_activity' && viewMode === 'daily' && (
                        <>
                          {/* Store Orders Detail */}
                          {item.store_order_details && item.store_order_details.length > 0 && (
                            <tr key={`${index}-store-details`}>
                              <td colSpan="4" className="!px-6 !py-4 border !border-gray-500 bg-gray-50">
                                <div className="pl-4">
                                  <h5 className="font-semibold text-gray-700 mb-3">Store Orders ({item.store_customer_count || 0} unique customers):</h5>
                                  <table className="min-w-full border-collapse">
                                    <thead className="bg-[#91C8E4]">
                                      <tr>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Customer Name</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Email</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Phone</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Order Time</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Total Amount</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Status</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Payment Method</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.store_order_details.map((detail, detailIndex) => (
                                        <tr key={detailIndex} className="hover:bg-gray-100">
                                          <td className="py-2 px-4 border border-gray-300 text-sm">
                                            {detail.first_name} {detail.last_name}
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.email}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.phone}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_order_date}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm text-right">
                                            ${detail.total_amount?.toFixed(2) || '0.00'}
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.status}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.payment_method}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Ride Orders Detail */}
                          {item.ride_order_details && item.ride_order_details.length > 0 && (
                            <tr key={`${index}-ride-details`}>
                              <td colSpan="4" className="!px-6 !py-4 border !border-gray-500 bg-gray-50">
                                <div className="pl-4">
                                  <h5 className="font-bold text-gray-700 mb-3">Ride Orders ({item.ride_customer_count || 0} unique customers):</h5>
                                  <table className="min-w-full border-collapse">
                                    <thead className="bg-green-200">
                                      <tr>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Customer Name</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Email</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Phone</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Order Time</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Total Amount</th>
                                        <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.ride_order_details.map((detail, detailIndex) => (
                                        <tr key={detailIndex} className="hover:bg-gray-100">
                                          <td className="py-2 px-4 border border-gray-300 text-sm">
                                            {detail.first_name} {detail.last_name}
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.email}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.phone}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_order_date}</td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm text-right">
                                            ${detail.total_amount?.toFixed(2) || '0.00'}
                                          </td>
                                          <td className="py-2 px-4 border border-gray-300 text-sm">{detail.status}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Summary Row */}
                          <tr key={`${index}-summary`} className="bg-blue-100 font-semibold">
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.visit_date?.split('T')[0] || item.visit_date}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.num_customers?.toLocaleString() || 0}
                              <div className="text-xs text-gray-600 font-normal">
                                (Store: {item.store_customer_count || 0}, Ride: {item.ride_customer_count || 0})
                              </div>
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {parseFloat(item.avg_customers || 0).toFixed(2)}
                              <div className="text-xs text-gray-600 font-normal">
                                ({item.days_in_week || item.days_in_month || 0} days in {period === 'weekly' ? 'week' : 'month'})
                              </div>
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              <span className={item.status === 'Spike' ? '!text-red-600 font-bold' : ''}>
                                {item.status}
                              </span>
                              {item.status === 'Spike' && (
                                <div className="text-xs text-gray-600 font-normal">
                                  (&gt;20% above avg)
                                </div>
                              )}
                            </td>
                          </tr>
                        </>
                      )}
                    </>
                  ))}

               
                </tbody>
              </table>
                {/* Grand Total Summary Row for new_customers */}
               {type === 'new_customers' && reportData.length > 0 && (
                   <div  className="bg-white my-3 text-black py-3 !pr-8 border !border-gray-500 !text-right font-bold text-xl">
                      Total Cumulative Customers: {reportData[reportData.length - 1]?.cumulative_customers?.toLocaleString() || 0}
                   </div>
                )}
         </div>
          {conclusion && (
            <div className="mt-3 w-full bg-[#EEEFE0] p-2 rounded">
                <span className="font-bold">Insights: </span><p className="my-1 !text-gray-700" dangerouslySetInnerHTML={{ __html: conclusion }}></p>
              </div>
            )}

            <div className=" text-sm text-gray-700">
              Generated on: {new Date().toLocaleString()}
            </div>
          </div>
        )}

        {reportData && reportData.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
            <p className="text-yellow-800">No customer data available.</p>
          </div>
        )}
  </div>

  );
}

export default CustomerSummary;
