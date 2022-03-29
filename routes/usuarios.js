const express = require("express"); // Importamos express.
// Joi funciona como un validador, le especificas el formato que debe tener la información que mande el cliente.
const Joi = require("joi"); // Importamos el módulo joi, un validador de datos de Node.
const ruta = express.Router();

ruta.get("/", (req, res) => {
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
ruta.get("/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  // let usuario = usuarios.find((user) => user.id === parseInt(req.params.id));

  // Duelve el estado 404 de HTTP.
  if (!usuario) res.status(404).send("Este usuario no se encuentra");
  else res.send(`<h1>${usuario.id} - ${usuario.nombre}</h1>`);
});

// Query String: Explícitamente indicar los parámetros que vamos a mandar con un nombre y un signo igual
//	Ej.: http://localhost:3000/api/usuarios/1992/2/sex='m'
// ruta.get("/api/usuarios/:year/:month/sex=:sex", (req, res) => {
//   res.send(req.params);
// });

// ==================== PETICIONES POST ====================
// Tiene el mismo nombre que la petición GET. Express hace la diferencia
// dependiendo del tipo de petición.
ruta.post("/", (req, res) => {
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
ruta.put("/:id", (req, res) => {
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
ruta.delete("/:id", (req, res) => {
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

module.exports = ruta;
