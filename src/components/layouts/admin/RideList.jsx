import DataTable from "../../input/data-table/DataTable";
function RideList(){
    const rideListAttr = ['RideId', 'Name', 'Price', 'Capacity', 'Description', 'Status', 'Open Time', 'Close Time'];
    const rideDetailed = [
    ['1','abc','$0.05', 5, 'abc', 'Approved', '8:00am', '10:00'],
    ['2','abc','$0.05', 5, 'abc', 'Pending', '8:00am', '12:00'],
    ['3', 'abc','$0.05', 5, 'abc','Approved', '8:00am', '3:00'],
    ['4','abc','$0.05', 5, 'abc', 'Rejected', '8:00am', '9:00']
  ];
    return (
    <DataTable
        title="Ride Lists"
        columns={rideListAttr}
        data={rideDetailed}
    />
    )
}
export default RideList;