import { db, auth } from './firebaseConfig.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const productDropdown = document.getElementById('product-dropdown');
const productListContainer = document.getElementById('selected-products');
const totalAmount = document.getElementById('total-amount');
const paymentMethod = document.getElementById('payment-method');
const accountSelection = document.getElementById('account-selection');
const account = document.getElementById('account');
const bankSelection = document.getElementById('bank-selection');
const bank = document.getElementById('bank');
const trabajadora = document.getElementById('trabajadora');
const saveInvoiceButton = document.getElementById('save-invoice');
const facturaDate = document.getElementById('factura-date');
let selectedProducts = [];
let total = 0;

// Cargar productos desde Firebase y agregarlos al desplegable
async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    productDropdown.innerHTML = ''; // Limpiar el dropdown
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        const option = document.createElement('option');
        option.value = product.name;
        option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
        productDropdown.appendChild(option);
    });
}

// Agregar producto seleccionado a la lista
productDropdown.addEventListener('change', () => {
    const selectedProductName = productDropdown.value;
    const selectedProductPrice = parseFloat(productDropdown.selectedOptions[0].text.split('$')[1]);
    
    if (selectedProductName && !selectedProducts.some(product => product.name === selectedProductName)) {
        selectedProducts.push({ name: selectedProductName, price: selectedProductPrice });
        total += selectedProductPrice;
        updateProductList();
    }
});

// Actualizar la lista de productos seleccionados
function updateProductList() {
    productListContainer.innerHTML = '';
    selectedProducts.forEach((product, index) => {
        const productItem = document.createElement('div');
        productItem.classList.add('selected-product');
        productItem.innerHTML = `
            <span>${product.name} - $${product.price.toFixed(2)}</span>
            <button class="remove-product" data-index="${index}">Eliminar</button>
        `;
        productListContainer.appendChild(productItem);
    });

    document.querySelectorAll('.remove-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            total -= selectedProducts[index].price;
            selectedProducts.splice(index, 1);
            updateProductList();
            totalAmount.textContent = total.toFixed(2);
        });
    });

    totalAmount.textContent = total.toFixed(2);
}

// Mostrar/hide account and bank selection based on payment method
paymentMethod.addEventListener('change', () => {
    if (paymentMethod.value === 'transferencia') {
        accountSelection.style.display = 'block';
        bankSelection.style.display = 'block';
    } else {
        accountSelection.style.display = 'none';
        bankSelection.style.display = 'none';
    }
});

// Guardar factura en Firebase
saveInvoiceButton.addEventListener('click', async () => {
    if (!facturaDate.value || selectedProducts.length === 0) {
        alert("Por favor, complete la fecha y seleccione al menos un producto.");
        return;
    }

    const t_pago = paymentMethod.value;
    const cuenta = t_pago === 'transferencia' ? account.value : '';
    const banco = t_pago === 'transferencia' ? bank.value : '';
    const trabajadoraNombre = trabajadora.value;

    if (confirm("¿Está seguro de que desea guardar la factura?")) {
        try {
            await addDoc(collection(db, 'ventas'), {
                fecha: facturaDate.value,
                productos: selectedProducts.map(product => product.name).join(', '),
                t_pago,
                cuenta,
                banco,
                trabajadora: trabajadoraNombre,
                valor: total
            });
            alert("Factura guardada exitosamente.");
            selectedProducts = [];
            total = 0;
            totalAmount.textContent = '0.00';
            loadProducts(); // Recargar los productos
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

// Cargar productos al iniciar
loadProducts();
