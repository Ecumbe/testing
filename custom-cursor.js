document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor', 'cursor-default');
    document.body.appendChild(cursor);

    // Mueve el cursor a la posición exacta del mouse
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    // Cambia la imagen del cursor al pasar sobre enlaces o botones
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
