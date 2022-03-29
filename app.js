const inicioDebug = require("debug")("app:inicio");
const dbDebur = require("debug")("app:db");
const express = require("express"); // Importamos express.
const Joi = require("joi"); // Importamos el módulo joi, un validador de datos de Node.
// Joi funciona como un validador, le especificas el formato que debe tener la información que mande el cliente.
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

app.get("/api/usuarios", (req, res) => {
  const SIZE = usuarios.length;
  let salida = "<ul>";
  for (let i = 0; i < SIZE; i++)
    salida += `<li>${usuarios[i].id} - ${usuarios[i].nombre}</li>`;
  salida += "</ul>";
  res.send(salida);
});

// Compartir parámetros dentro de las rutas.
// Por ejemplo, si sólo quisiera consultar un usuario específico en lugar de todos.
// Con los : delante del parámetro id, Express sabe que es un parámetro a recibir.
app.get("/api/usuarios/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  // let usuario = usuarios.find((user) => user.id === parseInt(req.params.id));

  // Duelve el estado 404 de HTTP.
  if (!usuario) res.status(404).send("Este usuario no se encuentra");
  else res.send(`<h1>${usuario.id} - ${usuario.nombre}</h1>`);
});

// Query String: Explícitamente indicar los parámetros que vamos a mandar con un nombre y un signo igual
//	Ej.: http://localhost:3000/api/usuarios/1992/2/sex='m'
// app.get("/api/usuarios/:year/:month/sex=:sex", (req, res) => {
//   res.send(req.params);
// });

// ==================== PETICIONES POST ====================
// Tiene el mismo nombre que la petición GET. Express hace la diferencia
// dependiendo del tipo de petición.
app.post("/api/usuarios", (req, res) => {
  // Creamos una instancia de Joi para validad la entrada que se envía.
  // Validamos lo que nos mande el cliente con el método .validate( object );
  const { value, error } = validarUsuario(req.body);

  // Hacemos uso de la propiedad body de req, que se llena dependiendo de lo que el usuario envíe en la petición.
  // El objeto req tiene la propiedad body.
  if (!error) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: req.body.nombre,
    };
    usuarios.push(usuario);
    return;
  } else {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
  }
});

// ==================== PETICIONES PUT ====================
// Método para actualizar información. Recibe el id del usuario que se quiere modificar.
// Utilizando el parámetro en la ruta con :id.
app.put("/api/usuarios/:id", (req, res) => {
  // Valida que el usuario se encuentre en los registros.
  let usuario = existeUsuario(req.params.id);
  if (!usuario) res.status(404).send("Este usuario no se encuentra");

  // En el body del request, debe venir la información para hacer la actualización.
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });

  const { value, error } = validarUsuario(req.body);
  if (error) {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
    return;
  }

  // Actualiza el nombre del usuario.
  usuario.nombre = value.nombre;
  res.send(usuario);
});

// ==================== PETICIONES DELETE ====================
// Método para elimar información. Recibe el id del usuarioq ue se quiere eliminar
// Utilizando el parámetro en la ruta.
app.delete("/api/usuarios/:id", (req, res) => {
  const usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(400).send("Este usuario no se encuentra");
    return;
  }

  // Encontrar el índice del usuario dentro del arreglo.
  // Devuelve el índice de la primera ocurrencia del elemento.
  const index = usuarios.indexOf(usuario);

  usuarios.splice(index, 1); // Elimina el elemento en el índice indicado.
  res.send(usuario); // Responde con el usuario eliminado.
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

// ==================== FUNCIONES DE UTILIDAD ====================
function existeUsuario(id) {
  return usuarios.find((user) => user.id === parseInt(id));
}

function validarUsuario(body) {
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });

  return schema.validate(body);
}
