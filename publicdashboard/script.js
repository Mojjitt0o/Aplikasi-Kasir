// Navigasi Halaman
function navigate(page) {
    // Ubah URL tanpa reload halaman
    history.pushState({}, '', page);
    alert('Navigasi ke ' + page + ' belum diimplementasikan.');
}

// Fetch Data Penjualan dan Produk Terlaris
async function fetchData() {
    try {
        // Tampilkan Loading State
        document.getElementById('salesChart').style.opacity = '0.5';
        document.getElementById('topProducts').innerHTML = '<li>Loading...</li>';

        // Ambil Data dari API
        const salesResponse = await fetch('/api/reports/daily');
        const salesData = await salesResponse.json();
        const productResponse = await fetch('/api/reports/top-products');
        const productData = await productResponse.json();

        // Hilangkan Loading State
        document.getElementById('salesChart').style.opacity = '1';
        document.getElementById('topProducts').innerHTML = '';

        // Chart Penjualan
        const ctx = document.getElementById('salesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: salesData.map(item => item.date),
                datasets: [{
                    label: 'Penjualan Harian',
                    data: salesData.map(item => item.total_sales),
                    backgroundColor: '#74ebd5',
                    hoverBackgroundColor: '#4ea8a1'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
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
            li.textContent = `${product.nama} - Terjual ${product.total_sold}`;
            topProducts.appendChild(li);
        });
    } catch (error) {
        console.error('Gagal mengambil data:', error);
        // Tampilkan pesan error di halaman
        document.getElementById('topProducts').innerHTML = '<li>Gagal memuat data</li>';
    }
}

// Panggil fetchData saat halaman dimuat
window.onload = fetchData;
