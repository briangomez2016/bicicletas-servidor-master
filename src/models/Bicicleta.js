const mongoose = require( 'mongoose' );

const bicicletaSchema = mongoose.Schema( {
	identificador: {
		type: String,
		unique: true,
		required: true
	},
	id_bicicletero: {
		type: String
	},
	posicion: {
		type: Number
	},
	usuario: {
		type: String
	}
} );

mongoose.model( 'Bicicleta', bicicletaSchema );
