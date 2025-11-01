import { useState } from "react";
import Input from '../../../input/Input';
import CustomButton from "../../../button/CustomButton";
import "../Add.css";
import { api } from '../../../../services/api';
import { useToast } from '@chakra-ui/react';

function MostRiddenRide() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleYearChange = (e) => {
    setYear(e.target.value);
    setReportData(null);
    setError(null);
  };

  const handleCloseReport = () => {
    setReportData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const data = await api.getMostRiddenRides(year);
      setReportData(data);
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
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];

      // Create a formatted report text
      let reportText = `MOST RIDDEN RIDES PER MONTH REPORT
Year: ${year}
Generated: ${new Date().toLocaleString()}

==============================
`;

      reportData.forEach(item => {
        const monthName = monthNames[item.month - 1] || `Month ${item.month}`;
        reportText += `${monthName}: ${item.name} (${item.total_tickets} tickets)\n`;
      });

      reportText += '==============================';

      // Create a blob and download it
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `most-ridden-rides-report-${year}.txt`;
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
      <div className="w-full max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col px-5 rounded w-full mb-6"
          style={{ boxShadow: '-8px -8px 12px 8px rgba(0,0,0,0.25)' }}
        >
          <h2 className="text-2xl font-bold mb-4 pt-3" style={{ color: '#4B5945' }}>
            Most Ridden Rides per Month Report
          </h2>

          <p className="mb-4 text-md text-gray-600">
            Generate a report showing the most frequently ridden ride for each month
          </p>

          <div className="flex gap-4 flex-wrap mb-4">
            <Input
              required
              type="number"
              label="Year"
              className="custom-input"
              labelClassName="custom-form-label"
              value={year}
              onChange={handleYearChange}
              min="2020"
              max={new Date().getFullYear()}
              placeholder="Enter year"
            />
          </div>

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
            className=" flex flex-col items-center justify-center p-6 mt-4 rounded w-full relative"
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
              Most Ridden Rides by Month - {year}
            </h3>
            <table >
                <thead className="bg-[#4B5945] text-white">
                  <tr>
                    <th className="py-3 !px-6 border !border-black font-semibold">Month</th>
                    <th className="py-3 !px-6 border !border-black font-semibold">Most Popular Ride</th>
                    <th className="py-3 !px-6 border !border-black font-semibold">Total Tickets</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-[#EEF5FF]' : 'bg-[#91C8E4]'}
                    >
                      <td className="py-3 !px-6 border !border-gray-500">
                        {monthNames[item.month - 1] || `Month ${item.month}`}
                      </td>
                      <td className="py-3 !px-6 border !border-gray-500 font-medium">
                        {item.name}
                      </td>
                      <td className="py-3 !px-6 border !border-gray-500 text-center">
                        {item.total_tickets.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           

            <div className="mt-4 text-sm text-gray-700">
              Generated on: {new Date().toLocaleString()}
            </div>
          </div>
        )}

        {reportData && reportData.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
            <p className="text-yellow-800">No data available for most ridden rides.</p>
          </div>
        )}
      </div>

  );
}

export default MostRiddenRide;
