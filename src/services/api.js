const SERVER_URL =
  import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3001';


async function fetchAPI(endpoint, data = null, fetchMethod = "GET", isFormData = false) {
    try {
        const options = { method: fetchMethod };
        if (data) {
            if (isFormData) {
                // For forms with images
                options.body = data; // Browser handles Content-Type
            } else {
                options.headers = { "Content-Type": "application/json" };
                options.body = JSON.stringify(data);
            }
        }
        const response = await fetch(`${SERVER_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle both response formats
        if (result.success === false) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result.data || result;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

// Get full img url
export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${SERVER_URL}${path}`;
};

// API methods
export const api = {
    // ===== RIDES =====
    getAllRides: async () => {
        return await fetchAPI('/rides');
    },
    addRide: async (formData) => {
        return await fetchAPI('/ride/add', formData, "POST", true);
    },
    scheduleRideMaint: async (formData) => {
        return await fetchAPI('/ride-maintenance', formData, "POST", false);
    },

    // ===== EMPLOYEES =====
    getAllEmployees: async () => {
        return await fetchAPI('/employees');
    },
    getMaintEmployees: async () => {
        return await fetchAPI('/employees/maintenance');
    },
    addEmployee: async (formData) => {
        return await fetchAPI('/employees/add', formData, "POST", false);
    },
    updateEmployee: async (formData, id) => {
        return await fetchAPI(`/employees/${id}`, formData, "PUT", false);
    },
    deleteEmployee: async (id) => {
        return await fetchAPI(`/employees/${id}`, null, "DELETE", false);
    },
    employeeLogin: async (formData) => {
        return await fetchAPI('/employee/login', formData, "POST", false);
    },

    // ===== STORES =====
    getAllStores: async () => {
        return await fetchAPI('/stores');
    },
    addStore: async (formData) => {
        return await fetchAPI('/store/add', formData, "POST", true);
    },
    updateStore: async (formData, id) => {
        return await fetchAPI(`/store/${id}`, formData, "PUT", false);
    },
    deleteStore: async (id) => {
        return await fetchAPI(`/store/${id}`, null, "DELETE", false);
    },

    // ===== MAINTENANCE =====
    getAllMaintenances: async () => {
        return await fetchAPI('/maintenances');
    },
    getEmployeeMaintenances: async () => {
        return await fetchAPI('/maintenances-employee/id');
    },

    // ===== INVENTORY =====
    getAllInventories: async () => {
        return await fetchAPI('/inventories');
    },

    // ===== RIDE ORDERS =====
    getRideOrders: async () => {
        return await fetchAPI('/rideorders/id');
    },
};

// =======================
// CUSTOMER AUTH HELPERS
// =======================

function setCustomerToken(token) {
    if (token) {
        localStorage.setItem('customer_token', token);
    } else {
        localStorage.removeItem('customer_token');
    }
}

function getCustomerToken() {
    return localStorage.getItem('customer_token');
}

// CREATE ACCOUNT (SIGNUP)
export async function signupCustomer({
    first_name,
    last_name,
    gender,
    email,
    password,
    dob,
    phone,
}) {
    const res = await fetch(`${SERVER_URL}/api/customer/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            first_name,
            last_name,
            gender,
            email,
            password,
            dob,
            phone,
        }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Signup failed');
    }

    const body = await res.json();
    setCustomerToken(body.token);
    return body.customer;
}

// LOG IN
export async function loginCustomer({ email, password }) {
    const res = await fetch(`${SERVER_URL}/api/customer/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Login failed');
    }

    const body = await res.json();
    setCustomerToken(body.token);
    return body.customer;
}

// RESTORE SESSION / WHO AM I
export async function fetchCurrentCustomer() {
    const token = getCustomerToken();
    if (!token) return null;

    const res = await fetch(`${SERVER_URL}/api/customer/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        setCustomerToken(null);
        return null;
    }

    const body = await res.json();
    return body.customer;
}

// LOG OUT
export function logoutCustomer() {
    setCustomerToken(null);
}