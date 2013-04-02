/*global define */
define( [
	'lodash',
	'Class'
], function( _, Class ) {
	
	/**
	 * @abstract
	 * @class ui.template.Template
	 * @extends Object
	 * 
	 * Base class and interface for template implementations. For the default concrete Template implementation used
	 * by the framework, see {@link ui.template.LoDash}.
	 */
	var Template = Class.extend( Object, {
		abstractClass : true,
		
		/**
		 * Applies the given `data` object to the Template, and returns the result.
		 * 
		 * @abstract
		 * @method apply
		 * @param {Object} [data] The data object to apply to the template (i.e. execute the compiled template function 
		 *   with). If the template does not use any data, this may be ommitted.
		 * @return {String} The result of applying the `data` object to the template.
		 */
		apply : Class.abstractMethod
		
	} );
	
	return Template;
	
} );