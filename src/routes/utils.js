module.exports = {
	sendOk: ( res, message ) => {
		res.send( {
			'state': 'OK',
			'message': message
		} );
	},
	sendErr: ( res, error ) => {
		res.send( {
			'state': 'ERR',
			'message': error
		} );
	}
};
