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

    const trabajadorasPorcentajes = {};

    // Obtener porcentaje de cada trabajadora desde la base de datos
    const trabajadorasSnapshot = await getDocs(collection(db, 'trabajadoras'));
    trabajadorasSnapshot.forEach((doc) => {
        const data = doc.data();
        trabajadorasPorcentajes[data.nombre] = data.porcentaje; // Guardamos el porcentaje de cada trabajadora por su nombre
    });

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        reportData.push(data);
        totalValue += data.valor;
    });

    // Calcular ganancias para cada trabajadora
    const trabajadorasGanancias = {};
    reportData.forEach(item => {
        const trabajadora = item.trabajadora;
        const porcentaje = trabajadorasPorcentajes[trabajadora] || 0; // Usar el porcentaje desde la base de datos
        const ganancia = item.valor * (porcentaje / 100);
        
        if (!trabajadorasGanancias[trabajadora]) {
            trabajadorasGanancias[trabajadora] = 0;
        }
        trabajadorasGanancias[trabajadora] += ganancia;
    });

    // Definición del documento PDF
    const docDefinition = {
        content: [
            { text: 'Reporte de Servicos Realizados', fontSize: 16, bold: true },
            {
                table: {
                    body: [
                        ['Fecha', 'Productos', 'Valor', 'Tipo de Pago', 'Cuenta', 'Banco', 'Trabajadora', 'Ganancia'].map(text => ({ text, bold: true })),
                        ...reportData.map(item => [
                            item.fecha,
                            item.productos || item['que se hara'],
                            item.valor || '',
                            item.t_pago || '',
                            item.cuenta || '',
                            item.banco || '',
                            item.trabajadora || '',
                            `$${(item.valor * (trabajadorasPorcentajes[item.trabajadora] || 0) / 100).toFixed(2)}`
                        ])
                    ]
                }
            },
            { text: `Total de Ventas: $${totalValue.toFixed(2)}`, bold: true },
            ...Object.entries(trabajadorasGanancias).map(([trabajadora, ganancia]) => ({
                text: `Ganancia para ${trabajadora}: $${ganancia.toFixed(2)}`,
                bold: true
            }))
        ]
    };

    pdfMake.createPdf(docDefinition).download('Reporte_de_Ventas.pdf');
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
    if (reportData.length === 0) {
        alert('No se encontraron citas en el rango de fechas seleccionado.');
        return;
    }

    // Definición del documento PDF
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
