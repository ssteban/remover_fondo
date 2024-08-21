const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('imagen_remover');
const preview = document.getElementById('preview');
const imagesContainer = document.getElementById('imagesContainer');
const downloadButtonContainer = document.getElementById('downloadButtonContainer');

// Evento para arrastrar y soltar
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const files = e.dataTransfer.files;
    fileInput.files = files; // Asigna los archivos arrastrados al input
    mostrarVistaPrevia(files[0]);
});

// Evento para clic
uploadBox.addEventListener('click', () => {
    fileInput.click(); // Abre el selector de archivos
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        mostrarVistaPrevia(fileInput.files[0]);
    }
});

// Función para mostrar la vista previa
function mostrarVistaPrevia(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        preview.innerHTML = '';
        preview.appendChild(img);
    };
}

// Función para remover el fondo (simulado para este ejemplo)
function remover() {
    const originalImage = preview.querySelector('img');
    if (!originalImage) {
        alert('Por favor, selecciona una imagen primero.');
        return;
    }

    // Convertir la imagen original a Base64
    convertImageToBase64(originalImage.src)
        .then(base64Image => {
            enviarImagen(base64Image);
        })
        .catch(error => {
            console.error('Error al convertir la imagen a Base64:', error);
        });
}

// Función para convertir la imagen a Base64
function convertImageToBase64(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL.split(',')[1]); // Obtener solo la parte base64 sin el prefijo 'data:image/png;base64,'
        };

        img.onerror = () => {
            reject(new Error('No se pudo cargar la imagen.'));
        };
    });
}

// Función para enviar la imagen al backend
function enviarImagen(base64Image) {
    fetch('/procesar_imagen', {  // Cambia la URL a la correcta de tu servidor
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Image })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Datos recibidos del servidor:', data);
        mostrarImagenes(data.original, data.procesada);
    })
    .catch(error => {
        console.error('Error al enviar la imagen:', error);
    });
}

// Función para mostrar las imágenes original y procesada
function mostrarImagenes(originalSrc, procesadaSrc) {
    preview.innerHTML = '';

    imagesContainer.innerHTML = `
        <div>
            <h3>Imagen Original</h3>
            <img src="${originalSrc}" alt="Imagen Original">
        </div>
        <div>
            <h3>Imagen Sin Fondo</h3>
            <img src="${procesadaSrc}" alt="Imagen Sin Fondo">
        </div>
    `;

    // Crear botón de descarga centrado
    downloadButtonContainer.innerHTML = `
        <button class="centered-button" onclick="descargarImagen('${procesadaSrc}')">Descargar Imagen Sin Fondo</button>
    `;
}

// Función para descargar la imagen sin fondo
function descargarImagen(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'imagen-sin-fondo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
