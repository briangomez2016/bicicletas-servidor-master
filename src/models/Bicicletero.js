const mongoose = require( 'mongoose' );

const bicicleteroSchema = mongoose.Schema( {
	identificador: {
		type: String,
		unique: true,
		required: true
	},
	nombre: {
		type: String,
		unique: true,
		required: true
	},
	ubicacion: {
		type: String
	},
	latitud: {
		type: Number,
		required: true
	},
	longitud: {
		type: Number,
		required: true
	}
} );

mongoose.model( 'Bicicletero', bicicleteroSchema );
