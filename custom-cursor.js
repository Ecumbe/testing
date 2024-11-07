document.addEventListener('DOMContentLoaded', () => {
    // Crear el cursor y agregarlo al body
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor', 'cursor-default');
    document.body.appendChild(cursor);

    // Función para mover el cursor
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.pageX}px, ${e.pageY}px)`;
    });

    // Cambia la imagen del cursor al pasar sobre un botón o enlace
    document.querySelectorAll('button, a').forEach(element => {
        element.addEventListener('mouseenter', () => cursor.classList.replace('cursor-default', 'cursor-hover'));
        element.addEventListener('mouseleave', () => cursor.classList.replace('cursor-hover', 'cursor-default'));
    });

    // Cambia la imagen del cursor al hacer clic
    document.addEventListener('mousedown', () => {
        cursor.classList.replace('cursor-default', 'cursor-click');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.replace('cursor-click', 'cursor-default');
    });
});
