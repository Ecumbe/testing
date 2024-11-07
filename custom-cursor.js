// custom-cursor.js

// Crear un elemento de imagen para el cursor
const cursor = document.createElement('img');
cursor.src = 'cursor.png'; // Reemplaza con la ruta de tu archivo PNG original
cursor.style.position = 'absolute';
cursor.style.pointerEvents = 'none'; // No interferir con otros elementos interactivos
cursor.style.zIndex = '9999'; // Asegúrate de que esté por encima de otros elementos
document.body.appendChild(cursor);

// Mover el cursor con el mouse
document.addEventListener('mousemove', function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
});

// Cambiar el cursor a otro PNG al hacer clic
document.addEventListener('click', function (event) {
    // Crear un nuevo elemento de imagen para mostrar otro PNG al hacer clic
    const clickCursor = document.createElement('img');
    clickCursor.src = 'cursor1.png'; // Reemplaza con la ruta de tu otro archivo PNG
    clickCursor.style.position = 'absolute';
    clickCursor.style.left = `${event.clientX - 20}px`; // Centra el PNG con respecto al clic
    clickCursor.style.top = `${event.clientY - 20}px`; // Centra el PNG con respecto al clic
    clickCursor.style.pointerEvents = 'none'; // Asegura que no interfiera con otros clics
    clickCursor.style.zIndex = '9998'; // Asegúrate de que no cubra otros elementos
    document.body.appendChild(clickCursor);

    // Eliminar la imagen después de un tiempo para que no se quede en pantalla
    setTimeout(() => {
        clickCursor.remove();
    }, 300); // La imagen se elimina después de 300ms (puedes ajustar el tiempo)
});
