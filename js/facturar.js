import { db, auth } from './firebaseConfig.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const productSelect = document.getElementById('product-select');
const selectedProducts = document.getElementById('selected-products');
const totalAmount = document.getElementById('total-amount');
const paymentMethod = document.getElementById('payment-method');
const accountSelection = document.getElementById('account-selection');
const bankSelection = document.getElementById('bank-selection');
const account = document.getElementById('account');
const bank = document.getElementById('bank');
const trabajadoraSelect = document.getElementById('trabajadoras');
const saveInvoiceButton = document.getElementById('save-invoice');
const facturaDate = document.getElementById('factura-date');

let total = 0;

// Cargar productos desde Firebase
async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        const option = document.createElement('option');
        option.value = JSON.stringify({ name: product.name, price: product.price });
        option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
        productSelect.appendChild(option);
    });
}

// Cargar trabajadoras desde Firebase
async function loadTrabajadoras() {
    const querySnapshot = await getDocs(collection(db, 'trabajadoras'));
    querySnapshot.forEach((doc) => {
        const trabajadora = doc.data();
        const option = document.createElement('option');
        option.value = trabajadora.name;
        option.textContent = trabajadora.name;
        trabajadoraSelect.appendChild(option);
    });
}

// Añadir producto seleccionado al listado
productSelect.addEventListener('change', () => {
    const selectedOption = productSelect.value;
    if (!selectedOption) return;

    const { name, price } = JSON.parse(selectedOption);

    addProductToList(name, price);
    updateTotal(price);
    productSelect.value = ''; // Restablecer selección
});

// Agregar producto al listado de selección
function addProductToList(name, price) {
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.innerHTML = `
        <span>${name} - $${price.toFixed(2)}</span>
        <button class="remove-product">Eliminar</button>
    `;

    // Botón para eliminar el producto seleccionado
    productItem.querySelector('.remove-product').addEventListener('click', () => {
        productItem.remove();
        updateTotal(-price); // Restar precio del total
    });

    selectedProducts.appendChild(productItem);
}

// Actualizar el total de la factura
function updateTotal(amount) {
    total += amount;
    totalAmount.textContent = total.toFixed(2);
}

// Mostrar campos adicionales si el método de pago es transferencia
paymentMethod.addEventListener('change', () => {
    const isTransfer = paymentMethod.value === 'transferencia';
    accountSelection.style.display = isTransfer ? 'block' : 'none';
    bankSelection.style.display = isTransfer ? 'block' : 'none';
});

// Guardar factura en Firebase
saveInvoiceButton.addEventListener('click', async () => {
    if (!facturaDate.value || selectedProducts.children.length === 0 || !trabajadoraSelect.value) {
        alert("Por favor, complete la fecha, seleccione al menos un producto y una trabajadora.");
        return;
    }

    const confirmation = confirm("¿Está seguro de que desea guardar esta factura?");
    if (!confirmation) return;

    const productos = Array.from(selectedProducts.children).map(item => item.querySelector('span').textContent);
    const t_pago = paymentMethod.value;
    const cuenta = t_pago === 'transferencia' ? account.value : '';
    const banco = t_pago === 'transferencia' ? bank.value : '';
    const trabajadora = trabajadoraSelect.value;

    try {
        await addDoc(collection(db, 'ventas'), {
            fecha: facturaDate.value,
            productos,
            t_pago,
            cuenta,
            banco,
            trabajadora,
            valor: total
        });
        alert("Factura guardada exitosamente.");
        
        // Restablecer datos
        selectedProducts.innerHTML = '';
        total = 0;
        totalAmount.textContent = '0.00';
        facturaDate.value = '';
        trabajadoraSelect.value = '';
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

// Revisar facturas (función temporal)
document.getElementById('review-invoices').addEventListener('click', () => {
    window.location.href = "revisar.html";
});

// Cargar datos al iniciar
loadProducts();
loadTrabajadoras();
