// Importar Firebase y Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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

// Función de inicio de sesión
async function iniciarSesion() {
    const correo = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Correo ingresado: ", correo);
    console.log("Contraseña ingresada: ", password);

    try {
        // Verificar si es un estudiante
        const estudianteQuery = query(collection(db, "estudiantes"), where("correo", "==", correo));
        const estudianteSnapshot = await getDocs(estudianteQuery);

        if (!estudianteSnapshot.empty) {
            const estudianteData = estudianteSnapshot.docs[0].data();

            if (estudianteData.password === password) {
                console.log("Inicio de sesión exitoso como estudiante");
                document.getElementById("mensaje-exito").innerText = "Has iniciado sesión correctamente como estudiante.";

                // Guardar en el localStorage
                localStorage.setItem("correo", correo);
                localStorage.setItem("rol", "estudiante");
                localStorage.setItem("estudianteID", estudianteSnapshot.docs[0].id);



                // Redirigir a la página de estudiante
                setTimeout(() => {
                    window.location.href = "../estudiante/pagina.html";
                }, 2000);
                return;
            } else {
                console.log("Contraseña incorrecta");
                alert("Contraseña incorrecta");
                return;
            }
        }

        // Verificar si es un profesor
        const profesorQuery = query(collection(db, "profesores"), where("correo", "==", correo));
        const profesorSnapshot = await getDocs(profesorQuery);

        if (!profesorSnapshot.empty) {
            const profesorData = profesorSnapshot.docs[0].data();

            if (profesorData.password === password) {
                console.log("Inicio de sesión exitoso como profesor");
                document.getElementById("mensaje-exito").innerText = "Has iniciado sesión correctamente como profesor.";

                // Guardar en el localStorage
                localStorage.setItem("correo", correo);
                localStorage.setItem("rol", "profesor");
                localStorage.setItem("profesorID", profesorSnapshot.docs[0].id);

                // Redirigir a la página de profesor
                setTimeout(() => {
                    window.location.href = "../profesor/profe.html";
                }, 2000);
                return;
            } else {
                console.log("Contraseña incorrecta");
                alert("Contraseña incorrecta");
                return;
            }
        }

        // Si no hay usuario
        console.log("El correo no está registrado en ninguna colección");
        alert("Correo no registrado.");
    } catch (error) {
        console.error("Error al verificar el inicio de sesión:", error.message);
        alert("Error al autenticarte. Intenta nuevamente.");
    }
}

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    iniciarSesion();
});

