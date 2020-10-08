String delFirst ( String str )
{
  return str.substring( str.indexOf( ';' ) + 1 );
}

String getFirst ( String str )
{
  return str.substring( 0, str.indexOf( ';' ) );
}

template <typename T>
String operator>( const String &str, T &a )
{
  String temp = "";
  String ret = "";

  bool done = false;

  for ( byte i = 0; i < str.length(); i++ )
  {
    if ( str[i] == ';' && !done )
      done = true;
    else if ( !done )
      temp += str[i];
    else
      ret += str[i];
  }

  a << temp;

  return ret;
}

void operator<<( int &a, const String &temp ) { a = temp.toInt(); }
void operator<<( String &a, const String &temp ) { a = temp; }
