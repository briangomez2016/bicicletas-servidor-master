require( './models/Bicicletero' );
require( './models/Bicicleta' );
require( './models/Usuario' );
require( './models/Admin' );

const express = require( 'express' );
const expressWs = require( 'express-ws' );
const requireAuth = require( './middlewares/requireAuth' );
const { sendOk, sendErr } = require( './routes/utils' );
const mongoose = require( 'mongoose' );
const bodyParser = require( 'body-parser' );
const config = require( '../config' );

const Usuario = mongoose.model( 'Usuario' );
const Bicicleta = mongoose.model( 'Bicicleta' );
const Bicicletero = mongoose.model( 'Bicicletero' );

const authRoutes = require( './routes/authRoutes' );
const adminAuthRoutes = require( './routes/adminAuthRoutes' );
const bicicletasRoutes = require( './routes/bicicletasRoutes' );
const vistasRoutes = require( './routes/vistasRoutes' );

const app = express();
app.use( bodyParser.json() );
app.use( express.static( __dirname + '/public' ) );
app.use( vistasRoutes );
app.use( adminAuthRoutes );
app.use( authRoutes );
app.use( bicicletasRoutes );

mongoose.connect( config.mongoUri, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
} );

mongoose.connection.on( 'connected', () => {
	console.log( 'Connected to mongo instance' );
} );

mongoose.connection.on( 'error', ( error ) => {
	console.log( 'Error connecting to mongo', error );
} );

app.post( '/ocupar_bicicleta', requireAuth, async ( req, res ) => {
	const { id_bicicleta } = req.body;

	if ( !id_bicicleta )
		return sendErr( res, 'Faltan parámetros.' );

	if ( !req.usuario || req.usuario.id_bicicleta )
		return sendErr( res, 'El usuario no puede ocupar esta bicicleta.' );

	const bicicleta = await Bicicleta.findOne( { identificador: id_bicicleta } );

	if ( !bicicleta )
		return sendErr( res, 'No se encontró la bicicleta.' );

	if ( bicicleta.id_bicicletero === null )
		return sendErr( res, 'Bicicleta ocupada.' );

	const id_bicicletero = bicicleta.id_bicicletero;

	enviarMensajeBicicletero( id_bicicletero, 'abrir;' + bicicleta.posicion,
		async () => {
			try {
				req.usuario.id_bicicleta = bicicleta.identificador;
				await req.usuario.save();

				bicicleta.id_bicicletero = null;
				bicicleta.posicion = null;
				bicicleta.usuario = req.usuario.telefono;
				await bicicleta.save();

				return sendOk( res, '' );
			} catch ( err ) {
				return sendErr( res, 'No se pudo obtener la bicicleta.' );
			}
		}, () => {
			return sendErr( res, 'No se pudo conectar con el bicicletero.' );
		} );
} );

app.post( '/devolver_bicicleta', requireAuth, async ( req, res ) => {
	const { id_bicicletero, posicion } = req.body;

	if ( !id_bicicletero || !posicion )
		return sendErr( res, 'Faltan parámetros.' );

	if ( !req.usuario || req.usuario.id_bicicleta === null )
		return sendErr( res, 'El usuario no puede devolver esta bicicleta.' );

	const bicicletero = await Bicicletero.findOne({ identificador: id_bicicletero });

	if ( !bicicletero )
		return sendErr( res, 'No se encontró el bicicletero.' );
	
	const ocupada = await Bicicleta.findOne({ id_bicicletero, posicion });

	if ( ocupada )
		return sendErr( res, 'Posición ocupada.' );


	const bicicleta = await Bicicleta.findOne({ identificador: req.usuario.id_bicicleta });

	if ( !bicicleta )
		return sendErr( res, 'No se encontró la bicicleta.' );

	enviarMensajeBicicletero( id_bicicletero, 'cerrar;' + posicion,
		async () => {
			try {
				bicicleta.posicion = posicion;
				bicicleta.id_bicicletero = id_bicicletero;
				await bicicleta.save();

				req.usuario.id_bicicleta = null;
				await req.usuario.save();

				return sendOk( res, '' );
			} catch ( err ) {
				return sendErr( res, 'No se pudo devolver la bicicleta.' );
			}
		}, () => {
			return sendErr( res, 'No se pudo conectar con el bicicletero.' );
		} );
} );

const appWs = expressWs( app );
let bicicleteros = {};

const enviarMensajeBicicletero = ( id, mensaje, success, error ) => {
	if ( !bicicleteros[id] )
		return error();

	bicicleteros[id].pos = mensaje.split( ';' )[1];
	bicicleteros[id].callback = success;
	bicicleteros[id].socket.send( mensaje );

	console.log( 'enviarMensajeBicicletero', id, mensaje );

	setTimeout( () => {
		if ( bicicleteros[id].callback )
		{
			bicicleteros[id].callback = null;
			error();
		}
	}, 10000 );
};

app.ws( '/echo', socket => {
	let id = null;

	socket.on( 'message', ( msg ) => {
		const [ type, data ] = msg.split( ';' );

		console.log( msg );

		switch ( type )
		{
			case 'identificador' :
				id = data;
				bicicleteros[id] = { id, socket };
				break;
			default :
				console.log( 'default', data, bicicleteros[id].pos );
				if ( bicicleteros[id].callback && parseInt( bicicleteros[id].pos ) === parseInt( data ) )
				{
					console.log( 'def if' );
					bicicleteros[id].callback();
					bicicleteros[id].callback = null;
				}
				break;
		}
	} );
} );

const PORT = process.env.PORT || 3000;

app.listen( PORT, () => {
	console.log( 'Listening on port ' + PORT );
} );
