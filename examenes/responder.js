// Importar Firebase y Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, doc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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

    const examenID = localStorage.getItem("examenID");
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
        // Referencia al examen y sus preguntas
        const examenRef = doc(db, "cursos", cursoID, "examenes", examenID);
        const preguntasRef = collection(examenRef, "preguntas");
        const preguntasSnapshot = await getDocs(preguntasRef);

        if (preguntasSnapshot.empty) {
            preguntasContainer.innerHTML = "No hay preguntas disponibles para este examen.";
            return;
        }

        // Limpiar contenido antes de mostrar las nuevas preguntas
        preguntasContainer.innerHTML = "";

        let puntaje = 0; // Variable para almacenar el puntaje

        // Iterar a través de las preguntas y sus alternativas
        preguntasSnapshot.forEach((preguntaDoc) => {
            const preguntaData = preguntaDoc.data();
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
                    input.name = `pregunta-${preguntaDoc.id}`; // Asegurarse de que el nombre sea único por pregunta
                    input.value = alternativa; // Valor de la alternativa

                    label.appendChild(input);
                    label.appendChild(document.createTextNode(alternativa));
                    alternativaContainer.appendChild(label);
                    alternativaContainer.appendChild(document.createElement("br"));
                });
            } else {
                // Si no hay alternativas, mostrar un mensaje
                alternativaContainer.innerHTML = "<p>No hay alternativas disponibles para esta pregunta.</p>";
            }

            preguntaElemento.appendChild(alternativaContainer);
            preguntasContainer.appendChild(preguntaElemento);

            // Almacenar la respuesta correcta para luego verificarla
            preguntaElemento.addEventListener("change", () => {
                const selectedAnswer = document.querySelector(`input[name="pregunta-${preguntaDoc.id}"]:checked`);
                if (selectedAnswer) {
                    if (selectedAnswer.value === preguntaData.respuestaCorrecta) {
                        puntaje++; // Incrementar el puntaje si la respuesta es correcta
                    }
                }
            });
        });

        // Crear el botón de enviar para el examen
        const botonEnviar = document.createElement("button");
        botonEnviar.innerText = "Enviar Respuestas";
        botonEnviar.addEventListener("click", async () => {
            // Guardar el puntaje en localStorage (si solo deseas mostrarlo)
            localStorage.setItem("puntaje", puntaje);
            alert(`Tu puntaje es: ${puntaje}`);

            // Actualizar el puntaje dentro de la subcolección "calificaciones" del estudiante en Firebase
            const estudianteRef = doc(db, "estudiantes", estudianteID);
            const calificacionesRef = doc(estudianteRef, "calificaciones", cursoID); // Usamos el cursoID como el nombre del documento
            await updateDoc(calificacionesRef, {
                [`${examenID}.puntaje`]: puntaje // Guardar el puntaje en el documento de la subcolección
            });

            alert(`Tu puntaje ha sido guardado en tu perfil.`);
        });

        preguntasContainer.appendChild(botonEnviar);
    } catch (error) {
        console.error("Error al cargar las preguntas:", error);
        preguntasContainer.innerHTML = "Error al cargar las preguntas.";
    }
}

// Ejecutar la función para cargar las preguntas al cargar la página
cargarPreguntas();

