Ext.test.Session.addTest( 'ui.utils', {
                                                 
    name: 'Kevlar.ui.utils.OptionsStore',
	
	
	setUp : function() {
		// Quick reference to "equals" method from Kevlar library
		this.equals = Kevlar.Object.isEqual;
		
		// Make a subclass of ui.utils.OptionsStore to extend setOptions()
		this.TestOptionsStore = Kevlar.extend( ui.utils.OptionsStore, {
			setOptionsCalled : false,
			setOptionsCalledWithValue: null,
			 
			// override of setOptions for tests to make sure it is called by the constructor.
			setOptions : function( options ) {
				this.setOptionsCalled = true; // set flag for test
				this.setOptionsCalledWithValue = options;
				
				ui.utils.OptionsStore.prototype.setOptions.apply( this, arguments );
			}
		} );
	},
	
	
	// --------------------------------
	
	// Construction tests
	
	
	"Options should be set by argument to constructor, automatically calling setOptions (other tests rely on this fact)" : function() {
		var options = [
			{ text : "Test1", value : "1" },
			{ text : "Test2", value : "2" }
		];
		var optionsStore = new this.TestOptionsStore( options );
		
		Y.Assert.isTrue( optionsStore.setOptionsCalled, "setOptions() was not called by the constructor" );
		Y.Assert.isTrue( this.equals( options, optionsStore.getOptions() ), "The options provided to the constructor did not get set" );
	},
	
	
	
	"Providing no options to the constructor should still call setOptions, but with an empty array" : function() {
		var optionsStore = new this.TestOptionsStore();
		Y.Assert.isTrue( optionsStore.setOptionsCalled, "setOptions() was not called by the constructor" );
		Y.Assert.isTrue( this.equals( [], optionsStore.setOptionsCalledWithValue ), "The setOptions method was not provided an empty array" );
		Y.Assert.isTrue( this.equals( [], optionsStore.getOptions() ), "The options returned by getOptions() was not an empty an array when not provided to constructor" );
	},
	
	
	
	"Providing the OptionsStore a hash of key/values should normalize to an array of text/value objects" : function() {
		var options = { text1: "value1", text2: "value2" };
		var optionsStore = new ui.utils.OptionsStore( options );
		
		var expectedOptions = [ { text: "text1", value: "value1" }, { text: "text2", value: "value2" } ];
		Y.Assert.isTrue( this.equals( expectedOptions, optionsStore.getOptions(), "The data was not normalized properly" ) );
	},
	
	
	
	"Providing the OptionsStore an array of strings should normalize to an array of text/value objects with matching text and value properties" : function() {
		var options = [ "text1", "text2" ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		var expectedOptions = [ { text: "text1", value: "text1" }, { text: "text2", value: "text2" } ];
		Y.Assert.isTrue( this.equals( expectedOptions, optionsStore.getOptions(), "The data was not normalized properly" ) );
	},
	
	
	
	"Providing the OptionsStore an array of text/value objects should be stored exactly as such" : function() {
		var options = [ { text: "text1", value: "text1" }, { text: "text2", value: "text2" } ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		Y.Assert.isTrue( this.equals( options, optionsStore.getOptions(), "The data was not normalized properly" ) );
	},
	
	
	
	"Providing the OptionsStore a mix of an array of strings and text/value objects should be normalized to text/value objects" : function() {
		var options = [ "text1", { text: "text2", value: "text2" }, "text3" ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		var expectedOptions = [ { text: "text1", value: "text1" }, { text: "text2", value: "text2" }, { text: "text3", value: "text3" } ];
		Y.Assert.isTrue( this.equals( expectedOptions, optionsStore.getOptions(), "The data was not normalized properly" ) );
	},
	
	
	
	"Providing the OptionsStore an array of text/value objects along with some extra properties should keep the extra properties" : function() {
		var options = [ { text: "text1", value: "text1", extraProp: "prop" }, { text: "text2", value: "text2", extraProp1: "prop1", extraProp2: "prop2" } ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		Y.Assert.isTrue( this.equals( options, optionsStore.getOptions(), "The data was not normalized properly" ) );
	},
	
	
	// ---------------------------------
	
	
	// getAtIndex tests
	
	"getAtIndex() should return a valid options object for in-range values" : function() {
		var options = [ { text: "text1", value: "text1" }, { text: "text2", value: "text2" } ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		Y.Assert.isTrue( this.equals( { text: "text1", value: "text1" }, optionsStore.getAtIndex( 0 ) ), "The options object returned from index 0 is not correct" );
		Y.Assert.isTrue( this.equals( { text: "text2", value: "text2" }, optionsStore.getAtIndex( 1 ) ), "The options object returned from index 1 is not correct" );
	},
	
	
	"getAtIndex() should return null for out-of-range values" : function() {
		var options = [ { text: "text1", value: "text1" }, { text: "text2", value: "text2" } ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		Y.Assert.isNull( optionsStore.getAtIndex( -1 ), "getAtIndex() should have returned null for a negative index" );
		Y.Assert.isNull( optionsStore.getAtIndex( 2 ), "getAtIndex() should have returned null for an index too high" );
	},
	
	
	
	// ---------------------------------
	
	
	// getByValue tests
	
	"getByValue() should return a valid options object for values that exist" : function() {
		var options = [ { text: "text1", value: "value1" }, { text: "text2", value: "value2" } ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		Y.Assert.isTrue( this.equals( { text: "text1", value: "value1" }, optionsStore.getByValue( "value1" ) ), "The options object returned by value 'value1' is not correct" );
		Y.Assert.isTrue( this.equals( { text: "text2", value: "value2" }, optionsStore.getByValue( "value2" ) ), "The options object returned by value 'value2' is not correct" );
	},
	
	
	"getByValue() should return null when searching for a value that doesn't exist in the options" : function() {
		var options = [ { text: "text1", value: "value1" }, { text: "text2", value: "value2" } ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		Y.Assert.isNull( optionsStore.getByValue( "non-existent" ), "getByValue() should have returned null for a non-existent value" );
	},
	
	
	
	// ---------------------------------
	
	
	// getByText tests
	
	"getByText() should return a valid options object for a text that exists in the options" : function() {
		var options = [ { text: "text1", value: "value1" }, { text: "text2", value: "value2" } ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		Y.Assert.isTrue( this.equals( { text: "text1", value: "value1" }, optionsStore.getByText( "text1" ) ), "The options object returned by text 'Text1' is not correct" );
		Y.Assert.isTrue( this.equals( { text: "text2", value: "value2" }, optionsStore.getByText( "text2" ) ), "The options object returned by text 'Text2' is not correct" );
	},
	
	
	"getByText() should return null when searching for a text that doesn't exist in the options" : function() {
		var options = [ { text: "text1", value: "value1" }, { text: "text2", value: "value2" } ];
		var optionsStore = new ui.utils.OptionsStore( options );
		
		Y.Assert.isNull( optionsStore.getByText( "non-existent" ), "getByText() should have returned null for a non-existent text option" );
	}
	
} );