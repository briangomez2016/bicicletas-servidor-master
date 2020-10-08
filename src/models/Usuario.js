const mongoose = require( 'mongoose' );

const usuarioSchema = mongoose.Schema( {
	telefono: {
		type: String,
		unique: true,
		required: true
	},
	codigo: {
		type: Number
	},
	id_bicicleta: {
		type: String
	}
} );

mongoose.model( 'Usuario', usuarioSchema );
