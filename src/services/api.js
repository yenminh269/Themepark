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

// Get beautiful placeholder images for rides
export const getRidePlaceholderImage = (rideName = '') => {
    const images = [
        'https://images.unsplash.com/photo-1594739584670-1e9be48f6ec3?w=800&h=600&fit=crop&q=80', // Roller coaster
        'https://images.unsplash.com/photo-1570993492903-ba4c3088f100?w=800&h=600&fit=crop&q=80', // Ferris wheel
        'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&h=600&fit=crop&q=80', // Amusement park
        'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop&q=80', // Theme park rides
        'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&h=600&fit=crop&q=80', // Carousel
        'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800&h=600&fit=crop&q=80', // Park view
    ];
    // Use ride name to consistently pick an image
    const index = rideName ? rideName.length % images.length : Math.floor(Math.random() * images.length);
    return images[index];
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
        return result.data || [];
    },
    getStoreInventory: async (storeId) => {
        const result = await fetchAPI(`/api/store-inventory/${storeId}`);
        return result.data || [];
    },
    updateInventory: async (storeId, itemId, formData) => {
        return await fetchAPI(`/api/store-inventory/${storeId}/${itemId}`, formData, "PUT", false);
    },
    addToInventory: async (formData) => {
        return await fetchAPI('/api/store-inventory', formData, "POST", false);
    },

    // ===== RIDE ORDERS =====
    getRideOrders: async () => {
        const token = getCustomerToken();
        if (!token) throw new Error('No authentication token');

        const res = await fetch(`${SERVER_URL}/api/ride-orders`, {
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

    createRideOrder: async (cart, total) => {
        const token = getCustomerToken();
        if (!token) throw new Error('No authentication token');

        const res = await fetch(`${SERVER_URL}/api/ride-orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ cart, total }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to create order');
        }

        const body = await res.json();
        return body.order;
    },

    // ===== STORE ORDERS =====
    getStoreOrders: async () => {
        const token = getCustomerToken();
        if (!token) throw new Error('No authentication token');

        const res = await fetch(`${SERVER_URL}/api/store-orders`, {
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

    createStoreOrder: async (orderData) => {
        const token = getCustomerToken();
        if (!token) throw new Error('No authentication token');

        const res = await fetch(`${SERVER_URL}/api/store-orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Failed to create store order');
        }

        const body = await res.json();
        return body;
    },

    // ===== MANAGER DASHBOARD =====
    getManagerDashboard: async (department) => {
        return await fetchAPI(`/api/manager/dashboard/${department}`);
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

// UPDATE CUSTOMER
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
} catch (e) {
    // In unusual bundling cases `api` might not be writable yet — fail silently and let
    // named exports be used instead.
    console.warn('Could not attach compatibility methods to api object', e);
}