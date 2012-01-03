Ext.test.Session.addTest( 'Kevlar.ui', {
                                                 
    name: 'Kevlar.ui.Overlay',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
	// Tests for clicking on other elements in the document to close the Overlay 
	
	
	"Clicking the document body when the Overlay is open should close the Overlay" : function() {
		var overlay = new ui.Overlay();
		overlay.open();
		
		Y.Assert.isTrue( overlay.isOpen(), "Initial condition: overlay should be open." );
		
		// The rest of the test must be done after a short delay, because the document click handler is not added immediately, as to not immediately
		// close the Overlay from an initial mousedown event from bubbling up to close it. (i.e. the mousedown event that opened it in most cases)
		this.wait( function() {
			// Simulate a mousedown event on the document body
			jQuery( 'body' ).mousedown();
			
			Y.Assert.isFalse( overlay.isOpen(), "Overlay should now be closed." );
			overlay.destroy();
		}, 25 );
	},
	
	
	"Clicking on some element in the document when the Overlay is open should close the Overlay" : function() {
		var $someEl = jQuery( '<div />' ).appendTo( 'body' );
		var overlay = new ui.Overlay();
		overlay.open();
		
		Y.Assert.isTrue( overlay.isOpen(), "Initial condition: overlay should be open." );
		
		// The rest of the test must be done after a short delay, because the document click handler is not added immediately, as to not immediately
		// close the Overlay from an initial mousedown event from bubbling up to close it. (i.e. the mousedown event that opened it in most cases)
		this.wait( function() {
			// Simulate a mousedown event on the element in the document
			$someEl.mousedown();
			Y.Assert.isFalse( overlay.isOpen(), "Overlay should now be closed." );
			
			// Clean up
			overlay.destroy();
			$someEl.remove();
		}, 25 );
	},
	
	
	"Clicking an element in the DOM that is set to NOT close the Overlay should in fact not close it (tests 'dontCloseOn' config)" : function() {
		var $someEl = jQuery( '<div />' ).appendTo( 'body' );
		var overlay = new ui.Overlay( {
			dontCloseOn : $someEl
		} );
		overlay.open();
		
		Y.Assert.isTrue( overlay.isOpen(), "Initial condition: overlay should be open." );
		
		// The rest of the test must be done after a short delay, because the document click handler is not added immediately, as to not immediately
		// close the Overlay from an initial mousedown event from bubbling up to close it. (i.e. the mousedown event that opened it in most cases)
		this.wait( function() {
			// Simulate a mousedown event on the element
			$someEl.mousedown();
			Y.Assert.isTrue( overlay.isOpen(), "Overlay should still be open, as $someEl was provided to the 'dontCloseOn' config." );
			
			// Clean up
			overlay.destroy();
			$someEl.remove();
		}, 25 );
	},
	
	
	"Clicking the document body when the Overlay is open should fire the 'beforeblurclose' event (exactly once)" : function() {
		var beforeBlurCloseCount = 0;
		var overlay = new ui.Overlay( {
			listeners : {
				'beforeblurclose' : function() {
					beforeBlurCloseCount++;
				}
			}
		} );
		overlay.open();
		
		Y.Assert.isTrue( overlay.isOpen(), "Initial condition: overlay should be open." );
		
		// The rest of the test must be done after a short delay, because the document click handler is not added immediately, as to not immediately
		// close the Overlay from an initial mousedown event from bubbling up to close it. (i.e. the mousedown event that opened it in most cases)
		this.wait( function() {
			// Simulate a mousedown event on the document body
			jQuery( 'body' ).mousedown();
			Y.Assert.areSame( 1, beforeBlurCloseCount, "The beforeblurcount should have fired exactly once when clicking on an element to close the Overlay." );
			
			overlay.destroy();
		}, 25 );
	},
	
	
	"Returning false from a 'beforeblurclose' event handler should prevent the Overlay from closing" : function() {
		var overlay = new ui.Overlay( {
			listeners : {
				'beforeblurclose' : function() {
					return false;  // prevent the Overlay from closing
				}
			}
		} );
		overlay.open();
		
		Y.Assert.isTrue( overlay.isOpen(), "Initial condition: overlay should be open." );
		
		// The rest of the test must be done after a short delay, because the document click handler is not added immediately, as to not immediately
		// close the Overlay from an initial mousedown event from bubbling up to close it. (i.e. the mousedown event that opened it in most cases)
		this.wait( function() {
			// Simulate a mousedown event on the document body
			jQuery( 'body' ).mousedown();
			Y.Assert.isTrue( overlay.isOpen(), "Overlay should still be open, as a beforeblurclose event handler returned false." );
			
			overlay.destroy();
		}, 25 );
	}
	
} );