const SERVER_URL = 'http://localhost:3001';
async function fetchAPI(endpoint){
    try{
        const response = await fetch(`${SERVER_URL}${endpoint}`);

        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if(!result.success){
            throw new Error(result.message || 'API request failed');
        }
        return result.data;

    }catch(error){
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