// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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





// Función para cargar los datos del estudiante y renderizar cursos
async function cargarDatosEstudiante() {
    const correo = localStorage.getItem("correo"); // Obtenemos el correo desde localStorage
    if (!correo) {
        alert("No se ha iniciado sesión. Redirigiendo...");
        window.location.href = "/inicio_sesion/login.html";
        return;
    }

    try {
        // Obtener datos del estudiante
        const estudianteSnapshot = await getDocs(collection(db, "estudiantes"));
        let estudianteData = null;
        let estudianteID = null; // Variable para almacenar el ID del estudiante

        estudianteSnapshot.forEach((doc) => {
            if (doc.data().correo === correo) {
                estudianteData = doc.data();
                estudianteID = doc.id; // Obtener el ID del documento de Firestore
            }
        });

        if (!estudianteData) {
            alert("Estudiante no encontrado.");
            return;
        }
        
        // Guardar el estudianteID en localStorage
        localStorage.setItem("estudianteID", estudianteID);

        // Mostrar nombre del estudiante
        document.getElementById("nombre-estudiante").innerText = estudianteData.nombre;

        // Obtener cursos asignados
        const cursosAsignados = estudianteData.cursosAsignados;
        const cursosContainer = document.getElementById("cursos-container");
        cursosContainer.innerHTML = ""; // Limpiar mensaje de carga

        for (const cursoId of cursosAsignados) {
            const cursoRef = doc(db, "cursos", cursoId);
            const cursoSnapshot = await getDoc(cursoRef);

            if (cursoSnapshot.exists()) {
                const cursoData = cursoSnapshot.data();
                const cursoElement = document.createElement("div");
                cursoElement.className = "curso-card";
                cursoElement.innerHTML = ` 
                    <h3>${cursoData.nombre}</h3>
                    <p>${cursoData.descripcion}</p>
                `;

                // Hacer que la tarjeta sea clickeable
                cursoElement.addEventListener("click", () => {
                    localStorage.setItem("cursoSeleccionado", cursoId);
                    window.location.href = "../examenes/examen.html";
                    localStorage.setItem("cursoSeleccionado", cursoId);
                    localStorage.setItem("nombreCurso", cursoData.nombre);
                });

                cursosContainer.appendChild(cursoElement);
            } else {
                console.error(`Curso con ID ${cursoId} no encontrado.`);
            }
        }
    } catch (error) {
        console.error("Error al cargar los datos del estudiante:", error);
        alert("Error al cargar los datos.");
    }
}

// Llamar a la función principal
cargarDatosEstudiante();

