import { useEffect, useState } from "react";
import CustomButton from "../../../button/CustomButton";
import "../Add.css";
import { api } from '../../../../services/api';
import { useToast } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import Select from 'react-select';

function RideReport() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [conclusion, setConclusion] = useState("");
  const toast = useToast();
  const [group, setGroup] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [rideOption, setRideOption] = useState([]);

  // Clear report data when type, group, or name changes
  useEffect(() => {
    setReportData(null);
    setConclusion("");
  }, [type, group, name]);

  const groupOption = [
  { value: 'all', label: 'All Rides' },
  { value: 'ride', label: 'Specific Ride' },
  ];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const typeOption = [
  { value: 'total_rides', label: 'Total Rides Taken and Revenue' },
  { value: 'total_maintenance', label: 'Total Maintenance Activities' },
  { value: 'most_popular', label: 'Most Popular Ride' }
  ];

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const rides = await api.getRidesNames();
        // Transform the data to match react-select format
        const rideOptions = rides.map(ride => ({
          value: ride.name,
          label: ride.name
        }));
        setRideOption(rideOptions);
      } catch (error) {
        console.error("Error fetching rides:", error);
        // Don't block the form, just show empty ride options
        setRideOption([]);
      }
    };
    fetchRides();
  }, []);

  const handleCloseReport = () => {
    setReportData(null);
    setConclusion("");
  };

  const generateMaintenanceConclusion = (data) => {
    if (!data || data.length === 0) return "";

    // Find ride with highest maintenance percentage
    let highestMaintenanceRide = null;
    let highestPercentage = 0;

    data.forEach(item => {
      if (parseFloat(item.percent_needing_maintenance) > highestPercentage) {
        highestPercentage = parseFloat(item.percent_needing_maintenance);
        highestMaintenanceRide = item.ride_name;
      }
    });

    let conclusionText = "";

    if (highestMaintenanceRide && highestPercentage > 0) {
      const highestMaintenanceData = data.find(d => d.ride_name === highestMaintenanceRide);
      conclusionText += `<strong>${highestMaintenanceRide}</strong> has the highest maintenance rate at ${highestPercentage}% (${highestMaintenanceData.total_maintenance_count} maintenance records per ${highestMaintenanceData.total_rides.toLocaleString()} rides). `;
    }
    return conclusionText;
  };

  const generateMostPopularConclusion = (data) => {
    if (!data || data.length === 0) return "";

    const topRide = data[0]; // Already sorted by total_rides DESC
    const totalRides = data.reduce((sum, item) => sum + (item.total_rides || 0), 0);
    const topRidePercentage = ((topRide.total_rides / totalRides) * 100).toFixed(2);

    let conclusionText = `<strong>${topRide.ride_name}</strong> is the most popular ride with ${topRide.total_rides.toLocaleString()} total tickets sold, representing ${topRidePercentage}% of all ride tickets in this period. `;

    if (topRide.total_orders) {
      conclusionText += `This ride had ${topRide.total_orders.toLocaleString()} orders with an average of ${topRide.avg_tickets_per_order} tickets per order.`;
    }

    // Add insight about top 3 rides if there are multiple
    if (data.length >= 3) {
      const top3Total = data.slice(0, 3).reduce((sum, item) => sum + (item.total_rides || 0), 0);
      const top3Percentage = ((top3Total / totalRides) * 100).toFixed(2);
      conclusionText += `<br><br>The top 3 most popular rides account for ${top3Percentage}% of all tickets sold.`;
    }

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
        group,
        type,
        startDate,
        endDate,
        ...(group === 'ride' && name && { rideName: name })
      };

      const data = await api.getRideReport(params);
      setReportData(data);

      // Generate conclusion based on report type
      if (type === 'total_maintenance') {
        setConclusion(generateMaintenanceConclusion(data));
      } else if (type === 'most_popular') {
        setConclusion(generateMostPopularConclusion(data));
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
      if (type === 'total_rides') reportTitle = 'TOTAL RIDES TAKEN AND REVENUE REPORT';
      else if (type === 'total_maintenance') reportTitle = 'TOTAL MAINTENANCE ACTIVITIES REPORT';
      else if (type === 'most_popular') reportTitle = 'MOST POPULAR RIDE REPORT';

      let reportText = `${reportTitle}
Generated: ${new Date().toLocaleString()}
Date Range: ${startDate} to ${endDate}
${group === 'ride' && name ? `Ride: ${name}` : 'All Rides'}

==============================
`;

      reportData.forEach((item, index) => {
        if (type === 'total_rides') {
          reportText += `Date: ${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}\n`;
          reportText += `  Ride: ${item.name}\n`;
          reportText += `  Total Tickets: ${item.total_tickets?.toLocaleString() || 0}\n`;
          reportText += `  Total Revenue: $${item.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}\n`;

          // Add detailed transaction information
          if (item.details && item.details.length > 0) {
            reportText += `\n  Transaction Details:\n`;
            reportText += `  ${'='.repeat(80)}\n`;
            reportText += `  ${'Order ID'.padEnd(12)} | ${'Order Date'.padEnd(20)} | ${'Tickets'.padEnd(8)} | ${'Price/Ticket'.padEnd(13)} | ${'Subtotal'.padEnd(10)}\n`;
            reportText += `  ${'-'.repeat(80)}\n`;

            let totalTickets = 0;
            let totalRevenue = 0;

            item.details.forEach(detail => {
              const orderId = String(detail.order_id).padEnd(12);
              const orderDate = (detail.formatted_order_date || '').padEnd(10);
              const tickets = String(detail.number_of_tickets).padEnd(8);
              const pricePerTicket = `$${detail.price_per_ticket?.toFixed(2) || '0.00'}`.padEnd(13);
              const subtotal = `$${detail.subtotal?.toFixed(2) || '0.00'}`.padEnd(10);

              reportText += `  ${orderId} | ${orderDate} | ${tickets} | ${pricePerTicket} | ${subtotal}\n`;

              totalTickets += detail.number_of_tickets || 0;
              totalRevenue += detail.subtotal || 0;
            });

            // Add summary row
            reportText += `  ${'-'.repeat(80)}\n`;
            const totalLabel = 'Total:'.padEnd(35);
            const totalTicketsStr = String(totalTickets).padEnd(8);
            const totalRevenueStr = `$${totalRevenue.toFixed(2)}`.padEnd(10);
            reportText += `  ${totalLabel} | ${totalTicketsStr} | ${'-'.padEnd(13)} | ${totalRevenueStr}\n`;
            reportText += `  ${'='.repeat(80)}\n`;
          }
          reportText += `\n`;
        } else if (type === 'total_maintenance') {
          reportText += `Ride: ${item.ride_name}\n`;
          reportText += `  Total Rides: ${item.total_rides?.toLocaleString() || 0}\n`;
          reportText += `  Maintenance Count: ${item.total_maintenance_count || 0}\n`;
          reportText += `  Maintenance Rate: ${parseFloat(item.percent_needing_maintenance || 0).toFixed(2)}%\n`;

          // Add detailed maintenance information
          if (item.maintenance_details && item.maintenance_details.length > 0) {
            reportText += `\n  Maintenance Details:\n`;
            reportText += `  ${'='.repeat(130)}\n`;
            reportText += `  ${'Maint ID'.padEnd(10)} | ${'Description'.padEnd(25)} | ${'Scheduled'.padEnd(12)} | ${'Status'.padEnd(12)} | ${'Employee Name'.padEnd(20)} | ${'Work Date'.padEnd(12)} | ${'Hours'.padEnd(8)}\n`;
            reportText += `  ${'-'.repeat(130)}\n`;

            item.maintenance_details.forEach(detail => {
              const maintId = String(detail.maintenance_id).padEnd(10);
              const description = (detail.description || 'N/A').substring(0, 25).padEnd(25);
              const scheduledDate = (detail.formatted_scheduled_date || '').padEnd(12);
              const status = (detail.status || '').padEnd(12);
              const employeeName = (detail.first_name && detail.last_name
                ? `${detail.first_name} ${detail.last_name}`
                : '-').substring(0, 20).padEnd(20);
              const workDate = (detail.formatted_work_date || '-').padEnd(12);
              const hoursWorked = String(detail.worked_hour || '-').padEnd(8);

              reportText += `  ${maintId} | ${description} | ${scheduledDate} | ${status} | ${employeeName} | ${workDate} | ${hoursWorked}\n`;
            });
            reportText += `  ${'='.repeat(130)}\n`;
          }
          reportText += `\n`;
        } else if (type === 'most_popular') {
          reportText += `Rank by Tickets: ${item.rank_by_tickets || index + 1}\n`;
          reportText += `Ride: ${item.ride_name}\n`;
          reportText += `  Total Tickets: ${item.total_rides?.toLocaleString() || 0}\n`;
          reportText += `  Total Orders: ${item.total_orders?.toLocaleString() || 0}\n`;
          reportText += `  Avg Tickets per Order: ${item.avg_tickets_per_order || '0.00'}\n`;
          reportText += `  Rank by Orders: ${item.rank_by_orders || '-'}\n\n`;
        }
      });

      // Add grand total for total_rides report
      if (type === 'total_rides' && reportData.length > 0) {
        const grandTotalTickets = reportData.reduce((sum, item) => sum + (item.total_tickets || 0), 0);
        const grandTotalRevenue = reportData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);

        reportText += `==============================\n`;
        reportText += `GRAND TOTAL:\n`;
        reportText += `  Total Tickets: ${grandTotalTickets.toLocaleString()}\n`;
        reportText += `  Total Revenue: $${grandTotalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
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
      a.download = `ride-${reportTypeSlug}-report-${new Date().toISOString().split('T')[0]}.txt`;
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
         Ride Activity Report
      </h2>
      <div className="flex gap-4">
        <FormControl isRequired>
          <FormLabel color="#4B5945" fontWeight="500">Group</FormLabel>
             <Select options={groupOption}
                 placeholder="Select group"
                className="custom-react-select"
                classNamePrefix="react-select"
               onChange={(option) => setGroup(option.value)}
             />
       </FormControl>
       <FormControl isRequired>
            <FormLabel color="#4B5945" fontWeight="500">Type</FormLabel>
               <Select options={group === 'all' ? typeOption : typeOption.filter(opt => opt.value !== 'most_popular')}
                 placeholder="Select group"
                  className="custom-react-select"
                   classNamePrefix="react-select"
                  onChange={(option) => setType(option.value)}
             />
          </FormControl>
      </div>
      {group === 'ride' && (
      <div className="mt-2 flex-1">
        <FormControl isRequired>
          <FormLabel color="#4B5945" fontWeight="500">Ride Name</FormLabel>
           <Select options={rideOption}
                 placeholder="Select ride"
                className="custom-react-select"
                classNamePrefix="react-select"
               onChange={(option) => setName(option.value)}
             />
          </FormControl>
      </div>
      )}
      <div className="flex gap-2 justify-between">
                <FormControl isRequired>
                  <FormLabel color="#4B5945" fontWeight="500">Activity date from</FormLabel>
                  <input
                    type="date"
                    className="custom-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="#4B5945" fontWeight="500">Activity date to</FormLabel>
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
              {type === 'total_rides' && '📋Total Rides Taken and Revenue Report'}
              {type === 'total_maintenance' && '📋Total Maintenance Activities Report'}
              {type === 'most_popular' && '📋Most Popular Ride Report'}
            </h3>

            <div className="overflow-x-auto w-full">
              <table className="mx-auto">
                <thead className="bg-[#176B87] text-white">
                  <tr>
                    {type === 'total_rides' && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold" colSpan="4">Date & Ride</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Total Tickets</th>
                        <th className="py-3 !px-6 border !border-black font-semibold" colSpan="2">Total Revenue</th>
                      </>
                    )}
                    {(type === 'total_maintenance') && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold">Ride Name</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Total Rides</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Maintenance Count</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Maintenance Rate (%)</th>
                      </>
                    )}
                    {type === 'most_popular' && (
                      <>
                        <th className="py-3 !px-6 border !border-black font-semibold">Rank by Tickets</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Ride Name</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Total Tickets</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Total Orders</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Avg Tickets/Order</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Rank by Orders</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <>
                      {/* Transaction Details Row - Display BEFORE the summary row */}
                      {type === 'total_rides' && item.details && item.details.length > 0 && (
                        <tr key={`${index}-details`}>
                          <td colSpan="7" className="!px-6 !py-4 border !border-gray-500 bg-gray-50">
                            <div className="pl-8">
                              <h4 className="font-semibold text-gray-700 mb-3">Transaction Details:</h4>
                              <table className="min-w-full border-collapse">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Order ID</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Order Date</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Number of Tickets</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Price per Ticket</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.details.map((detail, detailIndex) => (
                                    <tr key={detailIndex} className="hover:bg-gray-100">
                                      <td className="py-2 px-4 border border-gray-300 text-sm">{detail.order_id}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_order_date}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm text-center">{detail.number_of_tickets}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm text-right">${detail.price_per_ticket?.toFixed(2)}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm text-right">${detail.subtotal?.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                  {/* Summary row for details */}
                                  <tr className="bg-blue-100 font-semibold">
                                    <td colSpan="2" className="py-2 px-4 border border-gray-400 text-sm text-right">Total:</td>
                                    <td className="py-2 px-4 border border-gray-400 text-sm text-center">
                                      {item.details.reduce((sum, detail) => sum + (detail.number_of_tickets || 0), 0)}
                                    </td>
                                    <td className="py-2 px-4 border border-gray-400 text-sm text-right">-</td>
                                    <td className="py-2 px-4 border border-gray-400 text-sm text-right">
                                      ${item.details.reduce((sum, detail) => sum + (detail.subtotal || 0), 0).toFixed(2)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Maintenance Details Row - Display BEFORE the summary row */}
                      {type === 'total_maintenance' && item.maintenance_details && item.maintenance_details.length > 0 && (
                        <tr key={`${index}-maintenance-details`}>
                          <td colSpan="4" className="!px-6 !py-4 border !border-gray-500 bg-gray-50">
                            <div className="pl-8">
                              <h4 className="font-semibold text-gray-700 mb-3">Maintenance Details:</h4>
                              <table className="min-w-full border-collapse">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Maintenance ID</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Description</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Scheduled Date</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Status</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Employee Name</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Work Date</th>
                                    <th className="py-2 px-4 border border-gray-400 text-left text-sm font-semibold">Hours Worked</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.maintenance_details.map((detail, detailIndex) => (
                                    <tr key={detailIndex} className="hover:bg-gray-100">
                                      <td className="py-2 px-4 border border-gray-300 text-sm">{detail.maintenance_id}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm">{detail.description || 'N/A'}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_scheduled_date}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm">{detail.status}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm">
                                        {detail.first_name && detail.last_name ? `${detail.first_name} ${detail.last_name}` : '-'}
                                      </td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm">{detail.formatted_work_date || '-'}</td>
                                      <td className="py-2 px-4 border border-gray-300 text-sm text-center">{detail.worked_hour || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Summary Row */}
                      <tr
                        key={index}
                        className={type === 'total_rides' ? 'bg-blue-50 font-semibold' : type === 'total_maintenance' ? 'bg-blue-50 font-semibold' : ''}
                      >
                        {type === 'total_rides' && (
                          <>
                            <td className="py-3 !px-6 border !border-gray-500 text-center" colSpan="4">
                              Summary for {item.year} {monthNames[item.month - 1]} {item.day} - {item.name}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.total_tickets?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center" colSpan="2">
                              ${item.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </td>
                          </>
                        )}
                      {(type === 'total_maintenance') && (
                        <>
                          <td className="py-3 !px-6 border !border-gray-500">
                            {item.ride_name}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.total_rides?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.total_maintenance_count || 0}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {parseFloat(item.percent_needing_maintenance || 0).toFixed(2)}%
                          </td>
                        </>
                      )}
                        {type === 'most_popular' && (
                          <>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.rank_by_tickets || index + 1}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500">
                              {item.ride_name}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.total_rides?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.total_orders?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.avg_tickets_per_order?.toLocaleString() || '0.00'}
                            </td>
                            <td className="py-3 !px-6 border !border-gray-500 text-center">
                              {item.rank_by_orders || '-'}
                            </td>
                          </>
                        )}
                      </tr>
                    </>
                  ))}

                  {/* Grand Total Summary Row at the end of the report for total_rides */}
                  {type === 'total_rides' && reportData.length > 0 && (
                    <tr className="bg-green-100 border-t-4 border-green-600">
                      <td colSpan="4" className="py-4 !px-6 border !border-gray-500 text-right font-bold text-lg">
                        GRAND TOTAL:
                      </td>
                      <td className="py-4 !px-6 border !border-gray-500 text-center font-bold text-lg">
                        {reportData.reduce((sum, item) => sum + (item.total_tickets || 0), 0).toLocaleString()}
                      </td>
                      <td colSpan="2" className="py-4 !px-6 border !border-gray-500 text-center font-bold text-lg">
                        ${reportData.reduce((sum, item) => sum + (item.total_revenue || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
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
            <p className="text-yellow-800">No ride data available.</p>
          </div>
        )}
  </div>

  );
}

export default RideReport;
