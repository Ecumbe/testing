document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor', 'cursor-default');
    document.body.appendChild(cursor);

    // Seguir el movimiento del mouse
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.pageX}px`;
        cursor.style.top = `${e.pageY}px`;
    });

    // Cambiar la imagen del cursor al pasar sobre elementos interactivos
    document.querySelectorAll('button, a').forEach(element => {
        element.addEventListener('mouseenter', () => cursor.classList.replace('cursor-default', 'cursor-hover'));
        element.addEventListener('mouseleave', () => cursor.classList.replace('cursor-hover', 'cursor-default'));
    });

    // Cambiar imagen del cursor al hacer clic
    document.addEventListener('mousedown', () => {
        cursor.classList.replace('cursor-default', 'cursor-click');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.replace('cursor-click', 'cursor-default');
    });
});
