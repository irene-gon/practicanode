//importaciones
const http = require("http");
const queryString = require("querystring");
// Importar el cliente de MongoDB
const MongoClient = require("mongodb").MongoClient;



// Especificar la URL de conexión por defecto al servidor local
const url = "mongodb://localhost:27017";
// Nombre de la base de datos a la que conectarse
//const dbName = 'nodejs-mongo';
const dbName = "node";
// Crear una instancia del cliente de MongoDB
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});






const server = http.createServer((request, response) => {
  console.log("Servidor creado");
  const { headers, method, url, data } = request;

  let q = {};
  let resultados;
  let body = [];
  if (method == "POST") {
    console.log("es de tipo post");

    request
      .on("error", (err) => {
        console.error(err);
      })
      .on("data", (chunk) => {
        // El cuerpo de la petición puede venir en partes, aquí se concatenan;
        body.push(chunk);
      })
      .on("end", () => {
        // El cuerpo de la petición está completo
        body = Buffer.concat(body).toString();
        console.log("body: ", body);
        //parsear body
        q = queryString.parse(body);
        console.log("q:", q);
        
      });
      // Conectar el cliente al servidor
client.connect().then(async () => {
    console.log("Conectado con éxito al servidor");
    const db = client.db(dbName);
    // Obtener la referencia a la colección
    const collection = db.collection('users');
    insert(collection,q,function(err,result){
        if (!err){
            console.log ("Resultado inserccion",result.result);
        }
    });
    resultados= await collection.find({}).toArray();
        // Código de estado HTTP que se devuelve
        response.statusCode = 200;
        // Encabezados de la respuesta, texto plano
        response.setHeader("Content-Type", "text/plain");
        var myJsonString = JSON.stringify(resultados);
        console.log ("JSON",myJsonString.toString());
        response.write(myJsonString);
       // response.write('</body></html>')
        //response.write(resultados.toString());
        response.end();
}). catch((error) => {
    response.statusCode = 401;
    response.end();
    console.log(error);
    client.close();
});

  } else {
      console.log("No es de tipo post");
      response.end();}


  
});

server.listen(3000, () => console.log("Escuchando petciones"));


function insert (collection, document, callback){
collection.insertOne(document, function(err,result){
    if (err)
    {console.log("error insertando datos",err);}
    callback(err,result);
});
}
