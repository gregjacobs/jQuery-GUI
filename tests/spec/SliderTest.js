tests.unit.ui.add( new Ext.test.Case( {
                                                 
    name: 'ui.Slider',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
	
	"Slider should *not* fire its 'change' event when it sets the initial 'handlePositions'" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var eventFired = false;
			var slider = new ui.Slider( {
				renderTo : ( rendered === 1 ) ? document.body : undefined,
				
				handlePositions: [ 10 ],
				listeners : { 'change' : function() { eventFired = true; } }
			} );
			Y.Assert.isFalse( eventFired, "rendered = " + !!rendered );
			
			slider.destroy();  // clean up
		}
	},
	
	
	"Slider should fire its 'change' event when its setHandlePositions() method is run" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var changeEventFireCount = 0, handleValue = -1;
			var slider = new ui.Slider( {
				renderTo : ( rendered === 1 ) ? document.body : undefined,
				listeners : {
					'change' : function( slider, handlePositions ) {
						changeEventFireCount++;
						handleValue = handlePositions[ 0 ];
					}
				}
			} );
			slider.setHandlePositions( [ 10 ] );
			Y.Assert.areSame( 1, changeEventFireCount, "The 'change' event should have fired exactly once. rendered = " + !!rendered );
			Y.Assert.areSame( 10, handleValue, "handleValue should have been set to 10 as the value. rendered = " + !!rendered );
			
			// Now set again, to be sure
			slider.setHandlePositions( [ 20 ] );
			Y.Assert.areSame( 2, changeEventFireCount, "The 'change' event should have fired exactly twice. rendered = " + !!rendered );
			Y.Assert.areSame( 20, handleValue, "handleValue should have been set to 20 as the value. rendered = " + !!rendered );
			
			slider.destroy();  // clean up
		}
	}
	
} ) );