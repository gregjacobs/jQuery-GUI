/*global define */
define( [
	'jquery',
	'lodash',
	'Class'
], function( jQuery, _, Class ) {
	
	/**
	 * @class ui.util.OptionsStore
	 * @extends Object
	 * 
	 * Helper utility class used for making the management of 'options' data easy, for any classes that use this format of data.
	 * "Options data" in this context simply means "text/value" pairs, such as used by dropdowns. The purpose of this class 
	 * was to not duplicate functionality for classes that use this format of data.
	 * 
	 * This class is currently used by {@link ui.form.field.Dropdown} and {@link ui.form.field.Radio}, which use it for 
	 * managing the options that they provide.
	 */
	var OptionsStore = Class.extend( Object, {
		
		/**
		 * @private
		 * @property {Object[]} options
		 * 
		 * The internal array of options held by the OptionsStore.
		 */
		
		
		/**
		 * Instantiates an OptionsStore.
		 * 
		 * @constructor
		 * @param {Array/Function} options The initial set of options to provide to the OptionsStore. 
		 *   See the `options` parameter in {@link #setOptions} for accepted formats of this parameter.
		 */
		constructor : function( options ) {
			this.setOptions( options || [] );
		},
		
		
		/**
		 * Normalizes the given array of options into text/value options.
		 * 
		 * @private
		 * @method normalizeOptions
		 * @param {Object[]} options See the `options` argument of {@link #setOptions}.
		 * @return {Object[]} The options normalized to objects with 'text' and 'value' properties.
		 */
		normalizeOptions : function( options ) {
			var normalizedOptions = [];
			
			for( var i = 0, len = options.length; i < len; i++ ) {
				normalizedOptions.push( this.normalizeOption( options[ i ] ) );
			}
			
			return normalizedOptions;
		},
		
		
		/**
		 * Normalizes a single option into an object with `text` and `value` properties. If a string is provided as the argument,
		 * that string will be used as both the `text` and `value` properties. If an object is provided, it must at least have a 
		 * `text` property, which will also be used for the `value` property should no `value` of its own exist.
		 * 
		 * @private
		 * @method normalizeOption
		 * @param {String/Object} option
		 * @return {Object} A normalized object with `text` and `value` properties.
		 */
		normalizeOption : function( option ) {
			var normalizedOption = {};
			
			if( typeof option === 'object' ) {
				normalizedOption.text = option.text;
				normalizedOption.value = ( typeof option.value !== 'undefined' ) ? option.value : option.text;  // If no value is specified, use the text as the value.
				
				// Add any extra properties that may have been provided to the normalizedOption object.
				for( var prop in option ) {
					// Filter out the 'text' and 'value' properties (they have been handled above), and filter out any prototype properties as well
					if( prop !== 'text' && prop !== 'value' && option.hasOwnProperty( prop ) ) {
						normalizedOption[ prop ] = option[ prop ];
					}
				}
				
			} else {
				// String option: use it for both text and value 
				normalizedOption.text = option;
				normalizedOption.value = option;
			}
			
			return normalizedOption;
		},
		
		
		/**
		 * Sets the options for the store. Normalizes the options into an array of objects, where each object
		 * has the properties 'text' and 'value'.  Extra properties may be added however, when following the recommended format (an
		 * array of objects).
		 * 
		 * @method setOptions
		 * @param {Array/Function} options The options for the OptionsStore. If this is a flat array, the values will be used as both the 'value' and 'text'
		 *   of the options.  Ex: `[ "Option 1", "Option 2", "Option 3" ]`
		 * 
		 *   If you want to customize the value and text separately for each option (recommended), provide an array of objects, where the object has two
		 *   properties: `text` and `value`. 
		 *   Ex: `[ { "text": "Option 1", "value": 1 }, { "text": "Option 2", "value": 2 } ]`
		 *   
		 *   Extra properties may also be added if needed in this form, and will not be affected by the OptionsStore.  These properties
		 *   may be used by whichever implementation is using the OptionsStore.
		 *   Ex: `[ { "text": "Option 1", "value": 1, "cls" : "myCssClass" }, { "text": "Option 2", "value": 2, "cls" : "myCssClass2" } ]`
		 * 
		 *   If this config is specified as a function, the function will be executed, and its return will be used as the options. Its return should match one of
		 *   the forms defined above.
		 */
		setOptions : function( options ) {
			// If the options were provided as a function, execute the function and use its return as the options array
			if( typeof options === 'function' ) {
				options = options();
			}
			
			// Store the normalized options
			this.options = this.normalizeOptions( options );
		},
		
		
		/**
		 * Adds an option to the OptionsStore.
		 * 
		 * @method addOption
		 * @param {String/Object} A string, which will be used for both the text/value, or an object with `text` and `value` properties.
		 * @param {Number} [index] The index to add the option at. Defaults to appending the option.
		 */
		addOption : function( option, index ) {
			var options = this.options;
			
			option = this.normalizeOption( option );
			index = ( typeof index !== 'undefined' ) ? index : options.length;
			
			// Splice the option in at the index
			options.splice( index, 0, option );
		},
		
		
		/**
		 * Removes an option from the OptionsStore by its value.
		 * 
		 * @method removeOptionByValue
		 * @param {Mixed} value The value of the option to remove.
		 */
		removeOptionByValue : function( value ) {
			var options = this.options;
			for( var i = 0, len = options.length; i < len; i++ ) {
				if( options[ i ].value === value ) {
					options.splice( i, 1 );  // Remove the option
					return;
				}
			}
		},
		
		
		/**
		 * Removes an option from the OptionsStore by its text.
		 * 
		 * @method removeOptionByText
		 * @param {Mixed} text The text of the option to remove.
		 */
		removeOptionByText : function( text ) {
			var options = this.options;
			for( var i = 0, len = options.length; i < len; i++ ) {
				if( options[ i ].text === text ) {
					options.splice( i, 1 );  // Remove the option
					return;
				}
			}
		},
		
		
		// --------------------------------
		
		// Retrieval methods
		
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
		 * Retrieves the number of options held by the OptionsStore.
		 * 
		 * @method getCount
		 * @return {Number} The number of options currently held by the OptionsStore.
		 */
		getCount : function() {
			return this.options.length;
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
	
	return OptionsStore;
	
} );