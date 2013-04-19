/*global define */
define( [
	'lodash',
	'Class'
], function( _, Class ) {
	
	/**
	 * @class data.persistence.operation.Batch
	 * 
	 * Represents one or more {@link data.persistence.operation.Operation Operations} which were executed in a logical
	 * group.
	 * 
	 * The Batch object provides access to each {@link data.persistence.operation.Operation Operation}, and also provides
	 * methods for determining the overall success or failure (error) state of the Operations within it.
	 * 
	 * This class is mainly used internally by the library, and is provided to client code at the times when multiple
	 * {@link data.persistence.operation.Operation Operations} were needed to satisfy a request, so that it may be inspected
	 * for any needed information.
	 */
	var OperationBatch = Class.extend( Object, {
		
		/**
		 * @cfg {data.persistence.operation.Operation/data.persistence.operation.Operation[]} operations
		 * 
		 * One or more Operation(s) that make up the Batch.
		 */
		
		
		/**
		 * @constructor
		 * @param {Object} [cfg] Any of the configuration options for this class, in an Object (map).
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );
			
			// normalize the `operations` config to an array
			this.operations = ( this.operations ) ? [].concat( this.operations ) : [];
		},
		
		
		/**
		 * Retrieves all of the {@link #operations} for this Batch. 
		 * 
		 * @return {data.persistence.operation.Operation[]}
		 */
		getOperations : function() {
			return this.operations;
		},
		
		
		/**
		 * Determines if the Batch of {@link #operations} completed successfully. All {@link #operations}
		 * must have completed successfully for the Batch to be considered successful.
		 * 
		 * @return {Boolean}
		 */
		wasSuccessful : function() {
			return !_.find( this.operations, function( op ) { return op.hasErrored(); } );  // _.find() returns `undefined` if no errored operations are found
		},
		
		
		/**
		 * Determines if the Batch failed to complete successfully. If any of the {@link #operations}
		 * has errored, this method returns true.
		 * 
		 * @return {Boolean}
		 */
		hasErrored : function() {
			return !this.wasSuccessful();
		},
		
		
		/**
		 * Retrieves each {@link data.persistence.operation.Operation Operation} object that has completed
		 * successfully.
		 * 
		 * @return {data.persistence.operation.Operation[]} An array of the Operations which have completed
		 *   successfully.
		 */
		getSuccessfulOperations : function() {
			return _.filter( this.operations, function( op ) { return !op.hasErrored(); } );
		},
		
		
		/**
		 * Retrieves each {@link data.persistence.operation.Operation Operation} object that has errored.
		 * 
		 * @return {data.persistence.operation.Operation[]} An array of the Operations which have errored.
		 */
		getErroredOperations : function() {
			return _.filter( this.operations, function( op ) { return op.hasErrored(); } );
		},
		
		
		/**
		 * Determines if all {@link data.persistence.operation.Operation Operations} in the batch are complete.
		 * 
		 * @return {Boolean} `true` if all Operations are complete, `false` if any are not yet complete.
		 */
		isComplete : function() {
			return _.all( this.operations, function( op ) { return op.isComplete(); } );
		}
		
	} );
	
	return OperationBatch;
	
} );