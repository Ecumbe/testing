document.addEventListener('DOMContentLoaded', () => {
    console.log("Custom cursor script loaded");  // Verifica la carga del archivo

    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor', 'cursor-default');
    document.body.appendChild(cursor);

    // Mover el cursor personalizado
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.pageX}px, ${e.pageY}px)`;
    });

    // Cambiar imagen del cursor al pasar sobre elementos
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
