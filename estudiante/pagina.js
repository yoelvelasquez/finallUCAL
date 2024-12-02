import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD5N3DJJlEYnf2mGa5BTSourXERCyUB4G0",
    authDomain: "proyectoucal.firebaseapp.com",
    projectId: "proyectoucal",
    storageBucket: "proyectoucal.firebasestorage.app",
    messagingSenderId: "715522120394",
    appId: "1:715522120394:web:135a1688f72ec0f2a2f233",
    measurementId: "G-BSK6289N9N"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// cargar los datos del estudiante y cursos
async function cargarDatosEstudiante() {
    const correo = localStorage.getItem("correo");
    if (!correo) {
        alert("No se ha iniciado sesión. Redirigiendo...");
        window.location.href = "/inicio_sesion/login.html";
        return;
    }

    try {
        // datos del estudiante
        const estudianteSnapshot = await getDocs(collection(db, "estudiantes"));
        let estudianteData = null;
        let estudianteID = null;

        estudianteSnapshot.forEach((doc) => {
            if (doc.data().correo === correo) {
                estudianteData = doc.data();
                estudianteID = doc.id;
            }
        });

        if (!estudianteData) {
            alert("Estudiante no encontrado.");
            return;
        }
        
        // Guardar el estudianteID en localStorage
        localStorage.setItem("estudianteID", estudianteID);

        // Mostrar nombre
        document.getElementById("nombre-estudiante").innerText = estudianteData.nombre;

        // Obtener cursos del estudiante creo
        const cursosAsignados = estudianteData.cursosAsignados;
        const cursosContainer = document.getElementById("cursos-container");
        cursosContainer.innerHTML = "";

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

                //que se pueda dar click al nombre xd
                cursoElement.addEventListener("click", () => {
                    localStorage.setItem("cursoSeleccionado", cursoId);
                    localStorage.setItem("nombreCurso", cursoData.nombre);
                    window.location.href = "../examenes/examen.html";
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

cargarDatosEstudiante();