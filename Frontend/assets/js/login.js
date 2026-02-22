document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg"); // Fixed ID to match HTML
  const loginBtn = document.getElementById("loginBtn");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  // 🔥 Toggle Password Visibility
  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePassword.innerHTML = type === "password" ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
  }

  // 🔥 Form Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.classList.add("hidden"); // Hide previous errors

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    try {
      // Button loading state
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
      loginBtn.disabled = true;

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 🔥 STORE TOKEN
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      // 🔥 REDIRECT BASED ON ROLE
      if (data.role === "seller") {
        window.location.href = "seller-dashboard.html";
      } else if (data.role === "recycler") {
        window.location.href = "recycler-dashboard.html";
      } else if (data.role === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        throw new Error("Invalid user role detected.");
      }

    } catch (err) {
      errorMsg.classList.remove("hidden");
      errorMsg.innerText = err.message;
      errorMsg.style.color = "#e63946"; // Red text for errors
    } finally {
      // Reset button state
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      loginBtn.disabled = false;
    }
  });
});