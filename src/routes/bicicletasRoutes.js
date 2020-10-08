const express = require( 'express' );
const fs = require( 'fs' );
const path = require( 'path' );
const requireAuth = require( '../middlewares/requireAuth' );
const { sendOk, sendErr } = require( './utils' );
const mongoose = require( 'mongoose' );

const Usuario = mongoose.model( 'Usuario' );
const Bicicletero = mongoose.model( 'Bicicletero' );
const Bicicleta = mongoose.model( 'Bicicleta' );

const router = express.Router();

router.post( '/crear_bicicletero', requireAuth, async ( req, res ) => {
	const { nombre, ubicacion, latitud, longitud } = req.body;

	if ( !nombre || !ubicacion || !latitud || !longitud )
		return sendErr( res, 'Faltan parámetros.' );

	let bicicletero = await Bicicletero.findOne( { nombre } );

	const bicicletero_id = parseInt( fs.readFileSync( path.resolve( __dirname + '../../../bicicletero_id' ) ) ) + 1;
	const identificador = 'B' + bicicletero_id;
	fs.writeFileSync( path.resolve( __dirname + '../../../bicicletero_id' ), bicicletero_id );

	if ( !bicicletero )
	{
		bicicletero = new Bicicletero( { identificador, nombre, ubicacion, latitud, longitud } );
		await bicicletero.save();
		
		return sendOk( res, identificador );
	}
	else
		return sendErr( res, 'Nombre ya está en uso.' );
} );

router.post( '/borrar_bicicletero', requireAuth, async ( req, res ) => {
	const { identificador } = req.body;

	if ( !identificador )
		return sendErr( res, 'Faltan parámetros.' );

	try {
		await Bicicletero.deleteOne( { identificador } );

		return sendOk( res, '' );
	} catch ( err ) {
		return sendErr( res, err.message );
	}
} );

router.get( '/obtener_bicicleteros', requireAuth, async ( req, res ) => {
	sendOk( res, await Bicicletero.find() );
} );

router.post( '/crear_bicicleta', requireAuth, async ( req, res ) => {
	const { id_bicicletero, posicion } = req.body;

	if ( !id_bicicletero )
		return sendErr( res, 'Faltan parámetros.' );

	const bicicleta_id = parseInt( fs.readFileSync( path.resolve( __dirname + '../../../bicicleta_id' ) ) ) + 1;
	const identificador = 'b' + bicicleta_id;
	fs.writeFileSync( path.resolve( __dirname + '../../../bicicleta_id' ), bicicleta_id );

	try {
		const bicicleta = new Bicicleta( { identificador, id_bicicletero, posicion } );
		bicicleta.save();

		return sendOk( res, identificador );
	} catch ( err ) {
		return sendErr( res, err.message );
	}
} );

router.post( '/borrar_bicicleta', requireAuth, async ( req, res ) => {
	const { identificador } = req.body;

	if ( !identificador )
		return sendErr( res, 'Faltan parámetros.' );

	try {
		await Bicicleta.deleteOne( { identificador } );

		return sendOk( res, '' );
	} catch ( err ) {
		return sendErr( res, err.message );
	}
} );

router.get( '/obtener_bicicletas', requireAuth, async ( req, res ) => {
	sendOk( res, await Bicicleta.find() );
} );

router.get( '/tiene_bicicleta_ocupada', requireAuth, ( req, res ) => {
	if ( !req.usuario )
		return sendErr( res, 'Debe iniciar como usuario.' );

	sendOk( res, req.usuario.id_bicicleta );
} );

router.post( '/confirmar_devolucion', requireAuth, ( req, res ) => {
	sendOk( res, req.usuario );
} );

module.exports = router;
