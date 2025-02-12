function toggleForms(formId) {
    const forms = document.querySelectorAll('.form-box');
    forms.forEach(form => {
        form.classList.remove('active');
    });

    document.getElementById(formId).classList.add('active');
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard';
        }
    });
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nama = document.getElementById('registerNama').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nama, email, password, role })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        toggleForms('loginBox');
    });
});

// 🔹 Tambahkan event listener untuk form lupa password
document.getElementById('forgotForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;

    fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            // Setelah sukses, arahkan user ke halaman login atau dashboard
            window.location.href = '/';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan, coba lagi nanti.');
    });
});