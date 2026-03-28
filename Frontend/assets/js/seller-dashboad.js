document.addEventListener("DOMContentLoaded", async () => {
    // 1. Check if the user is actually logged in (using your exact keys from login.js)
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    // If they don't have a token, kick them back to login
    if (!token || role !== "seller") {
        window.location.href = "login.html";
        return;
    }

    // 2. Load the user's name from LocalStorage
    const userName = localStorage.getItem("name");
    
    // 3. Inject the name into your Seller Dashboard HTML
    const nameDisplay = document.querySelector(".user-name");
    const initialsDisplay = document.querySelector(".initials");

    if (nameDisplay && userName) {
        nameDisplay.textContent = userName;
    }
    
    if (initialsDisplay && userName) {
        // Grab the first letter of their name for the Avatar!
        initialsDisplay.textContent = userName.charAt(0).toUpperCase();
    }
    
    // Logout Functionality
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear(); // Wipe the memory
            window.location.href = "login.html"; // Send to login
        });
    }
});