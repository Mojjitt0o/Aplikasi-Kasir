// Menampilkan Pop-up Tambah Produk
function showAddProductPopup() {
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('popupTitle').textContent = 'Tambah Produk';
    document.getElementById('productPopup').style.display = 'flex';
}

// Menutup Pop-up
function closePopup() {
    document.getElementById('productPopup').style.display = 'none';
}

// Fetch Data Produk dari API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        const productList = document.getElementById('productList');
        productList.innerHTML = '';

        data.forEach((product, index) => {
            productList.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${product.nama_produk}</td>
                    <td>${product.harga}</td>
                    <td>${product.stok}</td>
                    <td>
                        <button onclick="editProduct(${product.id})">Edit</button>
                        <button onclick="deleteProduct(${product.id})">Hapus</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Gagal mengambil data:', error);
    }
}

// Cari Produk
function searchProduct() {
    const input = document.getElementById('searchProduct').value.toUpperCase();
    const rows = document.querySelectorAll('#productList tr');
    
    rows.forEach(row => {
        const productName = row.querySelector('td:nth-child(2)').textContent.toUpperCase();
        row.style.display = productName.includes(input) ? '' : 'none';
    });
}

// Panggil fetchProducts saat halaman dimuat
window.onload = fetchProducts;
