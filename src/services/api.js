const SERVER_URL =
  import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3001';


async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${SERVER_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }

    return result.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

//API methods
export const api = {
  // Get all the rides
  getAllRides: async () => {
    return await fetchAPI('/rides');
  },

  // Get all the employees under admin
  getAllEmployees: async () => {
    return await fetchAPI('/employees');
  },

  // Get all the maintenance schedule
  getAllMaintenances: async () => {
    return await fetchAPI('/maintenances');
  },

  // Get all inventory items
  getAllInventories: async () => {
    return await fetchAPI('/inventories');
  },

  // Get maintenance schedule by employee Id
  getEmployeeMaintenances: async () => {
    return await fetchAPI('/maintenances-employee/id');
  },

  // Get ride orders based on customer Id
  getRideOrders: async () => {
    return await fetchAPI('/rideorders/id');
  },

  // (you can add more here later)
};

// =======================
// CUSTOMER AUTH HELPERS
// =======================

// Store token in browser
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
  // { token, customer }
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
  // { token, customer }
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
    // token invalid or expired
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
