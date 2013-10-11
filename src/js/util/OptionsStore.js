/*global define */
define( [
	'lodash',
	'Class'
], function( _, Class ) {
	
	/**
	 * @class jqg.util.OptionsStore
	 * @extends Object
	 * 
	 * Helper utility class used for making the management of text/value "options" data easy, for any classes that rely on this format 
	 * of data. This is used as used, for example, by {@link jqg.form.field.Dropdown Dropdowns}. The purpose of this class 
	 * was to not duplicate functionality for the classes that use this format of data.
	 * 
	 * This class is currently used by {@link jqg.form.field.Dropdown} and {@link jqg.form.field.Radio}, which use it for 
	 * managing the options that they provide.
	 */
	var OptionsStore = Class.extend( Object, {
		
		/**
		 * @protected
		 * @property {Object[]} options
		 * 
		 * The internal array of options held by the OptionsStore.
		 */
		
		
		/**
		 * Instantiates an OptionsStore.
		 * 
		 * @constructor
		 * @param {String[]/Object[]} [options] The initial set of options to provide to the OptionsStore, if any. 
		 *   See the `options` parameter in {@link #setOptions} for accepted formats of this parameter.
		 */
		constructor : function( options ) {
			this.setOptions( options || [] );
		},
		
		
		/**
		 * Normalizes the given array of options into text/value options.
		 * 
		 * @protected
		 * @param {String[]/Object[]} options See the `options` argument of {@link #setOptions}.
		 * @return {Object[]} The options normalized to objects with `text` and `value` properties.
		 */
		normalizeOptions : function( options ) {
			return _.map( options, function( opt ) { return this.normalizeOption( opt ); }, this );
		},
		
		
		/**
		 * Normalizes a single option into an object with `text` and `value` properties. 
		 * 
		 * - If a String is provided as the argument, that string will be used as both the `text` and `value` properties. 
		 * - If an Object is provided, it must at least have a `text` property, which will also be used for the `value` 
		 *   property should no `value` of its own exist.
		 * 
		 * @protected
		 * @param {String/Object} option
		 * @return {Object} A normalized object with `text` and `value` properties.
		 */
		normalizeOption : function( option ) {
			if( typeof option === 'object' ) {
				option = _.clone( option );  // make a shallow copy, as to not affect the original
				
				// If no value is specified, use the `text` property as the value.
				if( option.value === undefined ) {
					option.value = option.text;
				}
				
				return option;
				
			} else {
				// String `option` arg: use it for both `text` and `value` properties on the returned object
				return { text: option, value: option };
			}
		},
		
		
		/**
		 * Sets the options for the store. 
		 * 
		 * Normalizes the options into an Array of Objects, where each Object has the properties `text` and `value`. Any extra 
		 * properties on the objects are left unchanged.
		 * 
		 * @param {String[]/Object[]} options The options for the OptionsStore. If this is a flat array of strings, the values will be 
		 *   used as both the `text` and `value` properties of the options.  Ex: 
		 *   
		 *       [ "Option 1", "Option 2", "Option 3" ]
		 * 
		 *   If you want to customize the value and text separately for each option, provide an Array of Objects, where the Object 
		 *   has two properties: `text` and `value`. Ex: 
		 *   
		 *       [ 
		 *           { "text": "Option 1", "value": 1 },
		 *           { "text": "Option 2", "value": 2 }
		 *       ]
		 *   
		 *   Extra properties may also be added if needed in this form, and will not be affected by the OptionsStore.  These properties
		 *   may be used by whichever implementation is using the OptionsStore. Ex: 
		 *   
		 *       [
		 *           { "text": "Option 1", "value": 1, "cls" : "myCssClass" },
		 *           { "text": "Option 2", "value": 2, "cls" : "myCssClass2" }
		 *       ]
		 */
		setOptions : function( options ) {
			this.options = this.normalizeOptions( options );
		},
		
		
		/**
		 * Adds an option to the OptionsStore.
		 * 
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
		 * Removes an option from the OptionsStore by its text.
		 * 
		 * @param {Mixed} text The text of the option to remove.
		 */
		removeOptionByText : function( text ) {
			var options = this.options,
			    idx = _.findIndex( options, { text: text } );
			
			if( idx !== -1 ) {
				options.splice( idx, 1 );  // remove the option
			}
		},
		
		
		/**
		 * Removes an option from the OptionsStore by its value.
		 * 
		 * @param {Mixed} value The value of the option to remove.
		 */
		removeOptionByValue : function( value ) {
			var options = this.options,
			    idx = _.findIndex( this.options, { value: value } );
			
			if( idx !== -1 ) {
				options.splice( idx, 1 );  // remove the option
			}
		},
		
		
		// --------------------------------
		
		// Retrieval methods
		
		/**
		 * Retrives all of the options objects held by the OptionsStore. Each options object has properties: `text` and `value`.
		 * 
		 * @return {Object[]} An array of the options objects, each of which has properties `text` and `value`.
		 */
		getOptions : function() {
			return this.options;
		},
		
		
		/**
		 * Retrieves the number of options held by the OptionsStore.
		 * 
		 * @return {Number} The number of options currently held by the OptionsStore.
		 */
		getCount : function() {
			return this.options.length;
		},
		
		
		/**
		 * Retrieves an option based on its index position (0-based).
		 * 
		 * @param {Number} index
		 * @return {Object} The option object with properties `text` and `value`, or `null` if the index was out of range.
		 */
		getAtIndex : function( index ) {
			return this.options[ index ] || null;
		},
		
		
		/**
		 * Retrieves an option based on its `text`. An option object has properties `text` and `value`.
		 * 
		 * @param {String} text
		 * @return {Object} The option object with properties `text` and `value`, or `null` if no option was found.
		 */
		getByText : function( text ) {
			return _.find( this.options, { text: text } ) || null;
		},
		
		
		/**
		 * Retrieves an option based on its `value`. An option object has properties `text` and `value`.
		 * 
		 * @param {Mixed} value
		 * @return {Object} The option object with properties `text` and `value`, or `null` if no option was found.
		 */
		getByValue : function( value ) {
			return _.find( this.options, { value: value } ) || null;
		}
	
	} );
	
	return OptionsStore;
	
} );