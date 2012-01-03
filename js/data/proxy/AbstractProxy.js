/**
 * @abstract
 * @class Kevlar.data.AbstractProxy
 * @extends Kevlar.util.Observable
 * 
 * AbstractProxy is the base class for subclasses that perform CRUD (Create, Read, Update, and Delete) operations on the server.
 * 
 * @constructor
 * @param {Object} config The configuration options for this class, specified in an object (hash).
 */
/*global Kevlar */
Kevlar.data.AbstractProxy = Kevlar.extend( Kevlar.util.Observable, {
	
	constructor : function( config ) {
		// Apply the config
		Kevlar.apply( this, config );
	},
	
	
	/**
	 * Creates a Model on the server.
	 * 
	 * @abstract
	 * @method create
	 * @param {Kevlar.data.Model} model The Model instance to create on the server.
	 */
	create : Kevlar.abstractFn,
	
	
	/**
	 * Reads a Model from the server.
	 * 
	 * @abstract
	 * @method read
	 * @param {Kevlar.data.Model} model The Model instance to read from the server.
	 */
	read : Kevlar.abstractFn,
	
	
	/**
	 * Updates the Model on the server, using the provided `data`.  
	 * 
	 * @abstract
	 * @method update
	 * @param {Object} data The data, provided in an Object, to persist to the server.
	 */
	update : Kevlar.abstractFn,
	
	
	/**
	 * Destroys (deletes) the Model on the server. This method is not named "delete" as "delete" is a JavaScript reserved word.
	 * 
	 * @abstract
	 * @method destroy
	 * @param {Kevlar.data.Model} model The Model instance to delete on the server.
	 */
	destroy : Kevlar.abstractFn,
	
	
	// ---------------------------------------------
	
	
	/**
	 * Method used by {@link Kevlar.data.Model Model's} to determine if the Proxy supports incremental updates. If the proxy does,
	 * it is only provided the set of changed data to its {@link #update} method, instead of the full set of data in the Model.
	 * This method must be implemented by subclasses.
	 * 
	 * @abstract
	 * @method supportsIncrementalUpdates
	 * @return {Boolean} True if the Proxy supports incremental updates, false otherwise.
	 */
	supportsIncrementalUpdates : Kevlar.abstractFn
	
} );