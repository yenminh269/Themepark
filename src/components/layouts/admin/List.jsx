import { useState, useMemo, useEffect } from "react";
import DataTable from "../../data-table/DataTable";

function List({ ride = false, store = false, employee = false, schedule = false, onRideSelect }) {
  const [searchText, setSearchText] = useState("");
  const [isSchedule, setSchedule] = useState(false);

  useEffect(() => {
    setSchedule(schedule);
  }, [schedule])

  // Table headers
  const rideColumns = ['RideId', 'Name', 'Price', 'Capacity', 'Description', 'Status', 'Open Time', 'Close Time'];
  const storeColumns = ['StoreId', 'Name', 'Type', 'Open Time', 'Close Time'];
  const employeeColumns = ['Emp_Id', 'First Name', 'Last Name', 'Job Title', 'Email', 'Password' ,'Gender', 'Phone', 'SSN', 'Hire Date', 'Terminate Date'];

  // Example hardcoded data
  const rideData = [
    ['1','Roller Coaster','$0.05', 5, 'Fast ride', 'Approved', '8:00am', '10:00am'],
    ['2','Ferris Wheel','$0.05', 5, 'Slow ride', 'Pending', '8:00am', '12:00pm'],
    ['3','Carousel','$0.05', 5, 'Fun ride', 'Approved', '8:00am', '3:00pm'],
    ['4','Drop Tower','$0.05', 5, 'Exciting ride', 'Rejected', '8:00am', '9:00am']
  ];

  const storeData = [
    ['1','Food Court', 'food/drink', '9:00am', '9:00pm'],
    ['2','Gift Shop', 'merchandise', '9:00am', '9:00pm']
  ];

  const employeeData = [
    ['1', 'John', 'Doe', 'M', 'john@example.com', '****', 'Manager', '123-456', '111-22-3333', '2023-01-01', ''],
    ['2', 'Jane', 'Smith', 'F', 'jane@example.com', '****', 'Staff', '987-654', '222-33-4444', '2023-02-01', '']
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
    title = "Employee List";
  }

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(row =>
      row.some(cell => cell.toString().toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [data, searchText]);

  return (
    <div className="p-4">
      {!isSchedule && (<>

      {/* Search box */}
      <input
        type="text"
        placeholder={`Search ${title.toLowerCase()}...`}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="border rounded px-3 py-1 mb-4 w-full"
      />
      </>)}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        title={title}
        onRowSelect={onRideSelect}
      />
    </div>
  );
}

export default List;
