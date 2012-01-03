/**
 * @class Kevlar.data.RestProxy
 * @extends Kevlar.data.AbstractProxy
 * 
 * RestProxy is responsible for performing CRUD operations in a RESTful manner for a given Model on the server.
 * 
 * @constructor
 * @param {Object} config The configuration options for this class, specified in an object (hash).
 */
/*global window, jQuery, Kevlar */
Kevlar.data.RestProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
	
	/**
	 * @cfg {String} url
	 * The url to use in a RESTful manner to perform CRUD operations.
	 */
	url : "",
	
	/**
	 * @cfg {String} wrapperProperty
	 * If PUT'ing to the server requires the data to be wrapped in a property of its own, use this config
	 * to specify it. Ex: PUT'ing a Blockquote's data needs to look like this:<pre><code>
{
	"blockquote" : {
		"text" : "hello",
		"picture" : {
			"url" : "http://..."
		}
	}
}
	 * </pre></code>
	 * 
	 * This config should be set to "blockquote" in this case.
	 */
	
	
	/**
	 * Creates a Model on the server.
	 * 
	 * @method create
	 * @param {Kevlar.data.Model} The Model instance to create on the server.
	 */
	create : function() {
		throw new Error( "create() not yet implemented" );
	},
	
	
	/**
	 * Reads a Model from the server.
	 * 
	 * @method read
	 * @param {Kevlar.data.Model} The Model instance to read from the server.
	 */
	read : function() {
		throw new Error( "read() not yet implemented" );
	},
	
	
	/**
	 * Updates the given Model on the server.  This method uses "incremental" updates, in which only the changed fields of the `model`
	 * are persisted.
	 * 
	 * @method update
	 * @param {Object} data The data, provided in an Object, to persist to the server. This should only be the "changed" properties in the Model,
	 *   as RestProxy supports incremental updates.
	 * @param {Object} [options] An object which may contain the following properties:
	 * @param {Boolean} [options.async=true] True to make the request asynchronous, false to make it synchronous.
	 * @param {Function} [options.success] Function to call if the update is successful.
	 * @param {Function} [options.failure] Function to call if the update fails.
	 * @param {Function} [options.complete] Function to call regardless of if the update is successful or fails.
	 * @param {Object} [options.scope=window] The object to call the `success`, `failure`, and `complete` callbacks in.
	 */
	update : function( data, options ) {
		options = options || {};
		
		var dataToPersist;
		
		// Handle needing a "wrapper" object for the data
		if( this.wrapperProperty ) {
			dataToPersist = {};
			dataToPersist[ this.wrapperProperty ] = data;
		} else {
			dataToPersist = data;
		}
		
		jQuery.ajax( {
			async: ( typeof options.async === 'undefined' ) ? true : options.async,  // async defaults to true.
			
			url : this.url,
			type : 'PUT',
			headers : {
				// NOTE: not providing this, as the server doesn't actually return JSON, causing jQuery to not call the 'success' callback due to it 
				// not being able to parse the JSON. Only uncomment temporarily if getting a 422 - "unprocessable entity" status code, to see the 
				// actual errors on the server.
				//'Accept' : 'application/json' 
			},
			contentType: "application/json",
			data : JSON.stringify( dataToPersist ),
			
			success  : options.success  || Kevlar.emptyFn,
			error    : options.failure  || Kevlar.emptyFn,
			complete : options.complete || Kevlar.emptyFn,
			context  : options.scope    || window
		} );
	},
	
	
	/**
	 * Destroys (deletes) the Model on the server. This method is not named "delete" as "delete" is a JavaScript reserved word.
	 * 
	 * @method destroy
	 * @param {Kevlar.data.Model} The Model instance to delete on the server.
	 */
	destroy : function() {
		throw new Error( "destroy() not yet implemented" );
	},
	
	
	// ---------------------------------------------
	
	
	/**
	 * Method used by {@link Kevlar.data.Model Model's} to determine if the Proxy supports incremental updates. This proxy returns true,
	 * so that it is only provided the set of changed data to its {@link #update} method, instead of the full set of data in the Model.
	 * 
	 * @method supportsIncrementalUpdates
	 * @return {Boolean} True if the Proxy supports incremental updates, false otherwise.
	 */
	supportsIncrementalUpdates : function() {
		return true;
	}
	
} );