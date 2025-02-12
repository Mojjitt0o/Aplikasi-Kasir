// Navigasi Halaman
function navigate(page) {
    history.pushState({}, '', page);
    alert('Navigasi ke ' + page + ' belum diimplementasikan.');
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// Menampilkan Daftar Produk
async function fetchProducts() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Anda harus login terlebih dahulu.');
        return;
    }

    const headers = { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
    };

    try {
        const response = await fetch('/api/products', { headers });
        const products = await response.json();
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.nama}</td>
                <td>${product.harga}</td>
                <td>${product.stok}</td>
                <td>${product.barcode}</td>
                <td>
                    <button onclick="editProduct(${product.id})">Edit</button>
                    <button onclick="deleteProduct(${product.id})">Hapus</button>
                </td>
            `;
            productsList.appendChild(row);
        });
    } catch (error) {
        console.error('Gagal mengambil data produk:', error);
    }
}

// Menambah Produk
async function addProduct() {
    const nama = document.getElementById('nama').value;
    const harga = document.getElementById('harga').value;
    const stok = document.getElementById('stok').value;
    const barcode = document.getElementById('barcode').value;
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Anda harus login terlebih dahulu.');
        return;
    }

    const headers = { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
    };

    const productData = { nama, harga, stok, barcode };

    try {
        const response = await fetch('/api/products/add', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(productData)
        });
        const data = await response.json();
        alert(data.message);
        closeAddProductModal();
        fetchProducts();
    } catch (error) {
        console.error('Gagal menambah produk:', error);
    }
}

// Menghapus Produk
async function deleteProduct(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Anda harus login terlebih dahulu.');
        return;
    }

    const headers = { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
    };

    try {
        const response = await fetch(`/api/products/delete/${id}`, {
            method: 'DELETE',
            headers: headers
        });
        const data = await response.json();
        alert(data.message);
        fetchProducts();
    } catch (error) {
        console.error('Gagal menghapus produk:', error);
    }
}

// Modal Tambah Produk
function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
}

function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

// Panggil fetchProducts saat halaman dimuat
window.onload = fetchProducts;
