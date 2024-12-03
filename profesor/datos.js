import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
  console.log("Cursos impartidos por el profesor:", cursosImpartidos); // Verificación
  return cursosImpartidos;
}

// Función para buscar estudiantes por nombre
async function obtenerEstudiantePorNombre(nombreEstudiante) {
  const estudiantesRef = collection(db, "estudiantes");
  const q = query(estudiantesRef, where("nombre", "==", nombreEstudiante));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.error(`Estudiante con nombre ${nombreEstudiante} no encontrado.`);
    return null;
  }

  // Si encontramos al estudiante, devolver el primer documento
  const estudianteDoc = querySnapshot.docs[0];
  return { id: estudianteDoc.id, data: estudianteDoc.data() };
}

// Función para cargar las competencias de los estudiantes asignados al profesor
async function cargarCompetencias() {
  const profesorID = localStorage.getItem("profesorID"); // Profesor ID para filtrar los cursos

  if (!profesorID) {
    alert("No se ha encontrado el ID del profesor.");
    return;
  }

  try {
    // Obtener los cursos que imparte el profesor
    const cursosImpartidos = await obtenerCursosImpartidos(profesorID);
    if (cursosImpartidos.length === 0) {
      alert("Este profesor no imparte cursos.");
      return;
    }

    // Obtener los estudiantes por nombre desde un formulario o un listado
    const estudiantesNombres = ["Putin Love Shady", "Dina Trump", "Will Smith", "Chuck Norris"]; // Ejemplo de nombres de estudiantes

    // Contenedor donde se mostrarán las competencias
    const competenciasContainer = document.getElementById("competencias-container");
    competenciasContainer.innerHTML = ""; // Limpiar el contenedor antes de agregar nuevos elementos

    // Iterar sobre los estudiantes
    for (let nombreEstudiante of estudiantesNombres) {
      const estudiante = await obtenerEstudiantePorNombre(nombreEstudiante);
      if (!estudiante) {
        console.log(`No se encontró al estudiante ${nombreEstudiante}.`);
        continue; // Si no se encuentra el estudiante, omitimos
      }

      const estudianteID = estudiante.id;
      const estudianteData = estudiante.data;
      const estudianteNombre = estudianteData.nombre;
      const cursosAsignados = estudianteData.cursosAsignados || [];

      console.log("Estudiante:", estudianteNombre); // Verificación de estudiante
      console.log("Cursos asignados a este estudiante:", cursosAsignados);

      // Filtrar los cursos que están asignados al estudiante y son impartidos por el profesor
      const cursosDelProfesor = cursosAsignados.filter(curso => cursosImpartidos.includes(curso));

      console.log("Cursos del profesor para este estudiante:", cursosDelProfesor); // Verificación

      if (cursosDelProfesor.length === 0) {
        console.log(`Este estudiante no tiene cursos asignados del profesor.`);
        continue; // Si el estudiante no tiene cursos del profesor, lo omitimos
      }

      // Crear un contenedor separado para este estudiante
      const estudianteElement = document.createElement("div");
      estudianteElement.classList.add("estudiante-item");
      estudianteElement.innerHTML = `<h2>Estudiante: ${estudianteNombre}</h2>`;
      competenciasContainer.appendChild(estudianteElement);

      // Iterar sobre los cursos del estudiante
      for (const curso of cursosDelProfesor) {
        // Obtener las calificaciones de este estudiante para el curso
        const calificacionesRef = doc(db, "estudiantes", estudianteID, "calificaciones", curso);
        const calificacionesDoc = await getDoc(calificacionesRef);

        if (!calificacionesDoc.exists()) {
          console.log(`No se encontraron calificaciones para el curso: ${curso}`); // Verificación
          continue; // Si no tiene calificaciones para este curso, lo omitimos
        }

        const calificacionesData = calificacionesDoc.data();
        
        // Llamar a la función para mostrar las competencias de este curso
        mostrarCompetencias(calificacionesData, curso, estudianteElement);
      }
    }
  } catch (error) {
    console.error("Error al obtener las competencias:", error);
  }
}

// Función para mostrar las competencias de un curso específico
function mostrarCompetencias(calificacionesData, curso, estudianteElement) {
  // Recorrer los exámenes del curso y mostrar las competencias
  Object.keys(calificacionesData).forEach(examenID => {
    const examen = calificacionesData[examenID]; // Obtenemos el map de cada examen

    // Verificar que el examen tenga los datos necesarios
    if (examen && examen.competencia && examen.puntaje !== undefined) {
      let statusMessage = examen.puntaje >= 70 ? "Competencia cumplida" : "No se cumplió la competencia";

      // Crear un contenedor para cada competencia
      const competenciaElement = document.createElement("div");
      competenciaElement.classList.add("competencia-item");

      // Mostrar las competencias
      competenciaElement.innerHTML = `
        <h3>Examen: ${examenID}</h3>
        <p>Competencia: ${examen.competencia}</p>
        <p>Puntaje: ${examen.puntaje}</p>
        <p>Status: ${statusMessage}</p>
      `;

      // Agregar el contenedor de competencia al contenedor del estudiante
      estudianteElement.appendChild(competenciaElement);
    }
  });
}

// Cargar las competencias cuando la página esté lista
document.addEventListener("DOMContentLoaded", cargarCompetencias);
