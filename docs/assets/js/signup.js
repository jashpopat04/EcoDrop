const form = document.getElementById("signupForm");
const errorBox = document.getElementById("errorBox");
const signupBtn = document.getElementById("signupBtn");

const sellerFields = document.getElementById("sellerFields");
const recyclerFields = document.getElementById("recyclerFields");

// 🔥 Toggle Role Fields
document.querySelectorAll('input[name="role"]').forEach(radio => {
    radio.addEventListener("change", () => {
        const role = document.querySelector('input[name="role"]:checked').value;

        if (role === "seller") {
            sellerFields.classList.remove("hidden");
            recyclerFields.classList.add("hidden");
        } else {
            recyclerFields.classList.remove("hidden");
            sellerFields.classList.add("hidden");
        }

        hideError();
    });
});

// 🔥 Form Submit
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const role = document.querySelector('input[name="role"]:checked').value;

    let payload = {};

    if (role === "seller") {

        const name = document.getElementById("sellerName").value.trim();
        const email = document.getElementById("sellerEmail").value.trim();
        const phone = document.getElementById("sellerPhone").value.trim();
        const password = document.getElementById("sellerPassword").value;

        if (!name || !email || !phone || !password) {
            return showError("All seller fields are required.");
        }

        if (password.length < 6) {
            return showError("Password must be at least 6 characters.");
        }

        payload = {
            name,
            email,
            password,
            role,
            contactNumber: phone
        };

    } else {

        const companyName = document.getElementById("companyName").value.trim();
        const authorizedPerson = document.getElementById("authorizedPerson").value.trim();
        const contactNumber = document.getElementById("contactNumber").value.trim();
        const gstNumber = document.getElementById("gstNumber").value.trim();
        const email = document.getElementById("recyclerEmail").value.trim();
        const password = document.getElementById("recyclerPassword").value;

        if (!companyName || !authorizedPerson || !contactNumber || !gstNumber || !email || !password) {
            return showError("All recycler fields are required.");
        }

        if (password.length < 6) {
            return showError("Password must be at least 6 characters.");
        }

        payload = {
            name: authorizedPerson,
            email,
            password,
            role,
            companyName,
            authorizedPerson,
            contactNumber,
            gstNumber
        };
    }

    try {
        signupBtn.innerText = "Creating Account...";
        signupBtn.disabled = true;

        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registration failed");
        }

        alert("Account Created Successfully 🎉");
        window.location.href = "login.html";

    } catch (err) {
        showError(err.message);
    } finally {
        signupBtn.innerText = "Create Account";
        signupBtn.disabled = false;
    }
});

function showError(message) {
    errorBox.classList.remove("hidden");
    errorBox.innerText = message;
}

function hideError() {
    errorBox.classList.add("hidden");
}

// 🔥 Toggle Password Visibility Logic
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        
        // Check current type and flip it
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.textContent = '🙈'; // Band aankh icon
        } else {
            passwordInput.type = 'password';
            this.textContent = '👁️'; // Khuli aankh icon
        }
    });
});