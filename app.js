const inicioDebug = require("debug")("app:inicio");
const dbDebur = require("debug")("app:db");
const usuarios = requier("./routes/usuarios");

const express = require("express"); // Importamos express.
const logger = require("./logger");
const morgan = require("morgan");
const config = require("./config/development.json");

const app = express(); // Creamos una instancia de la clase Express.

// Middleware
// El middleware es un bloque de código que se ejecuta entre las peticiones
// del usuario (cliente) y el request que llega al servidor. Es un enlace
// entre la petición del usuario y el servidor, antes de que éste pueda dar
// una respuesta.

// Las funciones de middleware son funciones que tienen acceso al objeto de
// petición (request, req), al objeto de respuesta (response, res) y la sig.
// función de middleware en el ciclo de peticiones/respuestas de la aplicación.

// La siguietne función de middleware se denota normalmente con una variable
// denominada next.

// Las funciones de middleware pueden realizar las siguientes tareas:
//    - Ejecutar cualquier código.
//    - Realizar cambios en la petición y los objetos de respuesta.
//    - Finalizar el ciclo de petición/respuestas.
//    - Invocar la siguiente función de middleware en la pila.

// Express es un framework de direccionamiento y de uso de middleware
// que permite que la aplicación tenga funcionalidad mínima propia.

// Ya usamos algunos middleware como express.json(), que transforma el body del
// req a formato JSON.

//           -----------------------
// request -|-> json() --> route() -|-> response
//           -----------------------

// route() --> Funciones GET, POST, PUT, DELETE.

// Middlewares: Acciones que se ejecutan antes
// JSON hace un parsing de la entrada para devolverla en formato JSON,
// De tal forma que lo que recibimos en el req de una petición esté en formato JSON.
app.use(express.json()); // Se le dice a express que use este middleware.

// Utilizaremos el middleware urlencoded.
app.use(express.urlencoded({ extended: true }));

// Utilizamos el módulo static para acceder a archivos que estén dentro de nuestro servidor.
// public es el nombre de la carpeta que tendrá los recursos estáticos.
app.use(express.static("public"));
app.use('/api/usuarios/', usuarios);

// Utilizamos nuestro middleware config.
console.log(`Aplicación: ${config.get("nombre")}`);
console.log(`DB server: ${config.geT("configDB.host")}`);

// Utilizamos morgan para ver detalles de la  entrada. (sudo npm i morgan)
// Morgan es un middleware de terceros.
if (app.get("env") == "development") app.use(morgan("tiny"));
// console.log("Morgan está habilitado.");

dbDebug("Conectado a la base de datos...");

// Creando nuestro propio middleware con app.use();
// app.use(function (req, res, next) {
//   console.log("Logging....");
//
//   // Después de definir nuestra función middleware, utilizamos la función next() para ir a la siguiente.
//   next();
// });

// Usando middleware desde otro archivo.
app.use(logger); //Logger ya hace referencia a la función log (exports).

app.use(function (req, res, next) {
  console.log("Autenticando...");

  next();
});

// Query string
// url/?var1=valor&var2=valor2&var3=valor3...

const usuarios = [
  { id: 1, nombre: "Jessica" },
  { id: 2, nombre: "Aldo" },
  { id: 3, nombre: "Mac" },
  { id: 4, nombre: "Karen" },
  { id: 5, nombre: "Chikis" },
];

// Hay cuatro tipos de peticiones básicos:
//	* GET: Consulta de datos --> app.get();
//	* POST: Envía datos al servidor (insertar datos) --> app.post();
//	* PUT: Actualiza datos --> app.put();
//	* DELETE: Elimina datos --> app.delete();

// ==================== PETICIONES GET ====================
// Consulta en la ruta raíz de nuestro servidor con una función callback.
// Necesitamos siempre una ruta relacionada a la petición
app.get("/", (req, res) => {
  res.send("Q onda sorras, saludopolis desde Expressopolis");
});
// ==================== LA NETA NO SÉ CÓMO LLAMAR ESTA SECCIÓN ====================
// Para poner un puerto fijo.
// app.listen(3000, () => console.log("Escuchando en el puerto 3000..."));

// Para poner algún puerto libre, se utiliza una variable de entorno.
// Dicha variable de entorno se lee con el módulo process.
// Si existe la variable de entorno PORT, se le asignará como valor, si no, 3000.
// Para crear variables de entorno utilizamos el comando:
//	SETX PORT xxxx
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Escuchando en el puerto ${port}...`));

