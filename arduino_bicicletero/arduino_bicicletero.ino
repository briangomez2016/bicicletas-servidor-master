// https://github.com/gilmaimon/ArduinoWebsockets
#include <ArduinoWebsockets.h>
#include <WiFi.h>

const char* id = "identificador;B3";

const char* ssid = "Innova";
const char* pass = "0daf80daf8";

const char* host = "ws://bicicletas-servidor.herokuapp.com/echo";

const int lockPins[3] =   { 26, 25, 24 };
const int sensorPins[3] = { 12, 13, 14 };
bool sensorStates[3] = { LOW, LOW, LOW };

using namespace websockets;

WebsocketsClient client;

void abrir ( int pos )
{
  Serial.print( "ABRIR: " );
  Serial.println( pos );

  client.send( "abrir;" + String( pos ) );
  digitalWrite( lockPins[pos], HIGH );
}

void cerrar ( int pos )
{
  Serial.print( "CERRAR: " );
  Serial.println( pos );
  
  client.send( "cerrar;" + String( pos ) );
  digitalWrite( lockPins[pos], LOW );
}

void procesarMensaje ( String data )
{
  Serial.printf( "[procesarMensaje] " );
  Serial.printf( data.c_str() );
  Serial.printf( "\n" );
  
  String accion = getFirst( data );
  String params = delFirst( data );
  int dato;
  params > dato;

  if ( accion == "abrir" )
    abrir( dato );
}

void connect_to_server ()
{
  // Conectar WiFi
  WiFi.begin( ssid, pass );

  Serial.printf( "[SETUP] Conectando WiFi." );
  while ( WiFi.status() != WL_CONNECTED ) { Serial.printf( "." ); delay( 100 ); }
  Serial.printf( "\n[SETUP] WiFi conectado.\n" );

  Serial.printf( "[SETUP] Conectando Webserver." );
  while ( !client.connect( host ) ) { Serial.printf( "." ); delay( 100 ); }
  Serial.printf( "\n[SETUP] Webserver conectado.\n" );

  client.onMessage( [&]( WebsocketsMessage message ) {
    procesarMensaje( message.data() );
  } );

  client.send( id );
}

void setup ()
{
  Serial.begin( 115200 );

  for ( int i = 0; i < 3; i++ )
  {
    pinMode( lockPins[i], OUTPUT );
    pinMode( sensorPins[i], INPUT );
  }
  
  connect_to_server();
}

void loop ()
{
  if ( client.available() )
    client.poll();
  else
    connect_to_server();

  delay( 500 );

  for ( int i = 0; i < 3; i++ )
  {
    if ( digitalRead( sensorPins[i] ) == HIGH && sensorStates[i] == LOW )
    {
      sensorStates[i] = HIGH;
      cerrar( i );
    }
    else if ( digitalRead( sensorPins[i] ) == LOW && sensorStates[i] == HIGH )
    {
      sensorStates[i] = LOW;
    }
  }
}
