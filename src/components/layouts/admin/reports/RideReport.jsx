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
        setError(error.message);
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

    // Find ride with most rides
    let mostPopularRide = null;
    let mostRides = 0;

    data.forEach(item => {
      if (parseFloat(item.percent_needing_maintenance) > highestPercentage) {
        highestPercentage = parseFloat(item.percent_needing_maintenance);
        highestMaintenanceRide = item.ride_name;
      }

      if (item.total_rides > mostRides) {
        mostRides = item.total_rides;
        mostPopularRide = item.ride_name;
      }
    });

    let conclusionText = "";

    if (highestMaintenanceRide && highestPercentage > 0) {
      const highestMaintenanceData = data.find(d => d.ride_name === highestMaintenanceRide);
      conclusionText += `<strong>${highestMaintenanceRide}</strong> has the highest maintenance rate at ${highestPercentage}% (${highestMaintenanceData.total_maintenance_count} maintenance records per ${highestMaintenanceData.total_rides.toLocaleString()} rides). `;
    }

    if (mostPopularRide) {
      conclusionText += `<strong>${mostPopularRide}</strong> is the most popular ride with ${mostRides.toLocaleString()} total rides.`;
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
          reportText += `  Total Revenue: $${item.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}\n\n`;
        } else if (type === 'total_maintenance') {
          reportText += `Ride: ${item.ride_name}\n`;
          reportText += `  Total Rides: ${item.total_rides?.toLocaleString() || 0}\n`;
          reportText += `  Maintenance Count: ${item.total_maintenance_count || 0}\n`;
          reportText += `  Maintenance Rate: ${parseFloat(item.percent_needing_maintenance || 0).toFixed(2)}%\n\n`;
        } else if (type === 'most_popular') {
          reportText += `Rank by Tickets: ${item.rank_by_tickets || index + 1}\n`;
          reportText += `Ride: ${item.ride_name}\n`;
          reportText += `  Total Tickets: ${item.total_rides?.toLocaleString() || 0}\n`;
          reportText += `  Total Orders: ${item.total_orders?.toLocaleString() || 0}\n`;
          reportText += `  Avg Tickets per Order: ${item.avg_tickets_per_order || '0.00'}\n`;
          reportText += `  Rank by Orders: ${item.rank_by_orders || '-'}\n\n`;
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
              <Select options={typeOption}
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
                        <th className="py-3 !px-6 border !border-black font-semibold">Year</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Month</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Day</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Ride Name</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Total Tickets</th>
                        <th className="py-3 !px-6 border !border-black font-semibold">Total Revenue</th>
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
                    <tr
                      key={index}
                    >
                      {type === 'total_rides' && (
                        <>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.year}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {monthNames[item.month - 1]}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.day}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500">
                            {item.name}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
                            {item.total_tickets?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 !px-6 border !border-gray-500 text-center">
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
            <p className="text-yellow-800">No ride data available.</p>
          </div>
        )}
  </div>

  );
}

export default RideReport;
