import { db, auth } from './firebaseConfig.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

// Referencias a elementos
const startDateSales = document.getElementById('start-date-sales');
const endDateSales = document.getElementById('end-date-sales');
const employeePercentageInput = document.getElementById('employee-percentage');
const generateSalesReportButton = document.getElementById('generate-sales-report');
const startDateAppointments = document.getElementById('start-date-appointments');
const endDateAppointments = document.getElementById('end-date-appointments');
const generateAppointmentsReportButton = document.getElementById('generate-appointments-report');
const backButton = document.getElementById('back');
const logoutButton = document.getElementById('logout');

// Función para generar reporte de ventas en PDF
async function generateSalesReport() {
    if (!startDateSales.value || !endDateSales.value) {
        alert('Seleccione ambas fechas.');
        return;
    }

    const percentage = parseFloat(employeePercentageInput.value) || 0;

    const q = query(
        collection(db, 'ventas'),
        where('fecha', '>=', startDateSales.value),
        where('fecha', '<=', endDateSales.value)
    );

    const querySnapshot = await getDocs(q);
    const reportData = [];
    let totalValue = 0;

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        reportData.push(data);
        totalValue += data.valor;
    });

    const employeeEarnings = (totalValue * percentage) / 100;

    const pdfContent = [
        {
            image: 'LOGO.png',
            width: 100,
            alignment: 'center',
            margin: [0, 10, 0, 10]
        },
        {
            text: 'Reporte de Ventas',
            fontSize: 18,
            bold: true,
            color: '#834b8f',
            alignment: 'center',
            margin: [0, 10, 0, 20]
        },
        {
            text: `Total de Ventas: $${totalValue.toFixed(2)}\nPorcentaje para Empleado (${percentage}%): $${employeeEarnings.toFixed(2)}`,
            margin: [0, 10, 0, 10],
            color: '#6d3b73'
        },
        {
            text: 'Detalle de Ventas:',
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 5]
        },
        {
            ul: reportData.map(item => `${item.fecha} - ${item.productos || item['que se hara']} - $${item.valor || ''} - ${item.t_pago || ''} ${item.cuenta ? `(${item.cuenta})` : ''}`)
        }
    ];

    pdfMake.createPdf({ content: pdfContent }).download('reporte_ventas.pdf');
}

// Función para generar reporte de citas en PDF
async function generateAppointmentsReport() {
    if (!startDateAppointments.value || !endDateAppointments.value) {
        alert('Seleccione ambas fechas.');
        return;
    }

    const q = query(
        collection(db, 'citas'),
        where('fecha', '>=', startDateAppointments.value),
        where('fecha', '<=', endDateAppointments.value)
    );

    const querySnapshot = await getDocs(q);
    const reportData = [];
    querySnapshot.forEach((doc) => {
        reportData.push(doc.data());
    });

    const pdfContent = [
        {
            image: 'LOGO.png',
            width: 100,
            alignment: 'center',
            margin: [0, 10, 0, 10]
        },
        {
            text: 'Reporte de Citas',
            fontSize: 18,
            bold: true,
            color: '#834b8f',
            alignment: 'center',
            margin: [0, 10, 0, 20]
        },
        {
            text: 'Detalle de Citas:',
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 5]
        },
        {
            ul: reportData.map(item => `${item.fecha} - ${item.detalle || 'Sin detalle'}`)
        }
    ];

    pdfMake.createPdf({ content: pdfContent }).download('reporte_citas.pdf');
}

// Eventos de los botones
generateSalesReportButton.addEventListener('click', generateSalesReport);
generateAppointmentsReportButton.addEventListener('click', generateAppointmentsReport);
backButton.addEventListener('click', () => {
    window.location.href = 'menu.html';
});
logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});
