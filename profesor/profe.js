import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener los cursos y las calificaciones de los estudiantes
async function obtenerCursosYCalificaciones(profesorID) {
  try {
    // Obtener el documento del profesor
    const profesorRef = doc(db, "profesores", profesorID);
    const profesorDoc = await getDoc(profesorRef);

    if (!profesorDoc.exists()) {
      console.error("Profesor no encontrado");
      return;
    }

    // Obtener los cursos que imparte el profesor
    const cursosImpartidos = profesorDoc.data().cursosImpartidos;

    // Obtener todos los estudiantes que tiene asignados el profesor
    const estudiantesRef = collection(db, "estudiantes");
    const estudiantesSnapshot = await getDocs(estudiantesRef);
    
    if (estudiantesSnapshot.empty) {
      console.error("No se encontraron estudiantes");
      return;
    }

    // Iterar sobre todos los estudiantes
    estudiantesSnapshot.forEach(async (estudianteDoc) => {
      const estudianteID = estudianteDoc.id;
      const estudianteData = estudianteDoc.data();
      const estudianteNombre = estudianteData.nombre;
      const cursosAsignados = estudianteData.cursosAsignados;

      // Filtrar los cursos que el estudiante tiene asignados y que el profesor imparte
      const cursosFiltrados = cursosAsignados.filter(curso => cursosImpartidos.includes(curso));

      // Obtener los detalles de los cursos desde la colección "cursos"
      const cursosDetalles = [];
      for (let cursoID of cursosFiltrados) {
        const cursoRef = doc(db, "cursos", cursoID);
        const cursoDoc = await getDoc(cursoRef);
        if (cursoDoc.exists()) {
          cursosDetalles.push({
            id: cursoID,
            nombre: cursoDoc.data().nombre,
            descripcion: cursoDoc.data().descripcion
          });
        }
      }

      // Obtener las calificaciones de los estudiantes por curso desde la subcolección "calificaciones"
      const calificaciones = [];
      for (let cursoID of cursosFiltrados) {
        const calificacionesRef = doc(db, "estudiantes", estudianteID, "calificaciones", cursoID);
        const calificacionesDoc = await getDoc(calificacionesRef);
        if (calificacionesDoc.exists()) {
          const calificacionesCurso = calificacionesDoc.data();

          // Mostrar el promedio ya almacenado en la base de datos
          let promedio = calificacionesCurso.promedio || "No disponible";
          console.log(`Promedio para el curso ${cursoID}:`, promedio); // Depuración del promedio

          // Ordenar los exámenes por su nombre (si es necesario)
          const exámenesOrdenados = Object.entries(calificacionesCurso)
            .filter(([key, value]) => key !== "promedio") // Filtrar el campo "promedio"
            .sort(([examenA], [examenB]) => examenA.localeCompare(examenB)); // Ordenar alfabéticamente

          // Verificar el estado de cada examen
          const exámenesConEstado = exámenesOrdenados.map(([examen, examenData]) => {
            const puntaje = examenData.puntaje; // Acceder al puntaje dentro del mapa del examen
            console.log(`Puntaje para el examen ${examen}:`, puntaje);
            const puntajeNum = Number(puntaje);  // Convertir puntaje a número
            if (isNaN(puntajeNum)) {
              console.error(`Error: El puntaje "${puntaje}" no es un número válido`);
            }
            const estadoExamen = puntajeNum >= 70 ? "Objetivo logrado" : "Objetivo no logrado";
            return { examen, puntaje: puntajeNum, estadoExamen };
          });

          // Verificar el estado del promedio
          const promedioNum = Number(promedio);
          if (isNaN(promedioNum)) {
            console.error(`Error: El promedio "${promedio}" no es un número válido`);
          }
          const estadoPromedio = promedioNum >= 70 ? "Aprobado" : "Desaprobado";

          calificaciones.push({
            cursoID: cursoID,
            calificaciones: exámenesConEstado,
            promedio: promedio,
            estadoPromedio: estadoPromedio
          });
        }
      }

      // Mostrar los resultados en la interfaz de usuario
      const cursosContainer = document.getElementById("cursosContainer");

      // Crear un contenedor para el estudiante
      const estudianteElement = document.createElement("div");
      estudianteElement.classList.add("estudiante");
      estudianteElement.innerHTML = `
        <h2>Estudiante: ${estudianteNombre}</h2>
      `;
      
      cursosDetalles.forEach(curso => {
        const cursoElement = document.createElement("div");
        cursoElement.classList.add("curso");
        cursoElement.innerHTML = `
          <h3>${curso.nombre}</h3>
          <p>${curso.descripcion}</p>
        `;

        // Mostrar el promedio del curso desde Firebase
        const calificacion = calificaciones.find(c => c.cursoID === curso.id);
        if (calificacion) {
          const promedioElement = document.createElement("p");
          promedioElement.textContent = `Promedio: ${calificacion.promedio !== "No disponible" ? calificacion.promedio : "No disponible"}`;
          const estadoPromedioElement = document.createElement("p");
          estadoPromedioElement.textContent = `Estado del Promedio: ${calificacion.estadoPromedio}`;
          cursoElement.appendChild(promedioElement);
          cursoElement.appendChild(estadoPromedioElement);

          // Mostrar las calificaciones de cada examen
          const calificacionesElement = document.createElement("div");
          calificacionesElement.classList.add("calificaciones");

          // Mostrar los exámenes ordenados con su estado
          calificacion.calificaciones.forEach(({ examen, puntaje, estadoExamen }) => {
            const examenElement = document.createElement("p");
            examenElement.textContent = `${examen}: ${puntaje} - ${estadoExamen}`;
            calificacionesElement.appendChild(examenElement);
          });
          
          cursoElement.appendChild(calificacionesElement);
        } else {
          const sinCalificaciones = document.createElement("p");
          sinCalificaciones.textContent = "No hay calificaciones disponibles";
          cursoElement.appendChild(sinCalificaciones);
        }

        estudianteElement.appendChild(cursoElement);
      });

      cursosContainer.appendChild(estudianteElement);
    });

  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

// Llamada a la función para obtener y mostrar los datos (ejemplo de uso)
obtenerCursosYCalificaciones("profesor_1");


