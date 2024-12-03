// Importar Firebase y Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, doc, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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

// Cargar las competencias del estudiante
async function cargarCompetencias() {
    const cursoID = localStorage.getItem("cursoSeleccionado");
    const correo = localStorage.getItem("correo");

    if (!cursoID || !correo) {
        alert("No se ha seleccionado un curso o no se ha iniciado sesión.");
        window.location.href = "/inicio_sesion/login.html"; // Redirigir si no se encuentra la información
    }

    try {
        // Obtener los datos del estudiante
        const estudiantesSnapshot = await getDocs(collection(db, "estudiantes"));
        let estudianteData = null;
        let estudianteID = null;

        estudiantesSnapshot.forEach((doc) => {
            if (doc.data().correo === correo) {
                estudianteData = doc.data();
                estudianteID = doc.id;  // El ID del documento es el ID del estudiante
            }
        });

        if (estudianteData) {
            document.getElementById("estudiante-info").textContent = `Bienvenido, ${estudianteData.nombre}`;
        } else {
            alert("Estudiante no encontrado.");
        }

        // Verificar que el estudiante tenga un ID válido
        if (!estudianteID) {
            alert("No se encontró el ID del estudiante.");
            return;
        }

        // Obtener las calificaciones del estudiante en el curso
        const calificacionesRef = doc(db, "estudiantes", estudianteID, "calificaciones", cursoID);
        const calificacionesDoc = await getDoc(calificacionesRef);

        if (!calificacionesDoc.exists()) {
            alert("No se encontraron calificaciones para este estudiante en este curso.");
            return;
        }

        const calificacionesData = calificacionesDoc.data();
        const examenCompetencias = calificacionesData;

        // Definir el puntaje máximo (por ejemplo, 100 puntos)
        const puntajeMaximo = 100;

        // Crear gráfico de competencia
        const competenciasData = Object.keys(examenCompetencias).map(examenID => {
            const competencia = examenCompetencias[examenID];

            // Eliminar el campo 'promedio' si está presente en el examen
            if (examenID.toLowerCase() === 'promedio') {
                return null;  // No agregar este examen a la lista de competencias
            }

            let puntaje = competencia.puntaje;

            // Eliminar el campo 'promedio' si está presente en el objeto de competencia
            if (competencia.promedio) {
                console.log("Eliminando campo 'promedio' de competencia:", competencia);
                delete competencia.promedio;
            }

            // Verificar que el puntaje sea un número válido
            if (typeof puntaje !== 'number' || isNaN(puntaje)) {
                console.error(`Valor inválido para puntaje: ${puntaje}`);
                return {
                    examen: examenID,
                    competencia: competencia.competencia,
                    porcentaje: 0,
                    cumplioCompetencia: false
                };
            }

            // Calcular el porcentaje: (puntaje / puntajeMaximo) * 100
            const porcentaje = (puntaje / puntajeMaximo) * 100;

            // Verificar si el porcentaje es mayor o igual al 70%
            const cumplioCompetencia = porcentaje >= 70;

            return {
                examen: examenID,
                competencia: competencia.competencia,
                porcentaje: porcentaje,
                cumplioCompetencia: cumplioCompetencia
            };
        }).filter(Boolean);  // Eliminar cualquier examen nulo (como 'promedio')

        // Mostrar las competencias
        renderizarCompetencias(competenciasData);

    } catch (error) {
        console.error("Error al obtener las competencias:", error);
    }
}

// Renderizar los gráficos y la información de competencias
function renderizarCompetencias(competenciasData) {
    const competenciasContainer = document.getElementById("competencias-container");
    competenciasContainer.innerHTML = ""; // Limpiar el contenedor

    competenciasData.forEach(competencia => {
        const competenciaElement = document.createElement("div");
        competenciaElement.classList.add("competencia-item");

        let statusMessage = competencia.cumplioCompetencia ? "Competencia cumplida" : "No se cumplió la competencia";

        // Mostrar las competencias
        competenciaElement.innerHTML = `
        <h3>Examen: ${competencia.examen}</h3>
        <p>Competencia: ${competencia.competencia}</p>
        <p>Progreso: ${competencia.porcentaje.toFixed(2)}%</p>
        <p>Status: ${statusMessage}</p>
    `;

        // Si el porcentaje es menor al 70%, mostrar una alerta
        if (!competencia.cumplioCompetencia) {
            alert(`La competencia de ${competencia.examen} no se cumplió. Progreso: ${competencia.porcentaje.toFixed(2)}%`);
        }

        competenciasContainer.appendChild(competenciaElement);
    });

    // Crear el gráfico de progreso de competencia
    const ctx = document.getElementById("competencia-chart").getContext("2d");
    const chartData = competenciasData.map(item => item.porcentaje);

    new Chart(ctx, {
        type: 'bar', // Tipo de gráfico (puede ser 'pie', 'line', etc.)
        data: {
            labels: competenciasData.map(item => item.examen),
            datasets: [{
                label: 'Progreso de Competencia (%)',
                data: chartData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Cargar las competencias al cargar la página
document.addEventListener("DOMContentLoaded", cargarCompetencias);
