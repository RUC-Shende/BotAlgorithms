class linefill
{
  constructor( svg, fps )
  {
    this.svg = svg;
    this.u2p = ( svg.attr( "width" ) / 4 );
    this.fps = fps;
    this.step = this.u2p / this.fps;
    this.center = [ 2 * this.u2p , 2 * this.u2p ];
    this.points = d3.set( [ ] );
    this.path = [ ];
    this.lastPoint = null;
  }

  genPath( ){ }

  genLine( nextPoint )
  {
    if( this.lastPoint != null )
    {
      var distance = Math.hypot( nextPoint[ 1 ] - this.lastPoint[ 1 ], nextPoint[ 0 ] - this.lastPoint[ 0 ] );
      var totalSteps = Math.floor( distance / this.step ) + 1;//Remember that zero is a point as well
      for( var i = 0; i < totalSteps; i++ )
      {
        var pt = [
          this.lastPoint[ 0 ] + ( i / totalSteps ) * ( nextPoint[ 0 ] - this.lastPoint[ 0 ] ),
          this.lastPoint[ 1 ] + ( i / totalSteps ) * ( nextPoint[ 1 ] - this.lastPoint[ 1 ] )
        ];
        this.points.add( pt );
        this.path.push( pt );
        this.svg.append( "circle" )
          .attr( "cx", pt[ 0 ] ).attr( "cy", pt[ 1 ] ).attr( "r", ( ( !i ) ? ( .5 ) : ( .25 ) ) * this.step )
          .style( "fill", "#ff5527ff" );
      }
    }
    this.lastPoint = nextPoint;
  }

  removePoint( thisPoint )
  {
    if( points.has( thisPoint ) )
    {
      points.remove( thisPoint );
      return( points.size( ) );
    }
    return 1;
  }
}



class polygonfill extends linefill
{
  constructor( svg, fps, sides )
  {
    super( svg, fps );
    this.N = sides;
    this.genPath( );
  }

  genPath( )
  {
    if( this.N < 3 )
    {
      console.log( "%cERROR: polygons have atleast three sides", "color:#ff0000ff" );
      return null;
    }
    var hold = '';
    for( var i = 0; i <= this.N; i++ )
    {
      var ang = i * 2 * Math.PI / this.N;
      var pt = [ this.center[ 0 ] + this.u2p * Math.cos( ang ), this.center[ 1 ] - this.u2p * Math.sin( ang ) ];
      hold += ( ( i == 0 ) ? ( 'M' ) : ( 'L' ) ) + pt[ 0 ] + ',' + pt[ 1 ];//Only first is M
      this.genLine( pt );
    }
    this.svg.append( "path" )
      .attr( "d", hold )
      .style( "fill", "none" ).style( "stroke", "#00000010" ).style( "stroke-width", this.step );
  }
}



class pathfill extends linefill
{
  constructor( svg, fps, path )
  {
    super( svg, fps );
    this.P = path;
    this.genPath( );
  }

  genPath( )
  {
    if( ( this.P[ 0 ][ 0 ] != this.P[ this.P.length - 1 ][ 0 ] ) || ( this.P[ 0 ][ 1 ] != this.P[ this.P.length - 1 ][ 1 ] ) )
    {
      console.log( "%cERROR: open paths are not allowed!", "color:#ff0000ff" );
      return null;
    }
    var hold = '';
    for( var i = 0; i < this.P.length; i++ )
    {
      var pt = [ this.center[ 0 ] + this.P[ i ][ 0 ], this.center[ 1 ] - this.P[ i ][ 1 ] ];
      hold += ( ( i == 0 ) ? ( 'M' ) : ( 'L' ) ) + pt[ 0 ] + ',' + pt[ 1 ];//Only first is M
      this.genLine( pt );
    }
    this.svg.append( "path" )
      .attr( "d", hold )
      .style( "fill", "none" ).style( "stroke", "#00000010" ).style( "stroke-width", this.step );
  }
}
















