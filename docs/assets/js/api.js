// 🔥 Live Backend URL
const BASE_URL = "https://ecodrop-9hq1.onrender.com";

// 🔹 Common Fetch Function
async function apiRequest(endpoint, method = "GET", data = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
}

// 🔹 AUTH APIs
function loginUser(data) {
  return apiRequest("/api/auth/login", "POST", data);
}

function signupUser(data) {
  return apiRequest("/api/auth/register", "POST", data);
}

// 🔹 WASTE APIs
function submitWaste(data, token) {
  return apiRequest("/api/waste", "POST", data, token);
}

function getWaste(token) {
  return apiRequest("/api/waste", "GET", null, token);
}

// 🔹 COUPON APIs
function getCoupons(token) {
  return apiRequest("/api/coupons", "GET", null, token);
}

function redeemCoupon(data, token) {
  return apiRequest("/api/coupons/redeem", "POST", data, token);
}

// 🔹 WITHDRAW APIs
function requestWithdraw(data, token) {
  return apiRequest("/api/withdraw", "POST", data, token);
}