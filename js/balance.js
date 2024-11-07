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

    const employeeEarnings = totalValue * (percentage / 100);

    // Llamada a función para generar el PDF usando PDFMake
    const docDefinition = {
        content: [
            { text: 'Reporte de Ventas', fontSize: 16, bold: true },
            {
                table: {
                    body: [
                        ['Fecha', 'Productos', 'Valor', 'Tipo de Pago', 'Cuenta'].map(text => ({ text, bold: true })),
                        ...reportData.map(item => [
                            item.fecha,
                            item.productos || item['que se hara'],
                            item.valor || '',
                            item.t_pago || '',
                            item.cuenta || ''
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

// Función para generar reporte de citas en PDF
async function generateSalesReport() {
    if (!startDateSales.value || !endDateSales.value) {
        alert('Seleccione ambas fechas.');
        return;
    }

    const q = query(
        collection(db, 'citas'),
        where('fecha', '>=', startDateSales.value),
        where('fecha', '<=', endDateSales.value)
    );

    const querySnapshot = await getDocs(q);
    const reportData = [];

    querySnapshot.forEach((doc) => {
        reportData.push(doc.data());
    });

    // Definición del documento PDF
    const docDefinition = {
        content: [
            {
                image: 'LOGO.png', // Ruta del logo
                width: 100,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },
            { text: 'Reporte de Citas Agendadas', fontSize: 16, bold: true, color: '#007ACC', alignment: 'center', margin: [0, 0, 0, 20] },
            {
                table: {
                    
                    body: [
                        ['Fecha','Nombre''Descripción','Hora''Asistió'].map(text => ({ text, bold: true })),
                        /*[
                            { text: 'Fecha', bold: true, fillColor: '#007ACC', color: '#FFFFFF' },
                            { text: 'Nombre', bold: true, fillColor: '#007ACC', color: '#FFFFFF' },
                            { text: 'Descripción', bold: true, fillColor: '#007ACC', color: '#FFFFFF' },
                            { text: 'Hora', bold: true, fillColor: '#007ACC', color: '#FFFFFF' },
                            { text: 'Asistió', bold: true, fillColor: '#007ACC', color: '#FFFFFF' }
                        ],*/
                        ...reportData.map(item => [
                            item.fecha,
                            item.nombre|| '',
                            item.descripcion|| '',
                            item.hora|| '',
                            item.asistio ? 'Sí' : 'No'
                        ])
                    ]
                }
            }
        ],
        defaultStyle: {
            font: 'Helvetica'
        }
    };

    pdfMake.createPdf(docDefinition).download('Reporte_de_Citas.pdf');
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
