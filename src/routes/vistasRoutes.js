const express = require( 'express' );
const path = require( 'path' );

const router = express.Router();

router.get( '/admin_inicio', ( req, res ) => {
	res.sendFile( path.resolve( __dirname + '/../views/adminLogin.html' ) );
} );

router.get( '/admin', ( req, res ) => {
	res.sendFile( path.resolve( __dirname + '/../views/adminMain.html' ) );
} );

router.get( '/test', ( req, res ) => {
	res.sendFile( path.resolve( __dirname + '/../views/bicicleteroTest.html' ) );
} );

module.exports = router;
