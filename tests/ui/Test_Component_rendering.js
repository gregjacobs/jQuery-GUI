Ext.test.Session.addTest( 'Kevlar.ui', {
                                                 
    name: 'Kevlar.ui.Component rendering',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
	
	"Attributes given to the 'attr' config should be applied to the element" : function() {
		var component = new ui.Component( {
			renderTo : document.body,   // to cause it to render
			attr : {
				attr1 : "value1",
				attr2 : "value2"
			}
		} );
		
		var $el = component.getEl();
		Y.Assert.areSame( "value1", $el.attr( 'attr1' ), "'attr1' should have been applied to the element" );
		Y.Assert.areSame( "value2", $el.attr( 'attr2' ), "'attr2' should have been applied to the element" );
		
		component.destroy();
	},
	
	
	"CSS class names given to the 'cls' config should be applied to the element" : function() {
		var component = new ui.Component( {
			renderTo : document.body,   // to cause it to render
			cls: 'myClass1 myClass2'
		} );
		
		var $el = component.getEl();
		Y.Assert.isTrue( $el.hasClass( "myClass1" ), "'myClass1' should have been applied to the element" );
		Y.Assert.isTrue( $el.hasClass( 'myClass2' ), "'myClass2' should have been applied to the element" );
		
		component.destroy();
	},
	
	
	"style properties given to the 'style' config should be applied to the element" : function() {
		var component = new ui.Component( {
			renderTo : document.body,   // to cause it to render
			style: {
				'fontFamily' : 'Arial', // specified as JS property name
				'font-size'  : '12px'   // specified as CSS property name
			}
		} );
		
		var $el = component.getEl();
		Y.Assert.areSame( 'Arial', $el.css( "font-family" ), "font-family 'Arial' should have been applied to the element" );
		Y.Assert.areSame( '12px', $el.css( "font-size" ), "font-size '12px' should have been applied to the element" );
		
		component.destroy();
	}
	
	
} );