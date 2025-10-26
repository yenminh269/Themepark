import { useState, useMemo, useEffect } from "react";
import DataTable from "../../data-table/DataTable";
import { Box, IconButton, HStack } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';


function List({ ride = false, store = false, schedule = false, onRideSelect, maintenance, onAddMaintenance }) {
  const [searchText, setSearchText] = useState("");
  const [isSchedule, setSchedule] = useState(false);
  const [isAdd, setAdd] = useState(false);

  useEffect(() => {
    setSchedule(schedule);
  }, [schedule])

  // Table headers
  const rideColumns = ['RideId', 'Name', 'Price', 'Capacity', 'Description', 'Status', 'Open Time', 'Close Time'];
  const storeColumns = ['StoreId', 'Name', 'Type', 'Open Time', 'Close Time'];

  // Example hardcoded data
  const rideData = [
    ['1', 'Roller Coaster', '$0.05', 5, 'Fast ride', 'Approved', '8:00am', '10:00am'],
    ['2', 'Ferris Wheel', '$0.05', 5, 'Slow ride', 'Pending', '8:00am', '12:00pm'],
    ['3', 'Carousel', '$0.05', 5, 'Fun ride', 'Approved', '8:00am', '3:00pm'],
    ['4', 'Drop Tower', '$0.05', 5, 'Exciting ride', 'Rejected', '8:00am', '9:00am']
  ];

  const storeData = [
    ['1', 'Food Court', 'food/drink', '9:00am', '9:00pm'],
    ['2', 'Gift Shop', 'merchandise', '9:00am', '9:00pm']
  ];


  // Select columns and data based on prop
  let columns = [];
  let data = [];
  let title = "";

  if (ride) {
    columns = rideColumns;
    data = rideData;
    title = "Ride List";
  } else if (store) {
    columns = storeColumns;
    data = storeData;
    title = "Store List";
  } else if (employee) {
    columns = employeeColumns;
    data = employeeData;
    title = maintenance || "Employee List";
  }

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(row =>
      row.some(cell => cell.toString().toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [data, searchText]);

  const handleEdit = (id, row) => {
    console.log('Edit clicked for ID:', id);
    console.log('Full row data:', row);
    setAdd(true);
  };

  const handleDelete = (id, row) => {
    console.log('Delete clicked for ID:', id);
    if (window.confirm(`Are you sure you want to delete ${row[1]}?`)) {
      // Implement delete logic here
    }
  };

  return (
    <Box position="relative" p={4}>
      {!isSchedule ? (
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="border rounded px-3 py-1 mb-4 w-full"
        />
      ) : onAddMaintenance ? (
        <HStack justify="flex-end" mb={4}>
          <IconButton
            icon={<AddIcon />}
            size="lg"
            colorScheme="green"
            bg="#3A6F43"
            color="white"
            borderRadius="full"
            boxShadow="lg"
            aria-label="Add Maintenance"
            onClick={onAddMaintenance}
            _hover={{
              bg: "#2d5734",
              transform: "scale(1.1)",
            }}
            _active={{
              transform: "scale(0.95)",
            }}
            transition="all 0.2s"
          />
        </HStack>
      ) : null}

      <DataTable
        columns={columns}
        data={filteredData}
        title={title}
        onRowSelect={onRideSelect}
        onEdit={!isSchedule ? handleEdit : undefined}
        onDelete={!isSchedule ? handleDelete : undefined}
      />
    </Box>
  );
}

export default List;