import  { useState, useEffect } from "react";
import PageFooter from "./PageFooter";
import "../customer/Homepage.css";
import { api } from "../../../services/api";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import {  MdStore } from "react-icons/md";
import { TbRollercoaster } from "react-icons/tb";
import { GrHostMaintenance } from "react-icons/gr";
import Loading from "../admin/loading/Loading";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rides, setRides] = useState([]);
  const [stores, setStores] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ridesData, storesData, maintenanceData] = await Promise.all([
          api.getAllRidesExceptPhoto(),
          api.getAllStoresExceptPhoto(),
          api.getRideMaintenanceSchedules()
        ]);
        setRides(ridesData);
        setStores(storesData);
        setMaintenanceSchedules(maintenanceData);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar data
  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getWeekData = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay(); // First day is Sunday

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i));
      week.push(new Date(day));
    }

    return week;
  };

  // Check if a date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Get schedule info for a specific date and day of week
  const getScheduleForDate = (date) => {
    if (!date) return null;

    const dayOfWeek = date.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dayOfWeek];

    // Format the date for comparison (YYYY-MM-DD)
    const dateString = date.toISOString().split('T')[0];

    // Separate rides into categories based on their status and scheduled maintenance
    const maintenanceRides = [];
    const openRides = [];

    rides.forEach(ride => {
      if (ride.status === 'maintenance') {
        // Find the maintenance schedule for this ride
        const schedule = maintenanceSchedules.find(m => m.ride_id === ride.ride_id);

        if (schedule) {
          // Compare the scheduled_date with the current date
          const scheduledDate = new Date(schedule.scheduled_date).toISOString().split('T')[0];

          if (scheduledDate === dateString) {
            // This ride is under maintenance on this specific date
            maintenanceRides.push(ride);
          } else {
            // This ride has maintenance status but is not scheduled for this date, so it's open
            openRides.push(ride);
          }
        } else {
          // No schedule found, treat as open
          openRides.push(ride);
        }
      } else if (ride.status === 'open') {
        openRides.push(ride);
      }
    });

    const openStores = stores.filter(store => store.status === 'open');
    const closedItems = [...rides.filter(r => r.status === 'closed'), ...stores.filter(s => s.status === 'closed')];

    return {
      dayName,
      openRides,
      openStores,
      maintenanceRides,
      closedItems,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    };
  };

  // Format time string
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Convert HH:MM:SS to HH:MM
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const days = viewMode === 'month' ? getMonthData() : getWeekData();
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="!bg-white !rounded-2xl !shadow-2xl !overflow-hidden">
        {/* Calendar Header */}
        <div className="!grid !grid-cols-7 !bg-[#749BC2] !text-white !font-bold !text-center">
          {dayHeaders.map(day => (
            <div key={day} className="!p-4 !text-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className={`!grid !grid-cols-7 !gap-0 ${viewMode === 'month' ? '!min-h-[600px]' : ''}`}>
          {days.map((date, index) => {
            const scheduleInfo = getScheduleForDate(date);

            return (
              <div
                key={index}
                className={`!border !border-gray-200 !p-3 !min-h-[120px] ${
                  !date ? '!bg-gray-50' :
                  isToday(date) ? '!bg-[#FFFBDE]' :
                  scheduleInfo?.isWeekend ? '!bg-[#EEF5FF]' : '!bg-white'
                } hover:!border-[#4682A9] !transition-shadow`}
              >
                {date && (
                  <>
                    {/* Date Number */}
                    <div className={`!text-right !font-bold !mb-2 ${
                      isToday(date) ? '!text-[#176B87] !text-2xl' : '!text-gray-700 !text-lg'
                    }`}>
                      {date.getDate()}
                      {isToday(date) && (
                        <span className="!ml-2 !text-xs !bg-[#176B87] !text-white !px-2 !py-1 !rounded-full">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Schedule Summary */}
                    <div className="!text-xs !space-y-1">
                      {scheduleInfo?.openRides.length > 0 && (
                        <button
                          onClick={() => setSelectedDateDetails({
                            date: date,
                            type: 'openRides',
                            items: scheduleInfo.openRides
                          })}
                          className="!flex !items-center !gap-1 !text-green-700 hover:!underline !cursor-pointer !w-full !text-left"
                        >
                          <TbRollercoaster  className="!text-sm" />
                          <span>{scheduleInfo.openRides.length} Rides Open</span>
                        </button>
                      )}

                      {scheduleInfo?.openStores.length > 0 && (
                        <button
                          onClick={() => setSelectedDateDetails({
                            date: date,
                            type: 'openStores',
                            items: scheduleInfo.openStores
                          })}
                          className="!flex !items-center !gap-1 !text-blue-700 hover:!underline !cursor-pointer !w-full !text-left"
                        >
                          <MdStore className="!text-sm" />
                          <span>{scheduleInfo.openStores.length} Stores Open</span>
                        </button>
                      )}

                      {scheduleInfo?.maintenanceRides.length > 0 && (
                        <button
                          onClick={() => setSelectedDateDetails({
                            date: date,
                            type: 'maintenanceRides',
                            items: scheduleInfo.maintenanceRides
                          })}
                          className="!flex !items-center !gap-1 !text-orange-600 hover:!underline !cursor-pointer !w-full !text-left"
                        >
                          <GrHostMaintenance />
                          <span>{scheduleInfo.maintenanceRides.length} Under Maintenance</span>
                        </button>
                      )}

                      {scheduleInfo?.closedItems.length > 0 && (
                        <button
                          onClick={() => setSelectedDateDetails({
                            date: date,
                            type: 'closedItems',
                            items: scheduleInfo.closedItems
                          })}
                          className="!flex !items-center !gap-1 !text-red-600 hover:!underline !cursor-pointer !w-full !text-left"
                        >
                          <span>🔒</span>
                          <span>{scheduleInfo.closedItems.length} Closed</span>
                        </button>
                      )}

                      {/* Extended hours for weekends */}
                      {scheduleInfo?.isWeekend && (
                        <div className="!mt-2 !text-[#176B87] !font-semibold">
                          ⭐ Extended Hours
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="!min-h-screen !flex !flex-col !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
        <main className="!flex-1 !flex !items-center !justify-center">
          <Loading />
          <p className="!text-lg !text-[#176B87]">Loading schedule...</p>
        </main>
        <PageFooter />
      </div>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
      <main className="!flex-1 !relative">
        <div className="!max-w-7xl !mx-auto !px-6 !py-6">
          {/* Header Section */}
          <div className="!text-center !mb-8">
            <div className="!inline-block !px-6 !py-3 !bg-[#4682A9] !rounded-full !text-white !font-semibold !mb-6 !shadow-lg">
              Plan Your Visit
            </div>
            <h3 className="!text-4xl md:!text-5xl !font-black !mb-4 !text-[#176B87]">
              <FaCalendarAlt className="!inline !mr-3 !mb-2" />
              Park Schedule
            </h3>
            <p className="!text-xl !text-gray-700 !max-w-2xl !mx-auto">
              Browse our calendar to see ride and store operating hours throughout the month
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="!flex !justify-center !gap-4 !mb-6">
            <button
              onClick={() => setViewMode('month')}
              className={`!px-6 !py-2 !rounded-lg !font-semibold !transition ${
                viewMode === 'month'
                  ? '!bg-[#176B87] !text-white'
                  : '!bg-white !text-[#176B87] !border !border-[#176B87]'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`!px-6 !py-2 !rounded-lg !font-semibold !transition ${
                viewMode === 'week'
                  ? '!bg-[#176B87] !text-white'
                  : '!bg-white !text-[#176B87] !border !border-[#176B87]'
              }`}
            >
              Week View
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="!flex !justify-between !items-center !mb-6 !bg-white !rounded-xl !p-4 !shadow-lg">
            <button
              onClick={viewMode === 'month' ? goToPreviousMonth : goToPreviousWeek}
              className="!px-4 !py-2 !bg-[#176B87] !text-white !rounded-lg hover:!opacity-90 !transition !flex !items-center !gap-2"
            >
              <FaChevronLeft /> Previous
            </button>

            <div className="!text-center">
              <h2 className="!text-2xl !font-bold !text-[#749BC2]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToToday}
                className="!text-sm !text-gray-600 hover:!text-[#176B87] !underline !mt-1"
              >
                Go to Today
              </button>
            </div>

            <button
              onClick={viewMode === 'month' ? goToNextMonth : goToNextWeek}
              className="!px-4 !py-2 !bg-[#176B87] !text-white !rounded-lg hover:!opacity-90 !transition !flex !items-center !gap-2"
            >
              Next <FaChevronRight />
            </button>
          </div>

          {/* Calendar Grid */}
          {renderCalendarGrid()}

          {/* Details Modal */}
          {selectedDateDetails && (
            <div
              className="!fixed !inset-0 !bg-black/60 !bg-opacity-50 !flex !items-center !justify-center !z-50 !p-4"
              onClick={() => setSelectedDateDetails(null)}
            >
              <div
                className="!bg-white !rounded-2xl !shadow-2xl !max-w-2xl !w-full  !overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="!bg-[#B4D4FF] !p-2 !flex !justify-between !items-center">
                  <div className="!pl-60">
                    <h3 className="!text-[#4682A9] !text-2xl !font-bold">
                      {selectedDateDetails.type === 'openRides' && 'Open Rides '}
                      {selectedDateDetails.type === 'openStores' && 'Open Stores'}
                      {selectedDateDetails.type === 'maintenanceRides' && 'Under Maintenance'}
                      {selectedDateDetails.type === 'closedItems' && 'Closed Items'}
                    </h3>
                    <p className="!text-sm !text-gray-600 !mt-2 p-0">
                      {selectedDateDetails.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDateDetails(null)}
                    className="!text-white !text-3xl !font-bold hover:!opacity-55 !transition"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Body */}
                <div className="!p-6 !overflow-y-auto !max-h-[calc(80vh-120px)]">
                  <div className="!space-y-3">
                    {selectedDateDetails.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`!p-4 !rounded-lg !border-2 ${
                          selectedDateDetails.type === 'openRides'
                            ? '!bg-green-50 !border-green-200'
                            : selectedDateDetails.type === 'openStores'
                            ? '!bg-blue-50 !border-blue-200'
                            : selectedDateDetails.type === 'maintenanceRides'
                            ? '!bg-orange-50 !border-orange-200'
                            : '!bg-red-50 !border-red-200'
                        }`}
                      >
                        <div className="!flex !items-start !justify-between">
                          <div className="!flex-1">
                            <h4 className="!font-bold !text-lg !text-gray-800 !mb-1">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="!text-sm !text-gray-600">
                                {item.description}
                              </p>
                            )}
                            {(selectedDateDetails.type === 'openRides' || selectedDateDetails.type === 'openStores') && item.open_time && item.close_time && (
                              <div className="!text-sm !font-semibold !text-gray-700">
                                🕐 {formatTime(item.open_time)} - {formatTime(item.close_time)}
                              </div>
                            )}
                            {selectedDateDetails.type === 'openRides' && item.capacity && (
                              <div className="!text-xs !text-gray-500 !mt-1">
                                Capacity: {item.capacity}
                              </div>
                            )}
                            {selectedDateDetails.type === 'openStores' && item.type && (
                              <div className="!text-xs !text-gray-500 !mt-1 !capitalize">
                                Type: {item.type.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="!bg-gray-50 !p-4 py-10 !flex !justify-end">
                  <button
                    onClick={() => setSelectedDateDetails(null)}
                    className="!px-6 !py-2 !bg-[#4682A9] !text-white !rounded-lg hover:!opacity-90 !transition !font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Information Box */}
          <div className="!mt-8 !bg-white !rounded-xl !p-6 !shadow-lg">
            <h3 className="!text-xl !font-bold !text-[#176B87] !mb-3">
              Schedule Information
            </h3>
            <ul className="!text-gray-700 !space-y-2 !list-disc !list-inside">
              <li>Operating hours may vary based on weather conditions and special events</li>
              <li>Weekend hours (Friday-Saturday) are typically extended for your convenience</li>
              <li>Rides under maintenance are temporarily unavailable for safety checks</li>
              <li>Check back regularly for schedule updates and special holiday hours</li>
            </ul>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
