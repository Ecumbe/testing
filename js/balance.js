import { db, auth } from './firebaseConfig.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

// Referencias a elementos
const startDateSales = document.getElementById('start-date-sales');
const endDateSales = document.getElementById('end-date-sales');
const generateSalesReportButton = document.getElementById('generate-sales-report');
const startDateAppointments = document.getElementById('start-date-appointments');
const endDateAppointments = document.getElementById('end-date-appointments');
const generateAppointmentsReportButton = document.getElementById('generate-appointments-report');
const backButton = document.getElementById('back');
const logoutButton = document.getElementById('logout');

// Función para obtener el porcentaje de ganancia de cada trabajadora
async function getTrabajadoraPercentage(trabajadoraName) {
    const q = query(collection(db, 'trabajadoras'), where('nombre', '==', trabajadoraName));
    const querySnapshot = await getDocs(q);
    const trabajadoraData = querySnapshot.docs[0]?.data();
    return trabajadoraData ? trabajadoraData.percentage : 0;
}

// Función para generar reporte de ventas en PDF
async function generateSalesReport() {
    if (!startDateSales.value || !endDateSales.value) {
        alert('Seleccione ambas fechas.');
        return;
    }

    const q = query(
        collection(db, 'ventas'),
        where('fecha', '>=', startDateSales.value),
        where('fecha', '<=', endDateSales.value)
    );

    const querySnapshot = await getDocs(q);
    const reportData = [];
    let totalValue = 0;
    const trabajadoraEarnings = {};

    // Procesar cada venta para calcular ganancias por trabajadora
    for (const doc of querySnapshot.docs) {
        const data = doc.data();
        reportData.push(data);
        totalValue += data.valor;

        const trabajadoraName = data.trabajadora || '';
        if (!trabajadoraEarnings[trabajadoraName]) {
            trabajadoraEarnings[trabajadoraName] = { totalSales: 0, percentage: 0, earnings: 0 };
            trabajadoraEarnings[trabajadoraName].percentage = await getTrabajadoraPercentage(trabajadoraName);
        }

        trabajadoraEarnings[trabajadoraName].totalSales += data.valor;
        trabajadoraEarnings[trabajadoraName].earnings = trabajadoraEarnings[trabajadoraName].totalSales * (trabajadoraEarnings[trabajadoraName].percentage / 100);
    }

    // Crear contenido para el PDF con la ganancia por trabajadora
    const content = [
        { text: 'Reporte de Servicios Realizados', fontSize: 16, bold: true },
        {
            table: {
                body: [
                    ['Fecha', 'Productos', 'Valor', 'Tipo de Pago', 'Cuenta', 'Banco', 'Trabajadora'].map(text => ({ text, bold: true })),
                    ...reportData.map(item => [
                        item.fecha,
                        item.productos || item['que se hara'],
                        item.valor || '',
                        item.t_pago || '',
                        item.cuenta || '',
                        item.banco || '',
                        item.trabajadora || ''
                    ])
                ]
            }
        },
        { text: `Total de Ventas: $${totalValue.toFixed(2)}`, bold: true },
        { text: 'Ganancias por Trabajadora:', bold: true }
    ];

    // Añadir ganancias por trabajadora al contenido del PDF solo si tienen un porcentaje y ganancia mayor a 0
    Object.keys(trabajadoraEarnings).forEach(trabajadoraName => {
        const { percentage, earnings } = trabajadoraEarnings[trabajadoraName];
        if (percentage > 0 && earnings > 0) {
            content.push({ text: `${trabajadoraName} gana el ${percentage}% = $${earnings.toFixed(2)}`, margin: [0, 5, 0, 0] });
        }
    });

    const docDefinition = { content };
    pdfMake.createPdf(docDefinition).download('Reporte_de_Ventas.pdf');
}

// Función para generar reporte de citas en PDF (sin cambios)
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
    if (reportData.length === 0) {
        alert('No se encontraron citas en el rango de fechas seleccionado.');
        return;
    }

    const docDefinition = {
        content: [
            {
                text: 'Reporte de Citas Agendadas',
                fontSize: 16,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*', '*', '*'],
                    body: [
                        [
                            { text: 'Fecha', bold: true },
                            { text: 'Nombre', bold: true },
                            { text: 'Descripción', bold: true },
                            { text: 'Hora', bold: true },
                            { text: 'Asistió', bold: true }
                        ],
                        ...reportData.map(item => [
                            item.fecha,
                            item.nombre,
                            item.descripcion,
                            item.hora,
                            item.asistio ? 'Sí' : 'No'
                        ])
                    ]
                }
            }
        ]
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
