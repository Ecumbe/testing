import { db, auth } from './firebaseConfig.js';
import { collection, getDocs, query, where, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
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

// Función para obtener el porcentaje de una trabajadora desde la base de datos
async function getWorkerPercentage(trabajadora) {
    const workerDoc = await getDoc(doc(db, 'trabajadoras', trabajadora));
    if (workerDoc.exists()) {
        return workerDoc.data().percentage || 0;
    }
    return 0;
}

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

    for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Obtener porcentaje de ganancia de la trabajadora
        const workerPercentage = await getWorkerPercentage(data.trabajadora);
        const workerEarnings = data.valor * (workerPercentage / 100);

        reportData.push({
            fecha: data.fecha,
            productos: data.productos || data['que se hara'],
            valor: data.valor,
            t_pago: data.t_pago,
            cuenta: data.cuenta,
            banco: data.banco,
            trabajadora: data.trabajadora,
            workerEarnings: workerEarnings.toFixed(2),
        });
        totalValue += data.valor;
    }

    const employeeEarnings = totalValue * (percentage / 100);

    // Llamada a función para generar el PDF usando PDFMake
    const docDefinition = {
        content: [
            { text: 'Reporte de Servicos Realizados', fontSize: 16, bold: true },
            {
                table: {
                    body: [
                        ['Fecha', 'Productos', 'Valor', 'Tipo de Pago', 'Cuenta', 'Banco', 'Trabajadora', 'Ganancia Trabajadora'].map(text => ({ text, bold: true })),
                        ...reportData.map(item => [
                            item.fecha,
                            item.productos,
                            item.valor || '',
                            item.t_pago || '',
                            item.cuenta || '',
                            item.banco || '',
                            item.trabajadora || '',
                            `$${item.workerEarnings}`
                        ])
                    ]
                }
            },
            { text: `Total de Ventas: $${totalValue.toFixed(2)}`, bold: true },
            { text: `Porcentaje para Empleado (${percentage}%): $${employeeEarnings.toFixed(2)}`, bold: true }
        ]
    };

    pdfMake.createPdf(docDefinition).download('Reporte_de_Ventas.pdf');
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
