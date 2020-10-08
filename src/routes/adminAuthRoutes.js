const express = require( 'express' );
const { sendOk, sendErr } = require( './utils' );
const mongoose = require( 'mongoose' );
const jwt = require( 'jsonwebtoken' );
const config = require( '../../config' );

const Admin = mongoose.model( 'Admin' );

const router = express.Router();

router.post( '/admin-login', async ( req, res ) => {
	const { usuario, clave } = req.body;

	if ( !usuario || !clave )
		return sendErr( 'Faltan parámetros' );

	const admin = await Admin.findOne( { usuario, clave } );

	if ( !admin )
		return sendErr( res, 'Usuario o contraseña inválidos.' );
	
	const token = jwt.sign( { id: admin._id, type: 'admin' }, config.jwtKey );
	
	sendOk( res, token );
} );

module.exports = router;
