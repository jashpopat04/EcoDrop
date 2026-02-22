function protectPage(requiredRole) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        window.location.href = "../pages/login.html";
        return;
    }

    if (requiredRole && role !== requiredRole) {
        alert("Access Denied");
        window.location.href = "../pages/login.html";
    }
}