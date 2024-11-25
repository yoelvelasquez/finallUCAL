// Importar Firebase y Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD5N3DJJlEYnf2mGa5BTSourXERCyUB4G0",
    authDomain: "proyectoucal.firebaseapp.com",
    projectId: "proyectoucal",
    storageBucket: "proyectoucal.firebasestorage.app",
    messagingSenderId: "715522120394",
    appId: "1:715522120394:web:135a1688f72ec0f2a2f233",
    measurementId: "G-BSK6289N9N"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtener el curso actual desde localStorage
const cursoID = localStorage.getItem("cursoSeleccionado");
const nombreCurso = localStorage.getItem("nombreCurso");

// Obtener el estudianteID desde localStorage
const estudianteID = localStorage.getItem("estudianteID"); // Asegúrate de que esté guardado previamente

// Mostrar el nombre del curso
document.getElementById("nombre-curso").innerText = nombreCurso || "Curso no especificado";

// Función para obtener y mostrar los exámenes
async function obtenerExamenes() {
    const examenesContainer = document.getElementById("examenes-container");
    examenesContainer.innerHTML = "Cargando exámenes...";

    try {
        // Referencia a la subcolección de exámenes
        const examenesRef = collection(db, `cursos/${cursoID}/examenes`);
        const examenesSnapshot = await getDocs(examenesRef);

        if (examenesSnapshot.empty) {
            examenesContainer.innerHTML = "No hay exámenes disponibles para este curso.";
            return;
        }

        // Mostrar los nombres de los exámenes
        let contenido = "";
        examenesSnapshot.forEach((doc) => {
            const examen = doc.data();
            contenido += `<div class="examen-item">
                <p>Nombre del examen: ${examen.nombre}</p>
            </div>`;

            // Crear el elemento del examen
            const examenElement = document.createElement("div");
            examenElement.className = "examen-item";
            examenElement.innerHTML = `
                <p>Nombre del examen: ${examen.nombre}</p>
            `;

            // Hacer que el examen sea clickeable
            examenElement.addEventListener("click", () => {
                // Almacenar el ID del examen y el nombre del curso en localStorage
                localStorage.setItem("examenID", doc.id);  // Guardar el ID del examen
                localStorage.setItem("nombreExamen", examen.nombre);  // Guardar el nombre del examen
                localStorage.setItem("cursoSeleccionado", cursoID);  // Guardar el ID del curso
                localStorage.setItem("nombreCurso", nombreCurso);  // Guardar el nombre del curso

                // Si el estudianteID está disponible, guardarlo también
                if (estudianteID) {
                    localStorage.setItem("estudianteID", estudianteID);  // Guardar el ID del estudiante
                } else {
                    console.warn("No se encontró el estudianteID en localStorage.");
                }

                // Redirigir a la página de responder examen
                window.location.href = "responder.html";
            });

            // Agregar el examen a la vista
            examenesContainer.appendChild(examenElement);
        });
    } catch (error) {
        console.error("Error al obtener los exámenes:", error);
        examenesContainer.innerHTML = "Error al cargar los exámenes.";
    }
}

// Ejecutar la función al cargar la página
obtenerExamenes();
