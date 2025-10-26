const SERVER_URL = 'http://localhost:3001';
async function fetchAPI(endpoint, data = null, fetchMethod = "GET", isFormData = false){
    try{
        const options = {method: fetchMethod};
        if(data){
            if(isFormData){
                options.body = data; ; // don't set Content-Type, browser will handle it
            }
            else{
            options.headers = { "Content-Type": "application/json" },
            options.body = JSON.stringify(data);
            }
        }

        const response = await fetch(`${SERVER_URL}${endpoint}`,options);
        //get to the server then get error
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json(); // wait for the JSON to parse
        return json.data || json;;
    }catch(error){ //before get to the server
        console.error('API error:', error);
        throw error;
    }
}
//get full img url
export const getImageUrl = (path) => {
    if (!path) return '';
    // If path already has http/https, return as is
    if (path.startsWith('http')) return path;
    // Otherwise, prepend server URL
    return `${SERVER_URL}${path}`;
};

//API methods
export const api = {
    //Get all the rides
    getAllRides: async() => {
        return await fetchAPI('/rides');
    },
    //Add the ride
    addRide: async(formData) =>{
        return await fetchAPI('/ride/add', formData, "POST", true);
    },
    //Get all the employees
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