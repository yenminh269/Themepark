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
  const [period, setPeriod] = useState("weekly"); // for customer_spikes

  // Clear report data when type changes
  useEffect(() => {
    setReportData(null);
    setConclusion("");
  }, [type]);

  const typeOption = [
    { value: 'new_customers', label: 'Number of New Customers Registered' },
    { value: 'avg_purchases', label: 'Average Number of Customer Purchase' },
    { value: 'customer_spikes', label: 'Spike in Average Number of Customers with Purchase Activity' }
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

    let conclusionText = `A total of <strong>${totalNew.toLocaleString()}</strong> new customers registered during this period, averaging <strong>${avgPerPeriod}</strong> registrations per day. `;
    const formattedDate = peakPeriod.sign_up_date?.split('T')[0] || peakPeriod.sign_up_date;
    conclusionText += `The highest registration was <strong>${peakPeriod.new_customer.toLocaleString()}</strong> new customers on ${formattedDate}.`;

    return conclusionText;
  };

  const generateAvgPurchasesConclusion = (data) => {
    if (!data || data.length === 0) return "";

    const item = data[0]; // Backend returns single row with aggregated data
    const avgCustomer = parseFloat(item.avg_customer || 0);

    let conclusionText = `During this period, there were <strong>${item.total_unique_customers?.toLocaleString() || 0}</strong> unique customers. `;
    conclusionText += `Store customers: <strong>${item.store_customers?.toLocaleString() || 0}</strong>, `;
    conclusionText += `Ride customers: <strong>${item.ride_customers?.toLocaleString() || 0}</strong>. `;
    conclusionText += `The average number of customers is <strong>${avgCustomer.toFixed(2)}</strong>.`;

    return conclusionText;
  };

  const generateCustomerSpikesConclusion = (data) => {
    if (!data || data.length === 0) return "";

    const spikes = data.filter(item => item.status === 'Spike');

    if (spikes.length === 0) {
      return "No significant spikes in customer numbers were detected during this period.";
    }

    const avgDuringSpikes = (spikes.reduce((sum, item) => sum + (item.num_customers || 0), 0) / spikes.length).toFixed(2);
    const maxSpike = Math.max(...spikes.map(item => item.num_customers || 0));
    const totalDays = data.length;
    const spikePercentage = ((spikes.length / totalDays) * 100).toFixed(1);

    let conclusionText = `<strong>${spikes.length}</strong> spike(s) detected out of ${totalDays} days (${spikePercentage}% of period). `;
    conclusionText += `During spike periods, the average number of customers during spike days was <strong>${avgDuringSpikes}</strong>, `;
    conclusionText += `with the highest spike reaching <strong>${maxSpike.toLocaleString()}</strong> customers.`;

    return conclusionText;
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
        ...(type === 'customer_spikes' && { period })
      };

      const data = await api.getCustomerReport(params);
      setReportData(data);

      // Generate conclusion based on report type
      if (type === 'new_customers') {
        setConclusion(generateNewCustomersConclusion(data));
      } else if (type === 'avg_purchases') {
        setConclusion(generateAvgPurchasesConclusion(data));
      } else if (type === 'customer_spikes') {
        setConclusion(generateCustomerSpikesConclusion(data));
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
      if (type === 'new_customers') reportTitle = 'NUMBER OF NEW CUSTOMERS REGISTERED REPORT';
      else if (type === 'avg_purchases') reportTitle = 'AVERAGE NUMBER OF CUSTOMER PURCHASE REPORT';
      else if (type === 'customer_spikes') reportTitle = 'SPIKE IN AVERAGE NUMBER OF CUSTOMERS WITH PURCHASE ACTIVITY';

      let reportText = `${reportTitle}
Generated: ${new Date().toLocaleString()}
Date Range: ${startDate} to ${endDate}
${type === 'customer_spikes' ? `Period: ${period.charAt(0).toUpperCase() + period.slice(1)}` : ''}

==============================
`;

      reportData.forEach((item, index) => {
        if (type === 'new_customers') {
          const formattedDate = item.sign_up_date?.split('T')[0] || item.sign_up_date;
          reportText += `Date: ${formattedDate}\n`;
          reportText += `  New Customers: ${item.new_customer?.toLocaleString() || 0}\n`;
          reportText += `  Cumulative Customers: ${item.cumulative_customers?.toLocaleString() || 0}\n\n`;
        } else if (type === 'avg_purchases') {
          reportText += `Store Customers: ${item.store_customers?.toLocaleString() || 0}\n`;
          reportText += `Ride Customers: ${item.ride_customers?.toLocaleString() || 0}\n`;
          reportText += `Total Unique Customers: ${item.total_unique_customers?.toLocaleString() || 0}\n`;
          reportText += `Average Customers: ${parseFloat(item.avg_customer || 0).toFixed(2)}\n\n`;
        } else if (type === 'customer_spikes') {
          const formattedDate = item.visit_date?.split('T')[0] || item.visit_date;
          reportText += `Date: ${formattedDate}\n`;
          reportText += `  Customer Count: ${item.num_customers?.toLocaleString() || 0}\n`;
          reportText += `  ${period === 'weekly' ? 'Week' : 'Month'} Average: ${parseFloat(item.avg_customers || 0).toFixed(2)}\n`;
          reportText += `  Status: ${item.status}\n\n`;
        }
      });

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
  <div className="w-full max-w-5xl mx-auto my-6">
    <form onSubmit={handleSubmit}
          className="flex flex-col px-5 rounded w-full mb-6"
          style={{ boxShadow: '-8px -8px 12px 8px rgba(0,0,0,0.25)' }}
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
      {type === 'customer_spikes' && (
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
          <div
            className="flex flex-col items-center justify-center p-6 mt-4 rounded w-full relative"
            style={{ boxShadow: '-8px -8px 12px 8px rgba(0,0,0,0.25)' }}
          >
            <button
              onClick={handleCloseReport}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              style={{ cursor: 'pointer' }}
              aria-label="Close report"
            >X
            </button>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#4B5945' }}>
              {type === 'new_customers' && 'Number of New Customers Registered Report'}
              {type === 'avg_purchases' && 'Average Number of Customer Purchase Report'}
              {type === 'customer_spikes' && 'Spike in Average Number of Customers with Purchase Activity'}
            </h3>

            <div className="overflow-x-auto w-full">
              <table className="mx-auto">
                <thead className="bg-[#176B87] text-white">
                  <tr>
                    {type === 'new_customers' && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold">Date</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">New Customers</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Cumulative Customers</th>
                      </>
                    )}
                    {type === 'avg_purchases' && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold">Store Customers</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Ride Customers</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Total Unique Customers</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Average Customers</th>
                      </>
                    )}
                    {type === 'customer_spikes' && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold">Date</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Customer Count</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">{period === 'weekly' ? 'Week' : 'Month'} Average</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr
                      key={index}
                    >
                      {type === 'new_customers' && (
                        <>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.sign_up_date?.split('T')[0] || item.sign_up_date}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.new_customer?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.cumulative_customers?.toLocaleString() || 0}
                          </td>
                        </>
                      )}
                      {type === 'avg_purchases' && (
                        <>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.store_customers?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.ride_customers?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.total_unique_customers?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {parseFloat(item.avg_customer || 0).toFixed(2)}
                          </td>
                        </>
                      )}
                      {type === 'customer_spikes' && (
                        <>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.visit_date?.split('T')[0] || item.visit_date}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.num_customers?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {parseFloat(item.avg_customers || 0).toFixed(2)}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            <span className={item.status === 'Spike' ? 'text-red-600 font-bold' : ''}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {conclusion && (
              <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: '#4B5945' }}>
                📝Insights
              </h4>
              <div className="bg-[#EEEFE0] p-4 rounded">
                <p className="my-2 text-gray-700" dangerouslySetInnerHTML={{ __html: conclusion }}></p>
              </div>
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
