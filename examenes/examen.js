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

// Cargar los exámenes, datos del estudiante y curso
async function cargarExamenes() {
    const cursoID = localStorage.getItem("cursoSeleccionado");

    if (!cursoID) {
        alert("No se ha seleccionado un curso.");
        window.location.href = "/inicio_sesion/login.html";
        return;
    }

    try {
        // Obtener la referencia al curso
        const cursoRef = doc(db, "cursos", cursoID);
        // Obtener los datos del curso
        const cursoSnapshot = await getDoc(cursoRef);

        if (cursoSnapshot.exists()) {
            const cursoData = cursoSnapshot.data();
            document.getElementById("nombre-curso").textContent = cursoData.nombre;
        } else {
            alert("Curso no encontrado.");
        }

        // Obtener el correo del estudiante desde localStorage
        const correo = localStorage.getItem("correo");
        if (!correo) {
            alert("No se ha iniciado sesión. Redirigiendo...");
            window.location.href = "/inicio_sesion/login.html";
            return;
        }

        // Obtener los datos del estudiante
        const estudiantesSnapshot = await getDocs(collection(db, "estudiantes"));
        let estudianteData = null;
        estudiantesSnapshot.forEach((doc) => {
            if (doc.data().correo === correo) {
                estudianteData = doc.data();
            }
        });

        if (estudianteData) {
            document.getElementById("estudiante-info").textContent = `Bienvenido, ${estudianteData.nombre}`;
        } else {
            alert("Estudiante no encontrado.");
        }

        // Obtener los exámenes del curso
        const examenesRef = collection(cursoRef, "examenes");
        const examenesSnapshot = await getDocs(examenesRef);

        const examenesContainer = document.getElementById("examenes-container");
        examenesContainer.innerHTML = "";

        if (!examenesSnapshot.empty) {
            examenesSnapshot.forEach((examenDoc) => {
                const examenData = examenDoc.data();
                const examenNombre = examenData.nombre;
                const competencia = examenData.competencia || "No definida";

                const examenElement = document.createElement("div");
                examenElement.classList.add("examen-item");
                examenElement.innerHTML = `
                    <h3>${examenNombre}</h3>
                    <p><strong>Competencia:</strong> ${competencia}</p>
                    <p>Haz clic para ver las preguntas</p>
                `;

                examenElement.addEventListener("click", async () => {
                    const examenID = examenDoc.id;
                    localStorage.setItem("examenSeleccionado", examenID);
                    await cargarPreguntas(examenID);
                    window.location.href = "responder.html";
                });

                examenesContainer.appendChild(examenElement);
            });
        } else {
            examenesContainer.innerHTML = "No se encontraron exámenes para este curso.";
        }
    } catch (error) {
        console.error("Error al cargar los exámenes:", error);
        document.getElementById("examenes-container").innerHTML = "Error al cargar los exámenes.";
    }
}

// Cargar las preguntas de un examen seleccionado
async function cargarPreguntas() {
    const examenID = localStorage.getItem("examenSeleccionado");
    const cursoID = localStorage.getItem("cursoSeleccionado");

    if (!examenID) {
        console.log("No se ha seleccionado un examen.");
        return;
    }

    try {
        const examenRef = doc(db, "cursos", cursoID, "examenes", examenID);
        const preguntasRef = collection(examenRef, "preguntas");
        const preguntasSnapshot = await getDocs(preguntasRef);

        const preguntasContainer = document.getElementById("preguntas-container");
        preguntasContainer.innerHTML = "";

        if (!preguntasSnapshot.empty) {
            preguntasSnapshot.forEach((preguntaDoc) => {
                const preguntaData = preguntaDoc.data();
                const preguntaTexto = preguntaData.pregunta;
                const alternativas = preguntaData.alternativa;

                const preguntaElement = document.createElement("div");
                preguntaElement.classList.add("pregunta-item");
                preguntaElement.innerHTML = `
                    <h4>${preguntaTexto}</h4>
                    <ul>
                        ${alternativas.map((alternativa) => `<li>${alternativa}</li>`).join("")}
                    </ul>
                `;

                preguntasContainer.appendChild(preguntaElement);
            });
        } else {
            preguntasContainer.innerHTML = "No se encontraron preguntas para este examen.";
        }
    } catch (error) {
        console.error("Error al obtener las preguntas:", error);
    }
}

// Función para calcular el promedio
async function calcularPromedio() {
    const estudianteID = localStorage.getItem("estudianteID");
    const cursoID = localStorage.getItem("cursoSeleccionado");

    if (!estudianteID || !cursoID) {
        alert("No se ha seleccionado un estudiante o un curso.");
        return;
    }

    try {
        const estudianteRef = doc(db, "estudiantes", estudianteID);
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

        examenesIDs.forEach((examenID) => {
            const puntaje = calificacionesData[examenID]?.puntaje;
            if (puntaje !== undefined) {
                totalPuntaje += puntaje;
                numExamenes++;
            }
        });

        if (numExamenes > 0) {
            const promedio = totalPuntaje / numExamenes;
            document.getElementById("promedio-valor").textContent = promedio.toFixed(2);

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

document.getElementById("btn-ver-competencias").addEventListener("click", () => {
    window.location.href = "../estudiante/competencias.html"; // Puedes cambiar la ruta si lo necesitas
});

// Event listener para calcular el promedio
document.getElementById("calcular-promedio").addEventListener("click", calcularPromedio);

// Llamar a la función para cargar los exámenes y los datos cuando la página se cargue
document.addEventListener("DOMContentLoaded", cargarExamenes);

