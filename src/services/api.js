const SERVER_URL = 'http://localhost:3001';
async function fetchAPI(endpoint){
    try{
        const response = await fetch(`${SERVER_URL}${endpoint}`);
        //get to the server then get error
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json(); // wait for the JSON to parse
        const data = json.data; // access the data
        return data;

    }catch(error){ //before get to the server
        console.error('API error:', error);
        throw error;
    }
}

//API methods
export const api = {
    //Get all the rides
    getAllRides: async() => {
        return await fetchAPI('/rides');
    },
    //Get all the employees under admin
    getAllEmployees: async() => {
        return await fetchAPI('/employees');
    },
    //Get all the maintenance schedule
    getAllMaintenances: async() => {
        return await fetchAPI('/maintenances');
    },
    //Get all inventory items
    getAllInventories: async() => {
        return await fetchAPI('/inventories')
    },
    //Get maintenance schedule by employee Id
    getEmployeeMaintenances: async() => {
        return await fetchAPI('/maintenances-employee/id');
    },
    //Get ride orders based on customer Id
    getRideOrders: async() => {
        return await fetchAPI('/rideorders/id');
    },
    //Get customer info based on customer Id

    
}