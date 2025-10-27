import DataTable from '../../../data-table/DataTable';
import { Box } from '@chakra-ui/react';
import { api } from '../../../../services/api';
import { useState, useEffect, useMemo } from 'react';
import Loading from '../loading/loading';

function RideLists() {
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [searchText, setSearchText] = useState('');

  const RideAttr = [
    'Ride Id', 'Ride Name', 'Price', 'Capacity', 'Description',
    'Status', 'Open Time', 'Close Time', 'Date Added'
  ];

  const columnKeys = [
    'ride_id', 'name', 'price', 'capacity', 'description', 'status',
    'open_time', 'close_time', 'created_at'
  ];

  useEffect(() => {
    const fetchRide = async () => {
      try {
        setLoading(true);
        const response = await api.getAllRides();
        setRides(response);
      } catch (err) {
        console.error('Failed to load rides:', err);
        alert('Failed to load rides. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, []);



  const filteredData = useMemo(() => {
    if (!searchText) return rides;
    const normalizedSearch = searchText.toLowerCase().trim();
    return rides.filter(rideObj =>
      columnKeys.some(key =>
        rideObj[key]?.toString().toLowerCase().includes(normalizedSearch)
      )
    );
  }, [rides, searchText]);

  const formattedData = filteredData.map(rideObj =>
    columnKeys.map(key => {
      if (key === 'created_at' && rideObj[key])
        return new Date(rideObj[key]).toLocaleDateString();
      if ((key === 'open_time' || key === 'close_time') && rideObj[key]) {
        const [hour, minute] = rideObj[key].split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return `${displayHour}:${minute} ${ampm}`;  // e.g., "8:00 PM"
        }

      return rideObj[key] ?? '';
    })
  );

  const handleEdit = (id, row) => {
    console.log('Edit clicked for ID:', id);
    console.log('Full row data:', row);
  };

  const handleDelete = (id, row) => {
    if (window.confirm(`Are you sure you want to delete ${row[1]}?`)) {
      console.log('Delete clicked for ID:', id);
    }
  };
    //Conditional rendering AFTER hooks
    if (loading) return <Loading isLoading={loading} />;

  return (
    <Box position="relative" p={4}>
      <input
        type="text"
        placeholder="Search rides..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="border rounded px-3 py-1 mb-4 w-full"
      />
      <DataTable
        title="Rides"
        columns={RideAttr}
        data={formattedData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
}

export default RideLists;
