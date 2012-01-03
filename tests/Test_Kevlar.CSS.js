/*global Ext, Y, Kevlar */
Ext.test.Session.addTest( {
	
	name: 'Kevlar.CSS',
	
	"hashToString() should return an empty string when providing an empty hash" : function() {
		Y.Assert.areSame( "", Kevlar.CSS.hashToString( {} ) );
	},
	

	"hashToString() should convert a hash of property/value pairs to a CSS string" : function() {
		var props = {
			'color'     : 'red',
			'font-size' : '12px'
		};
		
		Y.Assert.areSame( "color:red;font-size:12px;", Kevlar.CSS.hashToString( props ) );
	},
	
	
	"hashToString() should convert camelCase style properties to their 'dash' form for the resulting string" : function() {
		var props = {
			'fontFamily' : 'Arial',
			'fontSize'   : '12px'
		};
		
		Y.Assert.areSame( "font-family:Arial;font-size:12px;", Kevlar.CSS.hashToString( props ) );
	}
    
} );