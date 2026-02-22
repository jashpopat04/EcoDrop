const role = localStorage.getItem("role");

if (!token || role !== "seller") {
  window.location.href = "login.html";
}




const API_BASE = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// ==========================
// LOAD DASHBOARD DATA
// ==========================
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/waste/seller/dashboard`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    // Update Stats
    document.getElementById("totalKg").textContent = data.totalKg + " KG";
    document.getElementById("money").textContent = "₹" + data.totalMoney;
    document.getElementById("points").textContent = data.totalPoints;
    document.getElementById("co2").textContent = data.co2Saved + " KG";

    renderListings(data.wastes);

  } catch (err) {
    alert("Failed to load dashboard");
  }
}

// ==========================
// RENDER TABLE
// ==========================
function renderListings(wastes) {
  const tbody = document.getElementById("listingsBody");
  tbody.innerHTML = "";

  wastes.forEach(w => {
    tbody.innerHTML += `
      <tr>
        <td>${w.category}</td>
        <td>${w.weight}</td>
        <td>${w.method}</td>
        <td>${w.status}</td>
      </tr>
    `;
  });
}

// ==========================
// ADD WASTE
// ==========================
document.getElementById("submitForm").addEventListener("click", async () => {

  const category = document.getElementById("categoryInput").value;
  const weight = document.getElementById("weightInput").value;
  const pickup = document.getElementById("pickupInput").value;

  if (!category || !weight) {
    return alert("Fill all fields");
  }

  try {
    const res = await fetch(`${API_BASE}/waste/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        category,
        weight,
        method: pickup === "Door Pickup" ? "pickup" : "drop"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    alert("Waste Added Successfully");
    loadDashboard();

  } catch (err) {
    alert("Upload failed");
  }
});

loadDashboard();