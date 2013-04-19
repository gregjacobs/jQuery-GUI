/*global define */
define( [
	'lodash',
	'Class',
	'data/persistence/operation/Operation'
], function( _, Class, Operation ) {
	
	/**
	 * @class data.persistence.operation.Write
	 * @extends data.persistence.operation.Operation
	 * 
	 * Represents a write operation to a persistent storage mechanism. This includes creating, updating, or destroying
	 * (deleting) models on the persistent storage.
	 * 
	 * This class is used internally by the framework when making requests to {@link data.persistence.proxy.Proxy Proxies},
	 * but is provided to client callbacks for when {@link data.Model Model}/{@link data.Collection Collection} operations 
	 * complete.
	 */
	var WriteOperation = Class.extend( Operation, {
		
		/**
		 * @cfg {data.Model[]} models
		 * 
		 * The models to write during the WriteOperation.
		 */
		
		
		/**
		 * Retrieves the {@link #models} provided for this WriteOperation.
		 * 
		 * @return {data.Model[]}
		 */
		getModels : function() {
			return ( this.models || (this.models = []) );
		}
		
	} );
	
	return WriteOperation;
	
} );