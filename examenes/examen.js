// Importar Firebase y Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, doc, collection, getDocs, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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

// Cargar los exámenes del curso
async function cargarExamenes() {
    const cursoID = localStorage.getItem("cursoSeleccionado");

    if (!cursoID) {
        alert("No se ha seleccionado un curso.");
        window.location.href = "/inicio_sesion/login.html"; // Redirigir si no hay curso seleccionado
        return;
    }

    try {
        // Obtener la referencia al curso
        const cursoRef = doc(db, "cursos", cursoID);
        // Obtener los exámenes asociados a ese curso
        const examenesRef = collection(cursoRef, "examenes");
        const examenesSnapshot = await getDocs(examenesRef);

        const examenesContainer = document.getElementById("examenes-container");
        examenesContainer.innerHTML = ""; // Limpiar cualquier contenido previo

        if (!examenesSnapshot.empty) {
            // Iterar sobre los exámenes y mostrarlos
            examenesSnapshot.forEach((examenDoc) => {
                const examenData = examenDoc.data();
                const examenNombre = examenData.nombre;

                // Crear un elemento para cada examen
                const examenElement = document.createElement("div");
                examenElement.classList.add("examen-item");
                examenElement.innerHTML = `
                    <h3>${examenNombre}</h3>
                    <p>Haz clic para ver las preguntas</p>
                `;

                // Agregar un eventListener para manejar el clic en un examen
                examenElement.addEventListener("click", async () => {
                    // Verificar y almacenar el ID del examen seleccionado
                    const examenID = examenDoc.id;
                    console.log("Examen seleccionado:", examenID); // Verifica si el examen es el correcto

                    // Actualizar el localStorage solo si el ID es diferente
                    if (localStorage.getItem("examenSeleccionado") !== examenID) {
                        localStorage.setItem("examenSeleccionado", examenID); // Guardar ID del examen
                        console.log("ID del examen actualizado en localStorage:", examenID); // Verifica si se guarda correctamente
                    }

                    // Cargar las preguntas del examen seleccionado
                    await cargarPreguntas(examenID); // Llamar a la función para cargar preguntas

                    window.location.href = "responder.html"; // Redirigir a la página de detalles
                });

                // Añadir el examen al contenedor
                examenesContainer.appendChild(examenElement);
            });
        } else {
            examenesContainer.innerHTML = "No se encontraron exámenes para este curso.";
        }
    } catch (error) {
        console.error("Error al obtener los exámenes:", error);
        document.getElementById("examenes-container").innerHTML = "Error al cargar los exámenes.";
    }
}

// Cargar las preguntas de un examen seleccionado
async function cargarPreguntas() {
    const examenID = localStorage.getItem("examenSeleccionado");
    const cursoID = localStorage.getItem("cursoSeleccionado");

    console.log("Examen seleccionado desde localStorage:", examenID); // Verifica si el ID del examen es el correcto

    if (!examenID) {
        console.log("No se ha seleccionado un examen.");
        return;
    }

    try {
        // Obtener la referencia al examen
        const examenRef = doc(db, "cursos", cursoID, "examenes", examenID);
        // Obtener las preguntas asociadas a ese examen
        const preguntasRef = collection(examenRef, "preguntas");
        const preguntasSnapshot = await getDocs(preguntasRef);

        const preguntasContainer = document.getElementById("preguntas-container");
        preguntasContainer.innerHTML = ""; // Limpiar cualquier contenido previo

        if (!preguntasSnapshot.empty) {
            // Iterar sobre las preguntas y mostrarlas
            preguntasSnapshot.forEach((preguntaDoc) => {
                const preguntaData = preguntaDoc.data();
                const preguntaTexto = preguntaData.pregunta;
                const alternativas = preguntaData.alternativa;

                // Mostrar en consola la pregunta y alternativas
                console.log("Pregunta:", preguntaTexto);
                console.log("Alternativas:", alternativas);

                // Crear un elemento para cada pregunta
                const preguntaElement = document.createElement("div");
                preguntaElement.classList.add("pregunta-item");
                preguntaElement.innerHTML = `
                    <h4>${preguntaTexto}</h4>
                    <ul>
                        ${alternativas.map((alternativa) => `<li>${alternativa}</li>`).join("")}
                    </ul>
                `;

                // Añadir la pregunta al contenedor
                preguntasContainer.appendChild(preguntaElement);
            });
        } else {
            preguntasContainer.innerHTML = "No se encontraron preguntas para este examen.";
        }
    } catch (error) {
        console.error("Error al obtener las preguntas:", error);
    }
}

// Función para calcular el promedio y actualizarlo en Firestore
async function calcularPromedio() {
    const estudianteID = localStorage.getItem("estudianteID");
    const cursoID = localStorage.getItem("cursoSeleccionado");

    if (!estudianteID || !cursoID) {
        alert("No se ha seleccionado un estudiante o un curso.");
        return;
    }

    try {
        // Obtener la referencia al estudiante
        const estudianteRef = doc(db, "estudiantes", estudianteID);
        // Obtener las calificaciones del estudiante en el curso seleccionado
        const calificacionesRef = doc(estudianteRef, "calificaciones", cursoID);
        const calificacionesDoc = await getDoc(calificacionesRef);

        if (!calificacionesDoc.exists()) {
            alert("No se encontraron calificaciones para este estudiante en este curso.");
            return;
        }

        const calificacionesData = calificacionesDoc.data();
        const examenesIDs = Object.keys(calificacionesData);

        let totalPuntaje = 0;
        let numExamenes = 0;

        // Iterar sobre los exámenes y calcular el total de puntajes
        examenesIDs.forEach((examenID) => {
            const puntaje = calificacionesData[examenID]?.puntaje;
            if (puntaje !== undefined) {
                totalPuntaje += puntaje;
                numExamenes++;
            }
        });

        // Calcular el promedio
        if (numExamenes > 0) {
            const promedio = totalPuntaje / numExamenes;
            document.getElementById("promedio-valor").textContent = promedio.toFixed(2);

            // Actualizar el promedio en Firestore
            await updateDoc(calificacionesRef, {
                promedio: promedio
            });

            alert(`El promedio ha sido actualizado: ${promedio.toFixed(2)}`);
        } else {
            document.getElementById("promedio-valor").textContent = "No hay exámenes con puntaje.";
        }
    } catch (error) {
        console.error("Error al calcular el promedio:", error);
    }
}

// Añadir un event listener al botón para calcular el promedio
document.getElementById("calcular-promedio").addEventListener("click", calcularPromedio);

// Llamar a la función para cargar los exámenes cuando la página se cargue
document.addEventListener("DOMContentLoaded", cargarExamenes);
