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
const trabajadoraSelect = document.getElementById('trabajadora');

let selectedProducts = [];
let total = 0;

// Cargar productos
async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    productSelect.innerHTML = '<option value="">Selecciona un producto</option>'; // Limpiar lista actual
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        const option = document.createElement('option');
        option.value = product.name;
        option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
        productSelect.appendChild(option);
    });
}

// Cargar trabajadoras
async function loadTrabajadoras() {
    const querySnapshot = await getDocs(collection(db, 'trabajadora'));
    trabajadoraSelect.innerHTML = ''; // Limpiar lista
    querySnapshot.forEach((doc) => {
        const trabajadora = doc.data();
        const option = document.createElement('option');
        option.value = trabajadora.name;
        option.textContent = trabajadora.name;
        trabajadoraSelect.appendChild(option);
    });
}

// Mostrar productos seleccionados
addProductButton.addEventListener('click', () => {
    const selectedProductName = productSelect.value;
    if (selectedProductName) {
        const selectedProduct = { name: selectedProductName };
        selectedProducts.push(selectedProduct);
        total += parseFloat(productSelect.selectedOptions[0].dataset.price);
        selectedProductsDiv.innerHTML = selectedProducts.map(product => `<p>${product.name}</p>`).join('');
        totalAmount.textContent = total.toFixed(2);
    }
});

// Mostrar selección de cuenta
paymentMethod.addEventListener('change', () => {
    accountSelection.style.display = paymentMethod.value === 'transferencia' ? 'block' : 'none';
    bankSelection.style.display = paymentMethod.value === 'transferencia' ? 'block' : 'none';
});

// Guardar factura con confirmación
saveInvoiceButton.addEventListener('click', async () => {
    if (!facturaDate.value || selectedProducts.length === 0) {
        alert("Por favor, complete la fecha y seleccione al menos un producto.");
        return;
    }

    if (confirm("¿Está seguro de guardar esta factura?")) {
        const t_pago = paymentMethod.value;
        const cuenta = t_pago === 'transferencia' ? account.value : '';
        const banco = t_pago === 'transferencia' ? bank.value : '';
        const trabajadora = trabajadoraSelect.value;

        try {
            await addDoc(collection(db, 'ventas'), {
                fecha: facturaDate.value,
                productos: selectedProducts.map(p => p.name).join(', '),
                t_pago,
                cuenta,
                banco,
                trabajadora,
                valor: total
            });
            alert("Factura guardada exitosamente.");
            selectedProducts = [];
            total = 0;
            totalAmount.textContent = '0.00';
            selectedProductsDiv.innerHTML = '';
        } catch (error) {
            console.error("Error al guardar la factura:", error);
        }
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

// Cargar productos y trabajadoras al iniciar
loadProducts();
loadTrabajadoras();
