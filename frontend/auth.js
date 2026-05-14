const ADMIN_EMAIL = "admin@studymarathon.com";
const ADMIN_PASSWORD = "admin123";

function register(){
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (email && password) {
        auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Store user as normal user
            db.ref('users/' + user.uid).set({
                email: email,
                role: 'user',
                createdAt: Date.now()
            });
            alert("Account created successfully!");
            showLogin();
        })
        .catch(e => alert("Registration error: " + e.message));
    } else {
        alert("Please fill in all fields");
    }
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        // Check if admin credentials
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Admin login - no need for Firebase auth, direct redirect
            window.location = "admin-dashboard.html";
            return;
        }

        // Normal user login
        auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            window.location = "dashbord.html";
        })
        .catch(e => alert("Login error: " + e.message));
    } else {
        alert("Please enter email and password");
    }
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}