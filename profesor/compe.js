import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// Función para obtener los cursos que imparte el profesor
async function obtenerCursosImpartidos(profesorID) {
  const profesorRef = doc(db, "profesores", profesorID);
  const profesorDoc = await getDoc(profesorRef);

  if (!profesorDoc.exists()) {
    console.error("Profesor no encontrado");
    return [];
  }

  // Obtener los cursos que imparte el profesor
  const cursosImpartidos = profesorDoc.data().cursosImpartidos || [];
  return cursosImpartidos;
}

// Función para obtener los estudiantes asignados a los cursos del profesor
async function obtenerEstudiantes(profesorID) {
  try {
    // Obtener los cursos que imparte el profesor
    const cursosImpartidos = await obtenerCursosImpartidos(profesorID);
    if (cursosImpartidos.length === 0) {
      console.log("Este profesor no imparte cursos.");
      return;
    }

    // Obtener los documentos de los estudiantes
    const estudiantesRef = collection(db, "estudiantes");
    const estudiantesSnapshot = await getDocs(estudiantesRef);
    const estudiantesContainer = document.getElementById("estudiantesContainer");

    if (estudiantesSnapshot.empty) {
      estudiantesContainer.innerHTML = "<p>No hay estudiantes asignados a este profesor.</p>";
      return;
    }

    // Iterar sobre los estudiantes
    estudiantesSnapshot.forEach(async (estudianteDoc) => {
      const estudianteData = estudianteDoc.data();
      const estudianteID = estudianteDoc.id; // ID del estudiante
      const estudianteNombre = estudianteData.nombre;
      const cursosAsignados = estudianteData.cursosAsignados || [];

      // Filtrar solo los cursos asignados que el profesor imparte
      const cursosDelProfesor = cursosAsignados.filter(curso => cursosImpartidos.includes(curso));

      // Si el estudiante no tiene cursos del profesor, no lo mostramos
      if (cursosDelProfesor.length === 0) return;

      // Crear un contenedor para cada estudiante
      const estudianteElement = document.createElement("div");
      estudianteElement.classList.add("estudiante");
      estudianteElement.innerHTML = `
        <h3>${estudianteNombre}</h3>
        <p>Cursos asignados:</p>
        <ul>
          ${cursosDelProfesor.map(curso => `<li>${curso}</li>`).join("")}
        </ul>
      `;

      // Agregar un evento para hacer clic en un estudiante
      estudianteElement.addEventListener("click", () => {
        // Guardamos el estudianteID en localStorage
        localStorage.setItem("estudianteID", estudianteID);
        console.log(`Estudiante guardado: ${estudianteNombre} (ID: ${estudianteID})`);
        // Redirigimos al otro HTML
        window.location.href = "datos.html"; // Cambia este nombre al HTML adecuado
      });
      

      // Agregar el estudiante a la lista
      estudiantesContainer.appendChild(estudianteElement);
    });
  } catch (error) {
    console.error("Error al obtener los estudiantes:", error);
  }
}

// Función para mostrar los detalles de un estudiante
async function mostrarDetallesEstudiante(estudianteID) {
  try {
    const estudianteRef = doc(db, "estudiantes", estudianteID);
    const estudianteDoc = await getDoc(estudianteRef);

    if (estudianteDoc.exists()) {
      const estudianteData = estudianteDoc.data();
      const estudianteNombre = estudianteData.nombre;
      const estudianteCursos = estudianteData.cursosAsignados;

      alert(`Estudiante: ${estudianteNombre}\nCursos Asignados: ${estudianteCursos.join(", ")}`);
    } else {
      alert("Estudiante no encontrado.");
    }
  } catch (error) {
    console.error("Error al obtener los detalles del estudiante:", error);
  }
}

// Obtener el ID del profesor (puede estar en el localStorage o en una variable global)
const profesorID = localStorage.getItem("profesorID"); // O el ID dinámico que corresponda

// Llamar la función para obtener los estudiantes
if (profesorID) {
  obtenerEstudiantes(profesorID);
} else {
  console.error("Profesor no encontrado.");
}
