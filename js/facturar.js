// js/facturar.js
import { db, auth } from './firebaseConfig.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const productSelect = document.getElementById('product-select');
const addProductButton = document.getElementById('add-product');
const selectedProductsDiv = document.getElementById('selected-products');
const totalAmount = document.getElementById('total-amount');
const paymentMethod = document.getElementById('payment-method');
const accountSelection = document.getElementById('account-selection');
const bankSelection = document.getElementById('bank-selection');
const account = document.getElementById('account');
const bank = document.getElementById('bank');
const saveInvoiceButton = document.getElementById('save-invoice');
const facturaDate = document.getElementById('factura-date');
const trabajadoraSelect = document.getElementById('trabajadoras');
let selectedProducts = [];
let total = 0;

// Cargar productos desde Firebase
async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    productDropdown.innerHTML = `<option value="">Seleccione un producto</option>`;
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        const option = document.createElement('option');
        option.value = JSON.stringify({ name: product.name, price: product.price });
        option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
        productDropdown.appendChild(option);
    });
}

// Añadir producto seleccionado
productDropdown.addEventListener('change', () => {
    if (productDropdown.value) {
        const product = JSON.parse(productDropdown.value);
        selectedProducts.push(product);
        total += product.price;
        totalAmount.textContent = total.toFixed(2);

        // Mostrar el producto en la lista
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
            <label>${product.name} - $${product.price.toFixed(2)}</label>
            <button onclick="removeProduct('${product.name}')">Eliminar</button>
        `;
        productListContainer.appendChild(productItem);
    }
});

// Remover producto y actualizar el total
window.removeProduct = function(name) {
    const index = selectedProducts.findIndex(p => p.name === name);
    if (index !== -1) {
        total -= selectedProducts[index].price;
        selectedProducts.splice(index, 1);
        totalAmount.textContent = total.toFixed(2);
        loadSelectedProducts();
    }
};

function loadSelectedProducts() {
    productListContainer.innerHTML = '';
    selectedProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
            <label>${product.name} - $${product.price.toFixed(2)}</label>
            <button onclick="removeProduct('${product.name}')">Eliminar</button>
        `;
        productListContainer.appendChild(productItem);
    });
}

// Mostrar la lista de trabajadoras
async function loadTrabajadoras() {
    const querySnapshot = await getDocs(collection(db, 'trabajadoras'));
    trabajadoraDropdown.innerHTML = `<option value="">Seleccione una trabajadora</option>`;
    querySnapshot.forEach((doc) => {
        const trabajadora = doc.data().name;
        const option = document.createElement('option');
        option.value = trabajadora;
        option.textContent = trabajadora;
        trabajadoraDropdown.appendChild(option);
    });
}

// Configuración de métodos de pago y bancos
paymentMethod.addEventListener('change', () => {
    accountSelection.style.display = paymentMethod.value === 'transferencia' ? 'block' : 'none';
    bankSelection.style.display = paymentMethod.value === 'transferencia' ? 'block' : 'none';
});

// Guardar factura en Firebase
saveInvoiceButton.addEventListener('click', async () => {
    if (confirm("¿Está seguro de guardar esta factura?")) {
        if (!facturaDate.value || selectedProducts.length === 0 || !trabajadoraDropdown.value) {
            alert("Por favor, complete todos los campos obligatorios.");
            return;
        }

        const t_pago = paymentMethod.value;
        const cuenta = t_pago === 'transferencia' ? account.value : '';
        const banco = t_pago === 'transferencia' ? bankSelection.value : '';

        try {
            await addDoc(collection(db, 'ventas'), {
                fecha: facturaDate.value,
                productos: selectedProducts.map(p => p.name).join(', '),
                t_pago,
                cuenta,
                banco,
                valor: total,
                trabajadora: trabajadoraDropdown.value
            });
            alert("Factura guardada exitosamente.");
            selectedProducts = [];
            total = 0;
            totalAmount.textContent = '0.00';
            loadSelectedProducts();
        } catch (error) {
            console.error("Error al guardar la factura:", error);
        }
    }
});

// Cargar productos y trabajadoras al iniciar
loadProducts();
loadTrabajadoras();
