// Navigasi Halaman
function navigate(page) {
    // Ganti URL dengan pushState agar tidak me-refresh halaman
    if (page === '/produk') {
        window.location.href = '/produk'; // Arahkan ke halaman produk
    } else if (page === '/transaksi') {
        window.location.href = '/transaksi'; // Arahkan ke halaman transaksi
    } else if (page === '/laporan') {
        window.location.href = '/laporan'; // Arahkan ke halaman laporan
    }
}

// Fungsi Logout
function logout() {
    localStorage.removeItem('token'); // Hapus token login
    localStorage.removeItem('loginTime'); // Hapus waktu login
    alert('Anda berhasil logout.');
    window.location.href = '/'; // Arahkan ke halaman login
}

// Fungsi untuk toggle menu profil
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Fetch Data Penjualan dan Produk Terlaris
async function fetchData() {
    try {
        // Cek apakah user sudah login
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Anda harus login terlebih dahulu.');
            window.location.href = '/login'; // Arahkan ke halaman login jika belum login
            return;
        }

        // Cek waktu sesi
        const sessionTimeout = 30 * 60 * 1000; // 30 menit
        const loginTime = localStorage.getItem('loginTime');

        if (loginTime && (Date.now() - loginTime > sessionTimeout)) {
            localStorage.removeItem('token'); // Menghapus token login
            localStorage.removeItem('loginTime'); // Menghapus waktu login
            alert('Sesi telah berakhir. Silakan login kembali.');
            window.location.href = '/login'; // Arahkan ke halaman login
            return;
        }

        // Header dengan token autentikasi
        const headers = { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        };

        // Fetch data untuk dashboard
        const salesResponse = await fetch('/api/reports/daily', { headers });
        const salesData = await salesResponse.json();

        const productResponse = await fetch('/api/reports/top-products', { headers });
        const productData = await productResponse.json();

        // Hilangkan loading
        document.getElementById('salesChart').style.opacity = '1';
        document.getElementById('topProducts').innerHTML = '';

        // Visualisasikan data (misalnya grafik penjualan)
        const ctx = document.getElementById('salesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: salesData.map(item => item.date || 'Tidak Ada Data'),
                datasets: [{
                    label: 'Penjualan Harian',
                    data: salesData.map(item => item.omset || 0),
                    backgroundColor: '#74ebd5',
                    hoverBackgroundColor: '#4ea8a1'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Tampilkan produk terlaris
        const topProducts = document.getElementById('topProducts');
        productData.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.nama_produk} - Terjual ${product.jumlah_penjualan}`;
            topProducts.appendChild(li);
        });

    } catch (error) {
        console.error('Gagal mengambil data:', error);
        document.getElementById('topProducts').innerHTML = '<li>Gagal memuat data</li>';
    }
}

// Panggil fetchData saat halaman dimuat
window.onload = fetchData;
