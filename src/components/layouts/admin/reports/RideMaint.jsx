import { useState } from "react";
import CustomButton from "../../../button/CustomButton";
import "../Add.css";
import { api } from '../../../../services/api';
import { useToast } from '@chakra-ui/react';

function RideMaint() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [conclusion, setConclusion] = useState("");
  const toast = useToast();

  const handleCloseReport = () => {
    setReportData(null);
    setConclusion("");
  };

  const generateConclusion = (data) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReportData(null);
    setConclusion("");

    try {
      const data = await api.getRideMaintenanceReport();
      setReportData(data);
      setConclusion(generateConclusion(data));
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
      // Create a formatted report text
      let reportText = `RIDE MAINTENANCE REPORT
Generated: ${new Date().toLocaleString()}

==============================
`;

      reportData.forEach(item => {
        reportText += `Ride: ${item.ride_name}\n`;
        reportText += `  Total Rides: ${item.total_rides.toLocaleString()}\n`;
        reportText += `  Maintenance Count: ${item.total_maintenance_count}\n`;
        reportText += `  Maintenance Rate: ${item.percent_needing_maintenance}%\n\n`;
      });

      reportText += `==============================\n`;
      reportText += `${conclusion}\n`;
      reportText += '==============================';

      // Create a blob and download it
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ride-maintenance-report-${new Date().toISOString().split('T')[0]}.txt`;
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
      <div className="w-full max-w-5xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col px-5 rounded w-full mb-6"
          style={{ boxShadow: '-8px -8px 12px 8px rgba(0,0,0,0.25)' }}
        >
          <h2 className="text-2xl font-bold mb-4 pt-3" style={{ color: '#4B5945' }}>
            Ride Maintenance Report
          </h2>

          <p className="mb-4 text-md text-gray-700">
            Generate a report showing ride usage statistics and maintenance frequency
          </p>

          <div className="flex justify-center gap-3 mt-4">
            <CustomButton
              text={loading ? "Generating..." : "View Report"}
              className="custom-button"
              disabled={loading}
            />
            {reportData && reportData.length > 0 && (
              <button
                type="button"
                onClick={handleSaveReport}
                className="btn-custom mb-4 bg-[#6B8E6F] text-white px-5 py-2 rounded-md hover:bg-[#5b7e5f] transition"
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
            style={{ boxShadow: '-8px -8px 12px rgba(0,0,0,0.25)' }}
          >
            <button
              onClick={handleCloseReport}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              style={{ cursor: 'pointer' }}
              aria-label="Close report"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#4B5945' }}>
              Ride Maintenance Analysis
            </h3>

            <div className="overflow-x-auto w-full">
              <table className="mx-auto">
                <thead className="bg-[#4B5945] text-white">
                  <tr>
                    <th className="py-3 !px-6 border !border-black font-semibold">Ride Name</th>
                    <th className="py-3 !px-6 border !border-black font-semibold">Total Rides</th>
                    <th className="py-3 !px-6 border !border-black font-semibold">Maintenance Count</th>
                    <th className="py-3 !px-6 border !border-black font-semibold">Maintenance Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-[#EEF5FF]' : 'bg-[#91C8E4]'}
                    >
                      <td className="py-3 !px-6 border !border-gray-500">
                        {item.ride_name}
                      </td>
                      <td className="py-3 !px-6 border !border-gray-500 text-center">
                        {item.total_rides.toLocaleString()}
                      </td>
                      <td className="py-3 !px-6 border !border-gray-500 text-center">
                        {item.total_maintenance_count}
                      </td>
                      <td className="py-3 !px-6 border !border-gray-500 text-center">
                        {parseFloat(item.percent_needing_maintenance).toFixed(2)}%
                      </td>
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
            <p className="text-yellow-800">No ride maintenance data available.</p>
          </div>
        )}
      </div>

  );
}

export default RideMaint;
