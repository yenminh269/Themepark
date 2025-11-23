export const SERVER_URL =
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
            // Try to parse error message from response body
            const errorData = await response.json();
            const errorMessage = errorData.message || errorData.error || `HTTP error! Status: ${response.status}`;
            throw new Error(errorMessage);
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


// Get placeholder image for rides
const getRidePlaceholderImage = (rideName = '') => {
    return 'https://via.placeholder.com/400x250?text=' + encodeURIComponent(rideName || 'Ride Image');
};

// Get full img url with fallback
export const getImageUrl = (path, rideName = '') => {
    if (!path) return getRidePlaceholderImage(rideName);
    if (path.startsWith('http')) return path;
    return `${SERVER_URL}${path}`;
};

// API methods
export const api = {
    // ===== RIDES =====
    getAllRides: async () => {
        return await fetchAPI('/rides');
    },
    getAllRidesExceptPhoto: async () => {
        return await fetchAPI('/rides/except-photo');
    },
    addRide: async (formData) => {
        return await fetchAPI('/ride/add', formData, "POST", true);
    },
    updateRide: async (data, id) => {
        // Check if data is FormData (file upload) or JSON object
        const isFormData = data instanceof FormData;
        return await fetchAPI(`/ride/${id}`, data, "PUT", isFormData);
    },
    deleteRide: async (id) => {
        return await fetchAPI(`/ride/${id}`, null, "DELETE", false);
    },
    scheduleRideMaint: async (formData) => {
        return await fetchAPI('/ride-maintenance', formData, "POST", false);
    },
    getAvgRidesPerMonth: async () => {
        return await fetchAPI('/rides/avg-month');
    },
    getRidesNames: async () => {
        return await fetchAPI('/rides/names');
    },
    getRideMaintenanceSchedules: async () => {
        return await fetchAPI('/rides/maintenance-schedules');
    },


    // ===== ADMIN DASHBOARD =====
    getTotalRevenue: async () => {
        return await fetchAPI('/admin/total-revenue');
    },
    getStoreSales: async () => {
        return await fetchAPI('/admin/store-sales');
    },
    getRideTicketSales: async () => {
        return await fetchAPI('/admin/ride-ticket-sales');
    },
    getAvgRidesBrokenMaintenance: async () => {
        return await fetchAPI('/admin/avg-rides-broken-maintenance');
    },
    getRecentRideOrders: async (offset = 0, limit = 5) => {
        return await fetchAPI(`/admin/recent-ride-orders?offset=${offset}&limit=${limit}`);
    },
    getRideOrderDetails: async (orderId) => {
        return await fetchAPI(`/admin/ride-order-details/${orderId}`);
    },
    getTopProducts: async () => {
        return await fetchAPI('/admin/top-products');
    },
    getWeeklyRevenue: async () => {
        return await fetchAPI('/admin/weekly-revenue');
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
    changeEmployeePassword: async (formData) => {
        return await fetchAPI('/employees/change-password', formData, "POST", false);
    },

    // ===== STORES =====
    getAllStores: async () => {
        return await fetchAPI('/stores');
    },
    getAllStoresExceptPhoto: async () => {
        return await fetchAPI('/stores/except-photo');
    },
    getEmployeeStores: async (employeeId) => {
        return await fetchAPI(`/employee/${employeeId}/stores`);
    },
    addStore: async (formData) => {
        return await fetchAPI('/store/add', formData, "POST", true);
    },
    updateStore: async (data, id) => {
        // Check if data is FormData (file upload) or JSON object
        const isFormData = data instanceof FormData;
        return await fetchAPI(`/store/${id}`, data, "PUT", isFormData);
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
    RideStatusCheck: async () => {
        return await fetchAPI('/api/maintenance/ride-status-check', null, "POST", false);
    },
    updateMaintenance: async (id, data) => {
        return await fetchAPI(`/maintenances/${id}`, data, "PUT", false);
    },

    // ===== MERCHANDISE =====
    getAllMerchandise: async () => {
        return await fetchAPI('/api/merchandise');
    },
    addMerchandise: async (formData) => {
        return await fetchAPI('/api/merchandise', formData, "POST", false);
    },
    updateMerchandise: async (formData, id) => {
        return await fetchAPI(`/api/merchandise/${id}`, formData, "PUT", false);
    },
    deleteMerchandise: async (id) => {
        return await fetchAPI(`/api/merchandise/${id}`, null, "DELETE", false);
    },

    // ===== INVENTORY =====
    getAllInventories: async () => {
        const result = await fetchAPI('/api/store-inventory');
        return result || [];
    },
    getStoreInventory: async (storeId) => {
        const result = await fetchAPI(`/api/store-inventory/${storeId}`);
        return result || [];
    },
    updateInventory: async (storeId, itemId, formData) => {
        return await fetchAPI(`/api/store-inventory/${storeId}/${itemId}`, formData, "PUT", false);
    },
    addToInventory: async (formData) => {
        return await fetchAPI('/api/store-inventory', formData, "POST", false);
    },

    // ===== RIDE ORDERS =====
    getRideOrders: async (range = 'all') => {
        const token = getCustomerToken();
        if (!token) throw new Error('No authentication token');

        const res = await fetch(`${SERVER_URL}/api/ride-orders?range=${encodeURIComponent(range)}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch orders');
        }

        const body = await res.json();
        return body.data || [];
    },

    // ===== STORE ORDERS =====
    getStoreOrders: async (range = 'all') => {
        const token = getCustomerToken();
        if (!token) throw new Error('No authentication token');

        const res = await fetch(`${SERVER_URL}/api/store-orders?range=${encodeURIComponent(range)}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch store orders');
        }

        const body = await res.json();
        return body.data || [];
    },

    // ===== UNIFIED ORDER (Rides + Store in single transaction with consolidated email) =====
    createUnifiedOrder: async (orderData) => {
        // orderData = { rideCart, storeCart, grandTotal, payment_method }
        const token = getCustomerToken();
        if (!token) throw new Error('No authentication token');

        const res = await fetch(`${SERVER_URL}/api/unified-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to create unified order');
        }

        const body = await res.json();
        return body;
    },

    // ===== MANAGER DASHBOARD =====
    getManagerDashboard: async (department) => {
        return await fetchAPI(`/api/manager/dashboard/${department}`);
    },

    // ===== REPORTS =====
    getMostRiddenRides: async (year) => {
        return await fetchAPI(`/api/reports/most-ridden?year=${year}`);
    },
    getCustomerReport: async (params) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.append('type', params.type);
        if (params.viewMode) queryParams.append('viewMode', params.viewMode);
        if (params.period) queryParams.append('period', params.period);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        return await fetchAPI(`/api/reports/customer-report?${queryParams.toString()}`);
    },
    getRideReport: async (params) => {
        const queryParams = new URLSearchParams();
        if (params.group) queryParams.append('group', params.group);
        if (params.type) queryParams.append('type', params.type);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.rideName) queryParams.append('rideName', params.rideName);

        return await fetchAPI(`/api/reports/ride-report?${queryParams.toString()}`);
    },
    getMerchandiseReport: async (params) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.append('type', params.type);
        if (params.items) queryParams.append('items', params.items);
        if (params.store) queryParams.append('store', params.store);
        if (params.category) queryParams.append('category', params.category);
        if (params.itemId) queryParams.append('itemId', params.itemId);
        if (params.storeId) queryParams.append('storeId', params.storeId);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        return await fetchAPI(`/api/reports/merchandise-report?${queryParams.toString()}`);
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
    if (!token) {
        // Dispatch logout event to clear AuthContext
        try {
            window.dispatchEvent(new CustomEvent('themepark:auth', { detail: null }));
        } catch {
            // ignore if running in environments without CustomEvent
        }
        return null;
    }

    const res = await fetch(`${SERVER_URL}/api/customer/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        setCustomerToken(null);
        // Dispatch logout event to clear AuthContext
        try {
            window.dispatchEvent(new CustomEvent('themepark:auth', { detail: null }));
        } catch {
            // ignore if running in environments without CustomEvent
        }
        return null;
    }

    const body = await res.json();
    return body.customer;
}

// COMPLETE CUSTOMER PROFILE (For Google OAuth users - includes DOB)
export async function completeCustomerProfile(customerId, profileData) {
    const token = getCustomerToken();
    if (!token) throw new Error('No authentication token');

    const res = await fetch(`${SERVER_URL}/api/customer/complete-profile/${customerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to complete profile');
    }

    const body = await res.json();
    return body.customer;
}

// UPDATE CUSTOMER (Regular updates - cannot change DOB)
export async function updateCustomer(customerId, customerData) {
    const token = getCustomerToken();
    if (!token) throw new Error('No authentication token');

    const res = await fetch(`${SERVER_URL}/api/customer/${customerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Update failed');
    }

    const body = await res.json();
    return body.customer;
}

// LOG OUT
export function logoutCustomer() {
    setCustomerToken(null);
    // Dispatch logout event to clear AuthContext
    try {
        window.dispatchEvent(new CustomEvent('themepark:auth', { detail: null }));
    } catch {
        // ignore if running in environments without CustomEvent
    }
}

// CHANGE CUSTOMER PASSWORD
export async function changeCustomerPassword(currentPassword, newPassword) {
    const token = getCustomerToken();
    if (!token) throw new Error('No authentication token');

    const res = await fetch(`${SERVER_URL}/api/customer/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
        }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to change password');
    }

    const body = await res.json();
    return body;
}

// Backwards-compatible wrapper methods for components that call `api.customerSignup` / `api.customerLogin`
// These return the shape other parts of the app expect (an object with `data`) so existing callers
// don't need to be changed.
try {
    // `api` was exported earlier in this module — attach compatibility methods to it.
    api.customerSignup = async (formData) => {
        const customer = await signupCustomer(formData);
        return { data: customer };
    };

    api.customerLogin = async (formData) => {
        const customer = await loginCustomer(formData);
        return { data: customer };
    };

    api.fetchCurrentCustomer = async () => {
        // Keep compatibility: some callers may expect fetchCurrentCustomer as part of `api`.
        return await fetchCurrentCustomer();
    };

    api.logoutCustomer = () => {
        return logoutCustomer();
    };

    // ===== RAIN OUT MANAGEMENT =====
    api.getAllRainOuts = async () => {
        return await fetchAPI('/api/rain-outs');
    };

    api.createRainOut = async (rainOutData) => {
        return await fetchAPI('/api/rain-outs', rainOutData, "POST", false);
    };

    api.updateRainOut = async (id, rainOutData) => {
        return await fetchAPI(`/api/rain-outs/${id}`, rainOutData, "PUT", false);
    };

} catch (e) {
    // In unusual bundling cases `api` might not be writable yet — fail silently and let
    // named exports be used instead.
    console.warn('Could not attach compatibility methods to api object', e);
}