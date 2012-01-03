Ext.test.Session.addTest( 'Kevlar.ui', {
                                                 
    name: 'Kevlar.ui.ColorPicker',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
	
	// 'change' event tests
	
	"Setting the initial color should *not* fire the 'change' event" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var eventFired = false;
			
			var colorPicker = new ui.ColorPicker( {
				renderTo : ( !rendered ) ? undefined : document.body,
				
				color: "#FF0000",
				listeners : { 'change' : function() { eventFired = true; } } 
			} );
			
			Y.Assert.isFalse( eventFired, "rendered = " + !!rendered );
			
			colorPicker.destroy();  // clean up
		}
	},
	
	
	"Setting the color after instantiation time should fire the 'change' event exactly once" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var eventFiredCount = 0;
			
			var colorPicker = new ui.ColorPicker( {
				renderTo : ( !rendered ) ? undefined : document.body,
				
				listeners : { 'change' : function() { eventFiredCount++; } }
			} );
			
			colorPicker.setColor( "#FF0000" );
			Y.Assert.areSame( 1, eventFiredCount, "rendered = " + !!rendered );
			
			colorPicker.destroy();  // clean up
		}
	},
	
	
	// -----------------------------
	
	// Test normalizeColorValue
	
	"normalizeColorValue() should leave a full hex color value, with its # sign, unchanged" : function() {
		var colorPicker = new ui.ColorPicker();
		
		Y.Assert.areSame( "#FF0000", colorPicker.normalizeColorValue( "#FF0000" ) );
	},
	
	"normalizeColorValue() should add the # sign to a color value without one" : function() {
		var colorPicker = new ui.ColorPicker();
		
		Y.Assert.areSame( "#FF0000", colorPicker.normalizeColorValue( "FF0000" ) );
	},
	
	"normalizeColorValue() should 'expand' a shorthand color value (such as #FFF)" : function() {
		var colorPicker = new ui.ColorPicker();
		
		Y.Assert.areSame( "#FFFFFF", colorPicker.normalizeColorValue( "#FFF" ) );
	},
	
	"normalizeColorValue() should 'expand' a shorthand color value (such as #FFF), and add its # sign if missing" : function() {
		var colorPicker = new ui.ColorPicker();
		
		Y.Assert.areSame( "#FFFFFF", colorPicker.normalizeColorValue( "FFF" ) );
	}
	
} );