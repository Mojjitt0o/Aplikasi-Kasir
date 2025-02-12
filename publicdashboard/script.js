// Navigasi Halaman
function navigate(page) {
    // Ubah URL tanpa reload halaman
    history.pushState({}, '', page);
    alert('Navigasi ke ' + page + ' belum diimplementasikan.');
}

// Fetch Data Penjualan dan Produk Terlaris
async function fetchData() {
    try {
        // Ambil token dari localStorage (pastikan token sudah disimpan saat login)
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Anda harus login terlebih dahulu.');
            return;
        }

        // Header dengan token autentikasi
        const headers = { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        };

        // Tampilkan Loading State
        document.getElementById('salesChart').style.opacity = '0.5';
        document.getElementById('topProducts').innerHTML = '<li>Loading...</li>';

        // Ambil Data dari API dengan token
        const salesResponse = await fetch('/api/reports/daily', { headers });
        const salesData = await salesResponse.json();

        const productResponse = await fetch('/api/reports/top-products', { headers });
        const productData = await productResponse.json();

        // Hilangkan Loading State
        document.getElementById('salesChart').style.opacity = '1';
        document.getElementById('topProducts').innerHTML = '';

        // Pastikan data yang diterima berupa array
        const salesArray = Array.isArray(salesData) ? salesData : [salesData];

        // Chart Penjualan
        const ctx = document.getElementById('salesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: salesArray.map(item => item.date || 'Tidak Ada Data'),
                datasets: [{
                    label: 'Penjualan Harian',
                    data: salesArray.map(item => item.omset || 0),
                    backgroundColor: '#74ebd5',
                    hoverBackgroundColor: '#4ea8a1'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutBounce'
                }
            }
        });

        // Produk Terlaris
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
