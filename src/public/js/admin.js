function setQRCode ( text )
{
	$( '#panel-qr' ).show();
	$( '#codigo-qr' ).attr( 'src', '' );
	const url = 'https:\/\/api.qrserver.com/v1/create-qr-code/?data=' + text + '&amp;size=200x200';
	$( '#codigo-qr' ).attr( 'src', url );
}

function agregarBicicletero ( bicicletero )
{
	const t = document.querySelector( '#template-bicicletero' );

	t.content.querySelector( '.bicicletero' ).id = bicicletero.identificador;
	t.content.querySelector( '.id' ).innerText = bicicletero.identificador;
	t.content.querySelector( '.nombre' ).innerText = bicicletero.nombre;
	t.content.querySelector( '.ubicacion' ).innerText = bicicletero.ubicacion;
	t.content.querySelector( '.coordenadas' ).innerText = bicicletero.latitud + ', ' + bicicletero.longitud;

	const clon = document.importNode( t.content, true );
	clon.querySelector( '.boton-borrar' ).onclick = function () {
		$.ajax( {
			type: 'POST',
			url: '/borrar_bicicletero',
			headers: {
				'Authorization': 'Bearer ' + localStorage.getItem( 'token' )
			},
			contentType: 'application/json',
			data: JSON.stringify( { identificador: bicicletero.identificador } ),
			success: ( data ) => {
				if ( data.state === 'OK' )
				{
					const b = document.getElementById( bicicletero.identificador );
					b.parentNode.removeChild( b );
				}

				if ( data.state === 'ERR' )
					console.log( data.message );
			},
			error: ( err ) => {
				console.log( err.statusText );
			}
		} );
	};

	clon.querySelector( '.boton-ver-qr' ).onclick = function () {
		setQRCode( bicicletero.identificador + ";" + $( "#posicion" ).val() );
	};

	document.querySelector( '#listado-bicicleteros' ).appendChild( clon );
}

function agregarBicicleta ( bicicleta )
{
	const t = document.querySelector( '#template-bicicleta' );

	t.content.querySelector( '.bicicleta' ).id = bicicleta.identificador;
	t.content.querySelector( '.id' ).innerText = bicicleta.identificador;
	t.content.querySelector( '.bicicletero' ).innerText = bicicleta.id_bicicletero || bicicleta.usuario;
	t.content.querySelector( '.posicion' ).innerText = bicicleta.posicion;

	const clon = document.importNode( t.content, true );
	clon.querySelector( '.boton-borrar' ).onclick = function () {
		console.log( 'Borrar', bicicleta.identificador );
		$.ajax( {
			type: 'POST',
			url: '/borrar_bicicleta',
			headers: {
				'Authorization': 'Bearer ' + localStorage.getItem( 'token' )
			},
			contentType: 'application/json',
			data: JSON.stringify( { identificador: bicicleta.identificador } ),
			success: ( data ) => {
				if ( data.state === 'OK' )
				{
					const b = document.getElementById( bicicleta.identificador );
					b.parentNode.removeChild( b );
				}

				if ( data.state === 'ERR' )
					console.log( data.message );
			},
			error: ( err ) => {
				console.log( err.statusText );
			}
		} );
	};

	clon.querySelector( '.boton-ver-qr' ).onclick = function () {
		setQRCode( bicicleta.identificador );
	};

	document.querySelector( '#listado-bicicletas' ).appendChild( clon );
}

if ( !localStorage.getItem( 'token' ) )
	window.location.replace( '/admin_inicio' );

$( document ).ready( () => {
	$( '#msj-error' ).hide();
	$( '#msj-error2' ).hide();
	$( '#panel-qr' ).hide();

	$( '#cerrar-sesion' ).click( () => {
		localStorage.removeItem( 'token' );
		window.location.replace( '/admin_inicio' );
	} );

	$( '#btn-generar' ).click( () => {
		setQRCode( $( '#texto_qr' ).val() );
	} );

	$( '#btn-agregar' ).click( () => {
		$( '#msj-error' ).hide();

		const nombre = $( '#nombre' ).val();
		const ubicacion = $( '#ubicacion' ).val();
		const latitud = $( '#latitud' ).val();
		const longitud = $( '#longitud' ).val();

		if ( !nombre || !latitud || !longitud )
		{
			$( '#msj-error' ).text( 'Ingrese todos los campos' );
			$( '#msj-error' ).show();
		}
		else
		{
			$.ajax( {
				type: 'POST',
				url: '/crear_bicicletero',
				headers: {
					'Authorization': 'Bearer ' + localStorage.getItem( 'token' )
				},
				contentType: 'application/json',
				data: JSON.stringify( {
					nombre, ubicacion, latitud, longitud
				} ),
				success: ( data ) => {
					if ( data.state === 'OK' )
					{
						agregarBicicletero( { identificador: data.message, nombre, ubicacion, latitud, longitud } );

						$( '#nombre' ).val( '' );
						$( '#ubicacion' ).val( '' );
						$( '#latitud' ).val( '' );
						$( '#longitud' ).val( '' );
					}

					if ( data.state === 'ERR' )
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
		}
	} );

	$( '#btn-agregar-bicicleta' ).click( () => {
		$( '#msj-error2' ).hide();

		const id_bicicletero = $( '#bicicletero' ).val();
		const posicion = $( '#posicion' ).val();

		if ( !id_bicicletero || !posicion )
		{
			$( '#msj-error2' ).text( 'Ingrese todos los campos' );
			$( '#msj-error2' ).show();
		}
		else
		{
			$.ajax( {
				type: 'POST',
				url: '/crear_bicicleta',
				headers: {
					'Authorization': 'Bearer ' + localStorage.getItem( 'token' )
				},
				contentType: 'application/json',
				data: JSON.stringify( { id_bicicletero, posicion } ),
				success: ( data ) => {
					if ( data.state === 'OK' )
					{
						agregarBicicleta( { identificador: data.message, id_bicicletero, posicion } );

						$( '#bicicletero' ).val( '' );
						$( '#posicion' ).val( '' );
					}

					if ( data.state === 'ERR' )
					{
						$( '#msj-error2' ).text( 'Error: ' + data.message );
						$( '#msj-error2' ).show();
					}
				},
				error: ( err ) => {
					$( '#msj-error2' ).text( 'Error: ' + err.statusText );
					$( '#msj-error2' ).show();
				}
			} );
		}
	} );

	$.ajax( {
		type: 'GET',
		url: '/obtener_bicicleteros',
		headers: {
			'Authorization': 'Bearer ' + localStorage.getItem( 'token' )
		},
		success: ( data ) => {
			data.message.map( bicicletero => agregarBicicletero( bicicletero ) );
		},
		error: ( err ) => {
			console.log( err );
		}
	} );

	$.ajax( {
		type: 'GET',
		url: '/obtener_bicicletas',
		headers: {
			'Authorization': 'Bearer ' + localStorage.getItem( 'token' )
		},
		success: ( data ) => {
			data.message.map( bicicleta => agregarBicicleta( bicicleta ) );
		},
		error: ( err ) => {
			console.log( err );
		}
	} );
} );
