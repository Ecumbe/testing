import { db, auth } from './firebaseConfig.js';
import { collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const productSelect = document.getElementById('product-select');
const selectedProductsContainer = document.getElementById('selected-products');
const totalAmount = document.getElementById('total-amount');
const paymentMethod = document.getElementById('payment-method');
const accountSelection = document.getElementById('account-selection');
const bankSelection = document.getElementById('bank-selection');
const saveInvoiceButton = document.getElementById('save-invoice');
const facturaDate = document.getElementById('factura-date');
const trabajadorSelect = document.getElementById('trabajadora');
let selectedProducts = [];
let total = 0;

// Cargar productos desde Firebase
async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        const option = document.createElement('option');
        option.value = product.name;
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
        trabajadorSelect.appendChild(option);
    });
}

// Agregar producto seleccionado al listado
productSelect.addEventListener('change', (e) => {
    const selectedProductName = e.target.value;
    const selectedProductPrice = parseFloat(e.target.selectedOptions[0].text.split('$')[1]);
    if (selectedProductName && selectedProductPrice) {
        selectedProducts.push({ name: selectedProductName, price: selectedProductPrice });
        total += selectedProductPrice;
        totalAmount.textContent = total.toFixed(2);

        // Crear elemento de producto seleccionado
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
            <span>${selectedProductName} - $${selectedProductPrice.toFixed(2)}</span>
            <button class="remove-product">Eliminar</button>
        `;

        // Agregar funcionalidad para eliminar el producto
        productItem.querySelector('.remove-product').addEventListener('click', () => {
            const index = selectedProducts.findIndex((p) => p.name === selectedProductName && p.price === selectedProductPrice);
            if (index !== -1) {
                selectedProducts.splice(index, 1);
                total -= selectedProductPrice;
                totalAmount.textContent = total.toFixed(2);
                productItem.remove();
            }
        });

        selectedProductsContainer.appendChild(productItem);
    }
});

// Mostrar/ocultar opciones adicionales para transferencia
paymentMethod.addEventListener('change', () => {
    if (paymentMethod.value === 'transferencia') {
        accountSelection.style.display = 'block';
        bankSelection.style.display = 'block';
    } else {
        accountSelection.style.display = 'none';
        bankSelection.style.display = 'none';
    }
});

// Confirmar guardado de factura
saveInvoiceButton.addEventListener('click', () => {
    const confirmation = confirm("¿Estás seguro de que deseas guardar la factura?");
    if (confirmation) {
        const facturaData = {
            productos: selectedProducts,
            total: total,
            metodoPago: paymentMethod.value,
            cuenta: paymentMethod.value === 'transferencia' ? accountSelection.value : null,
            banco: paymentMethod.value === 'transferencia' ? bankSelection.value : null,
            fecha: facturaDate.value,
            trabajadora: trabajadorSelect.value
        };
        addDoc(collection(db, 'facturas'), facturaData).then(() => {
            alert("Factura guardada exitosamente.");
            // Resetear los campos después de guardar
            selectedProducts = [];
            total = 0;
            totalAmount.textContent = "0.00";
            selectedProductsContainer.innerHTML = "";
            facturaDate.value = "";
            trabajadorSelect.value = "";
        }).catch((error) => {
            console.error("Error al guardar la factura: ", error);
        });
    }
});

// Cargar productos y trabajadoras al iniciar
loadProducts();
loadTrabajadoras();
