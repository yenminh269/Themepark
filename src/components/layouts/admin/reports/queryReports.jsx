import { useState } from "react";
import Input from '../../../input/Input';
import Form from 'react-bootstrap/Form';
import CustomButton from "../../../button/CustomButton";
import "../Add.css";
import { api } from '../../../../services/api';
import { useToast } from '@chakra-ui/react';

function CustomerSpending() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setReportData(null); // Clear report when month changes
    setError(null);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
    setReportData(null); // Clear report when year changes
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
      const data = await api.getCustomerStatsPerMonth(month, year);
      setReportData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch report data");
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = () => {
    if (!reportData) return;

    try {
      // Create a formatted report text
      const reportText = `CUSTOMER STATISTICS REPORT
        Month: ${month}/${year}
        Generated: ${new Date().toLocaleString()}

        ==============================
        Number of Customers: ${reportData.customerCount || 0}
        Average Ride Spending per Customer: $${reportData.avgSpending ? reportData.avgSpending.toFixed(2) : '0.00'}
        Total Revenue: $${reportData.totalRevenue ? reportData.totalRevenue.toFixed(2) : '0.00'}
        ==============================`;

      // Create a blob and download it
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-report-${month}-${year}.txt`;
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
        description: `Report saved as customer-report-${month}-${year}.txt`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error',
        description: 'Failed to save report. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
      <div className="w-full max-w-4xl">
        <Form
          onSubmit={handleSubmit}
          className="flex flex-col px-5 rounded w-full mb-6"
          style={{ boxShadow: '-8px -8px 12px 8px rgba(0,0,0,0.25)' }}
        >
          <h2 className="text-2xl font-bold mb-4 pt-3" style={{ color: '#4B5945' }}>
            Customer Statistics Report
          </h2>

          <p className="mb-4 text-md text-gray-600">
            Generate a report showing the number of customers and 
            average ride spending per customer for a specific month.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Input
              required
              type="number"
              label="Month (1-12)"
              className="custom-input"
              labelClassName="custom-form-label"
              value={month}
              onChange={handleMonthChange}
              min="1"
              max="12"
              placeholder="Enter month (1-12)"
            />
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
            {reportData && (
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
        </Form>

        {reportData && (
          <div
            className="bg-white p-4 mt-4 rounded w-full relative"
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
              Report Results - {month}/{year}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Number of Customers</div>
                <div className="text-3xl font-bold text-blue-700">
                  {reportData.customerCount || 0}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Average Spending</div>
                <div className="text-3xl font-bold text-green-700">
                  ${reportData.avgSpending ? reportData.avgSpending.toFixed(2) : '0.00'}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                <div className="text-3xl font-bold text-purple-700">
                  ${reportData.totalRevenue ? reportData.totalRevenue.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Generated on: {new Date().toLocaleString()}
            </div>
          </div>
        )}
      </div>
    
  );
}

export default CustomerSpending;
