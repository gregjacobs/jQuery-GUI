/**
 * @class ui.utils.OptionsStore
 * @extends Object
 * 
 * Helper utility class used for making the management of 'options' data easy, for any classes that use this format of data.
 * "Options data" in this context simply means "text/value" pairs, such as used by dropdowns. The purpose of this class 
 * was to not duplicate functionality for classes that use this format of data.
 * 
 * This class is currently used by {@link ui.formFields.DropdownField}, {@link ui.formFields.RadioField}, and {@link ui.ButtonSet}, 
 * which use it for managing the options that they provide.  
 * 
 * @constructor
 * @param {Array/Function} options See the `options` parameter in {@link #setOptions} for accepted formats of this parameter.
 */
/*global Kevlar, ui */
ui.utils.OptionsStore = Kevlar.extend( Object, {
	
	constructor : function( options ) {
		this.setOptions( options || [] );
	},
	
	
	/**
	 * Sets the options for the store. Normalizes the options into an array of objects, where each object
	 * has the properties 'text' and 'value'.  Extra properties may be added however, when following the recommended format (an
	 * array of objects).
	 * 
	 * @method setOptions
	 * @param {Array/Function} options The options for the OptionsStore. If this is a flat array, the values will be used as both the 'value' and 'text'
	 *   of the options.  Ex: <pre><code>[ "Option 1", "Option 2", "Option 3" ]</code></pre>
	 * 
	 *   If you want to customize the value and text separately for each option (recommended), provide an array of objects, where the object has two
	 *   properties: `text` and `value`. 
	 *   Ex: <pre><code>[ { "text": "Option 1", "value": 1 }, { "text": "Option 2", "value": 2 } ]</code></pre>
	 *   
	 *   Extra properties may also be added if needed in this form, and will not be affected by the OptionsStore.  These properties
	 *   may be used by whichever implementation is using the OptionsStore.
	 *   Ex:<pre><code>[ { "text": "Option 1", "value": 1, "cls" : "myCssClass" }, { "text": "Option 2", "value": 2, "cls" : "myCssClass2" } ]</code></pre>
	 * 
	 *   If this config is specified as a function, the function will be executed, and its return will be used as the options. Its return should match one of
	 *   the forms defined above.
	 */
	setOptions : function( options ) {
		// If the options were provided as a function, execute the function and use its return as the options array
		if( typeof options === 'function' ) {
			options = options();
		}
		
		var normalizedOptions = [];
		
		// Backward compatibility: Accept the options as an object where the keys are the text, and the values are the <option> values.
		// Changed this to an array because there is no way guarantee that looping over the properties will iterate them out in the same order 
		// that they were added.
		if( Kevlar.isObject( options ) ) {
			for( var name in options ) {
				if( options.hasOwnProperty( name ) ) {  // filter out any prototype properties, just in case
					normalizedOptions.push( { text: name, value: options[ name ] } );
				}
			}
			
		} else {
			// Options were provided as an array...
			
			// If the options are an array of strings, use them for both the 'text' and the 'value'
			for( var i = 0, numOptions = options.length; i < numOptions; i++ ) {
				var option = options[ i ],
				    normalizedOption = {};
				
				if( typeof option === 'object' ) {
					normalizedOption.value = ( typeof option.value !== 'undefined' ) ? option.value : option.text;  // If no value is specified, use the text as the value.
					normalizedOption.text = option.text;
					
					// Add any extra properties that may have been provided to the normalizedOption object.
					for( var prop in option ) {
						// Filter out the 'text' and 'value' properties (they have been handled above), and filter out any prototype properties
						if( prop !== 'text' && prop !== 'value' && option.hasOwnProperty( prop ) ) {
							normalizedOption[ prop ] = option[ prop ];
						} 
					}
					
				} else {
					// String option: use it for both value and text
					normalizedOption.value = option; 
					normalizedOption.text = option;
				}
				
				normalizedOptions.push( normalizedOption );
			}
		}
		
		// Store the normalized options
		this.options = normalizedOptions;
	},
	
	
	/**
	 * Retrives all of the options objects held by the OptionsStore. Each options object has properties: 'text' and 'value'.
	 * 
	 * @method getOptions
	 * @return {Object[]} An array of the options objects, each of which has properties 'text' and 'value'.
	 */
	getOptions : function() {
		return this.options;
	},
	
	
	/**
	 * Retrieves an option based on its index position (0-based).
	 * 
	 * @method getAtIndex
	 * @param {Number} index
	 * @return {Object} The option object with properties 'text' and 'value', or null if the index was out of range.
	 */
	getAtIndex : function( index ) {
		return this.options[ index ] || null;
	},
	
	
	/**
	 * Retrieves an option based on its `value`. An option object has properties 'text' and 'value'.
	 * 
	 * @method getByValue
	 * @param {Mixed} value
	 * @return {Object} The option object with properties 'text' and 'value', or null if no option was found.
	 */
	getByValue : function( value ) {
		var options = this.options;
			
		for( var i = 0, len = options.length; i < len; i++ ) {
			if( options[ i ].value === value ) {
				return options[ i ];
			}
		}
		return null;  // return null if no option was found
	},
	
	
	/**
	 * Retrieves an option based on its `text`. An option object has properties 'text' and 'value'.
	 * 
	 * @method getByText
	 * @param {String} text
	 * @return {Object} The option object with properties 'text' and 'value', or null if no option was found.
	 */
	getByText : function( text ) {
		var options = this.options;
			
		for( var i = 0, len = options.length; i < len; i++ ) {
			if( options[ i ].text === text ) {
				return options[ i ];
			}
		}
		return null;  // return null if no option was found
	}

} );