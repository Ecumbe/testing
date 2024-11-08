import { db, auth } from './firebaseConfig.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

const productList = document.getElementById('product-list');
const selectedProductsContainer = document.getElementById('selected-products');
const totalAmount = document.getElementById('total-amount');
const paymentMethod = document.getElementById('payment-method');
const accountSelection = document.getElementById('account-selection');
const bankSelection = document.getElementById('bank-selection');
const account = document.getElementById('account');
const saveInvoiceButton = document.getElementById('save-invoice');
const facturaDate = document.getElementById('factura-date');
const trabajadorSelect = document.getElementById('trabajadora');
let selectedProducts = [];
let total = 0;

// Mostrar productos desde Firebase
async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    productList.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        const productOption = document.createElement('option');
        productOption.value = product.name;
        productOption.textContent = `${product.name} - $${product.price.toFixed(2)}`;
        productList.appendChild(productOption);
    });
}

// Cargar trabajadoras desde Firebase
async function loadTrabajadoras() {
    const querySnapshot = await getDocs(collection(db, 'trabajadoras'));
    trabajadorSelect.innerHTML = ''; // Limpiar las opciones previas
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecciona una trabajadora';
    trabajadorSelect.appendChild(defaultOption);

    querySnapshot.forEach((doc) => {
        const trabajadora = doc.data();
        const option = document.createElement('option');
        option.value = trabajadora.name;
        option.textContent = trabajadora.name;
        trabajadorSelect.appendChild(option);
    });
}

// Actualizar el total y mostrar productos seleccionados
function updateSelectedProducts() {
    selectedProductsContainer.innerHTML = '';
    selectedProducts.forEach((product) => {
        const productItem = document.createElement('div');
        productItem.classList.add('selected-product');
        productItem.innerHTML = `
            <span>${product.name} - $${product.price.toFixed(2)}</span>
            <button onclick="removeProduct('${product.name}')">Eliminar</button>
        `;
        selectedProductsContainer.appendChild(productItem);
    });

    total = selectedProducts.reduce((sum, product) => sum + product.price, 0);
    totalAmount.textContent = `Total: $${total.toFixed(2)}`;
}

// Agregar un producto seleccionado
function addProductToList() {
    const selectedProductName = productList.value;
    if (selectedProductName) {
        const selectedProduct = {
            name: selectedProductName,
            price: parseFloat(productList.options[productList.selectedIndex].dataset.price)
        };
        selectedProducts.push(selectedProduct);
        updateSelectedProducts();
    }
}

// Eliminar un producto de la lista
function removeProduct(productName) {
    selectedProducts = selectedProducts.filter(product => product.name !== productName);
    updateSelectedProducts();
}

// Cambiar la visibilidad de los campos
paymentMethod.addEventListener('change', () => {
    if (paymentMethod.value === 'transferencia') {
        accountSelection.style.display = 'block';
        bankSelection.style.display = 'block';
    } else {
        accountSelection.style.display = 'none';
        bankSelection.style.display = 'none';
    }
});

// Guardar factura con confirmación
saveInvoiceButton.addEventListener('click', async () => {
    const confirmSave = window.confirm('¿Estás seguro de guardar la factura?');
    if (!confirmSave) return;

    if (!facturaDate.value || selectedProducts.length === 0 || !trabajadorSelect.value) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const t_pago = paymentMethod.value;
    const cuenta = t_pago === 'transferencia' ? account.value : '';
    const banco = t_pago === 'transferencia' ? document.getElementById('bank').value : '';
    const trabajadora = trabajadorSelect.value;

    try {
        await addDoc(collection(db, 'ventas'), {
            fecha: facturaDate.value,
            productos: selectedProducts.map(product => product.name).join(', '),
            t_pago,
            cuenta,
            banco,
            valor: total,
            trabajadora
        });
        alert("Factura guardada exitosamente.");
        selectedProducts = [];
        total = 0;
        updateSelectedProducts();
        loadProducts();
    } catch (error) {
        console.error("Error al guardar la factura:", error);
    }
});

// Cargar productos y trabajadoras al iniciar
loadProducts();
loadTrabajadoras();

// Función de logout
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
