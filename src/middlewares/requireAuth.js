const { sendErr } = require( '../routes/utils' );
const jwt = require( 'jsonwebtoken' );
const config = require( '../../config' );
const mongoose = require( 'mongoose' );

const Admin = mongoose.model( 'Admin' );
const Usuario = mongoose.model( 'Usuario' );

module.exports = ( req, res, next ) => {
	const { authorization } = req.headers;

	if ( !authorization )
		return sendErr( res, { error: 'Debe iniciar sesión' } );

	const token = authorization.replace( 'Bearer ', '' );
	jwt.verify( token, config.jwtKey, async ( err, payload ) => {
		if ( err )
			return sendErr( res, { error: 'Debe iniciar sesión' } );

		const { id, type } = payload;

		if ( type === 'usuario' )
		{
			const usuario = await Usuario.findById( id );

			if ( !usuario )
				return sendErr( res, { error: 'Debe iniciar sesión' } );

			req.usuario = usuario;
			next();
		}
		else if ( type === 'admin' )
		{
			const admin = await Admin.findById( id );

			if ( !admin )
				return sendErr( res, { error: 'Debe iniciar sesión' } );

			req.admin = admin;
			next();
		}
		else
			return sendErr( res, { error: 'Debe iniciar sesión' } );
	} );
};
