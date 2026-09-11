const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;


    const button =
        loginForm.querySelector("button");


    button.disabled = true;
    button.textContent = "Signing In...";

    loginMessage.innerHTML = "";


    try {

        const response = await fetch(
            "/api/admin/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );


        const result =
            await response.json();


        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Invalid login details."
            );
        }


        loginMessage.innerHTML = `
            <div class="login-success">
                Login successful. Redirecting...
            </div>
        `;


        setTimeout(() => {
            window.location.href = "/admin.html";
        }, 700);


    } catch (error) {

        loginMessage.innerHTML = `
            <div class="login-error">
                ${error.message}
            </div>
        `;

    } finally {

        button.disabled = false;
        button.textContent = "Sign In";

    }

});