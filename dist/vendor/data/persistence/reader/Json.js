/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'data/persistence/reader/Reader'
], function( jQuery, _, Class, Reader ) {
	
	/**
	 * @class data.persistence.reader.Json
	 * @extends data.persistence.reader.Reader
	 * 
	 * JSON flavor reader which treats raw text data as JSON, and converts it to a JavaScript
	 * object.
	 * 
	 * See {@link data.persistence.reader.Reader} for more information on readers.
	 */
	var JsonReader = Class.extend( Reader, {
		
		/**
		 * Abstract method which should be implemented to take the raw data, and convert it into
		 * a JavaScript Object.
		 * 
		 * @protected
		 * @param {Mixed} rawData Either a string of JSON, or a JavaScript Object. If a JavaScript
		 *   Object is provided, it will simply be returned.
		 * @return {Object} The resulting Object as a result of parsing the JSON.
		 */
		convertRaw : function( rawData ) {
			var data = rawData;
			
			if( typeof rawData === 'string' ) {
				if( typeof JSON !== 'undefined' && JSON.parse ) { 
					data = JSON.parse( rawData );
				} else {
					data = jQuery.globalEval( '(' + rawData + ')' );
				}
			}
			return data;
		}
		
	} );
	
	return JsonReader;
	
} );