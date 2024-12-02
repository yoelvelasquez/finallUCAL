
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

// Función para cargar las preguntas y alternativas
async function cargarPreguntas() {
    const preguntasContainer = document.getElementById("preguntas-container");
    preguntasContainer.innerHTML = "Cargando preguntas...";

    const examenID = localStorage.getItem("examenSeleccionado");
    const cursoID = localStorage.getItem("cursoSeleccionado");
    const estudianteID = localStorage.getItem("estudianteID");

    // Verificar si los IDs están en localStorage
    if (!examenID || !cursoID || !estudianteID) {
        console.log("Error: Algunos IDs no están en localStorage");
        alert("No se puede cargar el examen. Por favor, regresa y selecciona un examen, curso y estudiante.");
        return; // Detener la ejecución si los valores no existen
    }

    console.log("Examen ID:", examenID);
    console.log("Curso ID:", cursoID);
    console.log("Estudiante ID:", estudianteID);

    try {
        // Verificar que el examen exista en Firestore
        const examenRef = doc(db, "cursos", cursoID, "examenes", examenID);
        const examenDoc = await getDoc(examenRef);

        if (!examenDoc.exists()) {
            console.error("No se encontró el examen en Firestore.");
            preguntasContainer.innerHTML = "No se encontró el examen en la base de datos.";
            return;
        }

        console.log("Examen encontrado:", examenDoc.data());

        // Obtener las preguntas
        const preguntasRef = collection(examenRef, "preguntas");
        const preguntasSnapshot = await getDocs(preguntasRef);

        console.log("Número de preguntas:", preguntasSnapshot.size);

        if (preguntasSnapshot.empty) {
            preguntasContainer.innerHTML = "No hay preguntas disponibles para este examen.";
            return;
        }

        // Limpiar contenido antes de mostrar las nuevas preguntas
        preguntasContainer.innerHTML = "";

        let puntaje = 0;

        // Iterar a través de las preguntas y sus alternativas
        preguntasSnapshot.forEach((preguntaDoc) => {
            const preguntaData = preguntaDoc.data();
            console.log("Pregunta:", preguntaData.pregunta);
            console.log("Alternativas:", preguntaData.alternativa);

            const preguntaElemento = document.createElement("div");
            preguntaElemento.className = "pregunta-item";

            // Mostrar la pregunta
            preguntaElemento.innerHTML = `<h3>${preguntaData.pregunta}</h3>`;

            // Crear las alternativas como radio buttons
            const alternativaContainer = document.createElement("div");
            if (preguntaData.alternativa && preguntaData.alternativa.length > 0) {
                preguntaData.alternativa.forEach((alternativa, index) => {
                    const label = document.createElement("label");
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = `pregunta-${preguntaDoc.id}`; 
                    input.value = alternativa;

                    label.appendChild(input);
                    label.appendChild(document.createTextNode(alternativa));
                    alternativaContainer.appendChild(label);
                    alternativaContainer.appendChild(document.createElement("br"));
                });
            } else {
                // Si no hay alternativas
                alternativaContainer.innerHTML = "<p>No hay alternativas disponibles para esta pregunta.</p>";
            }

            preguntaElemento.appendChild(alternativaContainer);
            preguntasContainer.appendChild(preguntaElemento);

            // Almacenar la respuesta correcta para luego verificarla
            preguntaElemento.addEventListener("change", () => {
                const selectedAnswer = document.querySelector(`input[name="pregunta-${preguntaDoc.id}"]:checked`);
                if (selectedAnswer) {
                    console.log("Respuesta seleccionada:", selectedAnswer.value);
                    if (selectedAnswer.value === preguntaData.respuestaCorrecta) {
                        puntaje += 20;
                        console.log("Respuesta correcta. Puntaje actual:", puntaje);
                    } else {
                        console.log("Respuesta incorrecta.");
                    }
                }
            });
        });

        // Crear el botón de enviar para el examen
        const botonEnviar = document.createElement("button");
        botonEnviar.innerText = "Enviar Respuestas";
        botonEnviar.addEventListener("click", async () => {
            // Guardar el puntaje en localStorage
            localStorage.setItem("puntaje", puntaje);
            alert(`Tu puntaje es: ${puntaje}`);

            // Actualizar el puntaje en la subcolección de Firestore
            const estudianteRef = doc(db, "estudiantes", estudianteID);
            const calificacionesRef = doc(estudianteRef, "calificaciones", cursoID);
            await updateDoc(calificacionesRef, {
                [`${examenID}.puntaje`]: puntaje
            });

            alert(`Tu puntaje ha sido guardado en tu perfil.`);
        });

        preguntasContainer.appendChild(botonEnviar);
    } catch (error) {
        console.error("Error al cargar las preguntas:", error);
        preguntasContainer.innerHTML = "Error al cargar las preguntas.";
    }
}

cargarPreguntas();


