const mongoose = require( 'mongoose' );

const adminSchema = mongoose.Schema( {
	usuario: {
		type: String,
		unique: true,
		required: true
	},
	clave: {
		type: String,
		required: true
	}
} );

mongoose.model( 'Admin', adminSchema );
