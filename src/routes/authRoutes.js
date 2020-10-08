const express = require( 'express' );
const { sendOk, sendErr } = require( './utils' );
const mongoose = require( 'mongoose' );
const jwt = require( 'jsonwebtoken' );
const config = require( '../../config' );

const Usuario = mongoose.model( 'Usuario' );

const router = express.Router();

const get_codigo = () => {
	return Math.floor( Math.random() * ( 9999 - 1000 ) + 1000 );
};

router.post( '/obtener_codigo', async ( req, res ) => {
	const { telefono } = req.body;

	if ( !telefono )
		return sendErr( res, 'Faltan parámetros.' );

	let usuario = await Usuario.findOne( { telefono } );
	const codigo = get_codigo();

	if ( !usuario )
	{
		try {
			usuario = new Usuario( { telefono, codigo, id_bicicleta: null } );
			console.log( telefono, codigo );
			await usuario.save();

			// TODO: Enviar código por mensaje
			return sendOk( res, '' );
		} catch ( err ) {
			return sendErr( res, err.message );
		}
	}
	else
	{
		try {
			if ( !usuario.codigo )
			{
				usuario.codigo = codigo;
				console.log( telefono, codigo );
				await usuario.save();
			}

			// TODO: Enviar código por mensaje
			return sendOk( res, '' );
		} catch ( err ) {
			return sendErr( res, err.message );
		}
	}
} );

router.post( '/validar_codigo', async ( req, res ) => {
	const { telefono, codigo } = req.body;

	if ( !telefono || !codigo )
		return sendErr( res, 'Faltan parámetros.' );

	try {
		const usuario = await Usuario.findOne( { telefono, codigo } );

		if ( usuario )
		{
			usuario.codigo = null;
			await usuario.save();

			const token = jwt.sign( { id: usuario._id, type: 'usuario' }, config.jwtKey );

			return sendOk( res, token );
		}
		else
			return sendErr( res, 'Código inválido.' );
	} catch ( err ) {
		return sendErr( res, err.message );
	}
} );

module.exports = router;
