// js/facturar.js

import { db, auth } from './firebaseConfig.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const productDropdown = document.getElementById('product-dropdown');
const selectedProductsDiv = document.getElementById('selected-products');
const totalAmount = document.getElementById('total-amount');
const paymentMethod = document.getElementById('payment-method');
const accountSelection = document.getElementById('account-selection');
const bankSelection = document.getElementById('bank-selection');
const account = document.getElementById('account');
const bank = document.getElementById('bank');
const trabajadoraDropdown = document.getElementById('trabajadora');
const saveInvoiceButton = document.getElementById('save-invoice');
const facturaDate = document.getElementById('factura-date');
let selectedProducts = [];
let total = 0;

// Mostrar productos desde Firebase en la lista desplegable
async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    productDropdown.innerHTML = '<option value="">Selecciona un producto</option>';
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        const option = document.createElement('option');
        option.value = JSON.stringify({ name: product.name, price: product.price });
        option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
        productDropdown.appendChild(option);
    });
}

// Mostrar trabajadoras desde Firebase en el menú desplegable
async function loadTrabajadoras() {
    const querySnapshot = await getDocs(collection(db, 'trabajadoras'));
    trabajadoraDropdown.innerHTML = '<option value="">Selecciona una trabajadora</option>';
    querySnapshot.forEach((doc) => {
        const trabajadora = doc.data();
        const option = document.createElement('option');
        option.value = trabajadora.name;
        option.textContent = trabajadora.name;
        trabajadoraDropdown.appendChild(option);
    });
}

// Manejar selección de producto
productDropdown.addEventListener('change', () => {
    if (productDropdown.value) {
        const product = JSON.parse(productDropdown.value);
        addProduct(product.name, product.price);
        productDropdown.value = "";  // Restablecer selección
    }
});

// Agregar producto a la lista de productos seleccionados
function addProduct(name, price) {
    const productItem = document.createElement('div');
    productItem.classList.add('product-item');
    productItem.innerHTML = `
        <span>${name} - $${price.toFixed(2)}</span>
        <button class="remove-product">X</button>
    `;
    selectedProductsDiv.appendChild(productItem);

    // Añadir evento para eliminar el producto
    productItem.querySelector('.remove-product').addEventListener('click', () => {
        selectedProducts = selectedProducts.filter(p => !(p.name === name && p.price === price));
        total -= price;
        totalAmount.textContent = total.toFixed(2);
        productItem.remove();
    });

    selectedProducts.push({ name, price });
    total += price;
    totalAmount.textContent = total.toFixed(2);
}

// Cambiar la visibilidad de la selección de cuenta y banco
paymentMethod.addEventListener('change', () => {
    const isTransfer = paymentMethod.value === 'transferencia';
    accountSelection.style.display = isTransfer ? 'block' : 'none';
    bankSelection.style.display = isTransfer ? 'block' : 'none';
});

// Guardar factura en Firebase
saveInvoiceButton.addEventListener('click', async () => {
    if (!facturaDate.value || selectedProducts.length === 0 || !trabajadoraDropdown.value) {
        alert("Por favor, complete todos los campos requeridos.");
        return;
    }

    if (!confirm("¿Está seguro de que desea guardar esta factura?")) return;

    const t_pago = paymentMethod.value;
    const cuenta = t_pago === 'transferencia' ? account.value : '';
    const banco = t_pago === 'transferencia' ? bank.value : '';
    const trabajadora = trabajadoraDropdown.value;

    try {
        await addDoc(collection(db, 'ventas'), {
            fecha: facturaDate.value,
            productos: selectedProducts.map(p => `${p.name} - $${p.price.toFixed(2)}`).join(', '),
            t_pago,
            cuenta,
            banco,
            trabajadora,
            valor: total
        });
        alert("Factura guardada exitosamente.");
        
        // Restablecer valores después de guardar
        selectedProducts = [];
        total = 0;
        totalAmount.textContent = '0.00';
        selectedProductsDiv.innerHTML = '';
        facturaDate.value = '';
    } catch (error) {
        console.error("Error al guardar la factura:", error);
    }
});

// Cerrar sesión
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});

// Regresar al menú
document.getElementById('back').addEventListener('click', () => {
    window.location.href = "menu.html";
});

// Ir a la página de revisión de facturas
document.getElementById('review-invoices').addEventListener('click', () => {
    window.location.href = "revisar.html";
});

// Cargar productos y trabajadoras al iniciar
loadProducts();
loadTrabajadoras();
