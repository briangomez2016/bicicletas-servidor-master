if ( localStorage.getItem( 'token' ) )
	window.location.replace( '/admin' );

$( document ).ready( () => {
	$( '#msj-error' ).hide();

	$( '#btn-iniciar' ).click( () => {
		$( '#msj-error' ).hide();

		$.ajax( {
			type: 'POST',
			url: '/admin-login',
			contentType: 'application/json',
			data: JSON.stringify( {
				usuario: $( '#usuario' ).val(),
				clave: $( '#clave' ).val()
			} ),
			success: ( data ) => {
				if ( data.state === 'OK' )
				{
					localStorage.setItem( 'token', data.message );
					window.location.replace( '/admin' );
				}
				else if ( data.state === 'ERR' )
				{
					$( '#msj-error' ).text( 'Error: ' + data.message );
					$( '#msj-error' ).show();
				}
			},
			error: ( err ) => {
				$( '#msj-error' ).text( 'Error: ' + err.statusText );
				$( '#msj-error' ).show();
			}
		} );
	} );
} );
