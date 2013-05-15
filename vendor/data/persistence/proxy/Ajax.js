/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'data/Data',
	'data/persistence/proxy/Proxy'
], function( jQuery, _, Class, Data, Proxy ) {
	
	/**
	 * @class data.persistence.proxy.Ajax
	 * @extends data.persistence.proxy.Proxy
	 * 
	 * Ajax proxy is responsible for performing CRUD operations through standard AJAX, using the url(s) configured,
	 * and providing any parameters and such which are required for the backend service.
	 * 
	 * The Ajax proxy must be configured with the appropriate parameter names in order for it to automatically supply
	 * those parameters as part of its requests. For example, the {@link #pageParam} must be configured for the Ajax
	 * proxy to automatically add a page number parameter to the request URL.
	 */
	var AjaxProxy = Class.extend( Proxy, {
		
		/**
		 * @cfg {String} url
		 * 
		 * The URL of where to request data from. This URL can be overridden for any particular CRUD (create,
		 * read, update, destroy) method by using the {@link #api} config.
		 */
		
		/**
		 * @cfg {Object} api
		 * 
		 * Specific URLs to use for each CRUD (create, read, update, destroy) method. Defaults to:
		 * 
		 *     api : {
		 *         create  : undefined,
		 *         read    : undefined,
		 *         update  : undefined,
		 *         destroy : undefined
		 *     }
		 *     
		 * The URL that is used depends on the method being executed ({@link #create}, {@link #read}, 
		 * {@link #update}, or {@link #destroy}). 
		 * 
		 * An example configuration may be:
		 * 
		 *     api : {
		 *         create  : '/users/new',
		 *         read    : '/users/load',
		 *         update  : '/users/update',
		 *         destroy : '/users/delete
		 *     }
		 *     
		 * If a URL does not exist in the api map for the method being executed, the {@link #url} config 
		 * will be used instead. This allows the {@link #url} config to be used for all api methods.
		 */
		
		/**
		 * @cfg {Object} defaultParams
		 * 
		 * An Object (map) of any default parameters to include with every request. `params` provided to individual
		 * requests will override default parameters of the same name.
		 * 
		 * Ex:
		 * 
		 *     defaultParams : {
		 *         returnType : 'json'
		 *     }
		 *     
		 * Note that the values of these parameters will be URL encoded.
		 */
		
		/**
		 * @cfg {Object} actionMethods
		 * 
		 * A mapping of the HTTP method to use for each CRUD (create, read, update, destroy) action. This may be 
		 * overridden for custom implementations.
		 */
		actionMethods : {
			create  : 'POST',
			read    : 'GET',
			update  : 'POST',
			destroy : 'POST'
		},
		
		/**
		 * @cfg {String} idParam
		 * 
		 * The name of the parameter to pass the id of a particular model that is being operated on. For example,
		 * when loading a single {@link data.Model Model}, a request may be generated as: `/users/load?id=42`
		 */
		idParam : 'id',
		
		/**
		 * @cfg {String} pageParam
		 * 
		 * The name of the parameter to pass the page number when loading a paged data set. If this config is not provided,
		 * no page number parameter will be included in requests.
		 * 
		 * For example, if this config is set to 'page', and a page 10 of data is being loaded (via {@link data.Collection#loadPage}), 
		 * a request may be generated as: `/posts/load?page=10`
		 * 
		 * (A `pageParam` config must be provided if loading pages of data in this manner.) 
		 */
		
		/**
		 * @cfg {String} pageSizeParam
		 * 
		 * The name of the parameter to pass the page size when loading a paged data set. If this config is not provided,
		 * no page size parameter will be included in requests.
		 * 
		 * For example, if this config is set to 'pageSize', and a page of data is being loaded (via {@link data.Collection#loadPage}), 
		 * a request may be generated as: `/posts/load?pageSize=50`
		 */
		
		
		/**
		 * @protected
		 * @property {Function} ajax
		 * 
		 * A reference to the AJAX function to use for persistence. This is normally left as jQuery.ajax,
		 * but is changed for unit tests.
		 */
		ajax : jQuery.ajax,
		
		
		
		/**
		 * @constructor
		 * @param {Object} cfg The configuration options for this class, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			this._super( arguments );
			
			this.api = this.api || {};
			this.defaultParams = this.defaultParams || {};
		},
		
		
		
		/**
		 * Creates the Model on the server.
		 * 
		 * @param {data.persistence.operation.Write} operation The WriteOperation instance that holds the model(s) 
		 *   to be created on the REST server.
		 * @return {jQuery.Promise} A Promise object which is resolved when the operation is complete.
		 *   `done`, `fail`, and `always` callbacks are called with the `operation` object provided to 
		 *   this method as the first argument.
		 */
		create : function( operation ) {
			throw new Error( "create() not yet implemented" );
		},
		
		
		/**
		 * Reads one or more {@link data.Model Models} from the server.
		 * 
		 * @param {data.persistence.operation.Read} operation The ReadOperation instance that describes the 
		 *   model(s) to be read from the server.
		 * @return {jQuery.Promise} A Promise object which is resolved when the operation is complete.
		 *   `done`, `fail`, and `always` callbacks are called with the `operation` object provided to 
		 *   this method as the first argument.
		 */
		read : function( operation ) {
			var me = this,  // for closures
			    deferred = new jQuery.Deferred();
			
			this.ajax( {
				url      : this.buildUrl( 'read', operation ),
				type     : this.getHttpMethod( 'read' ),
				dataType : 'text'
			} ).then(
				function( data, textStatus, jqXHR ) {
					operation.setResultSet( me.reader.read( data ) );
					operation.setSuccess();
					deferred.resolve( operation );
				},
				function( jqXHR, textStatus, errorThrown ) {
					operation.setException( { textStatus: textStatus, errorThrown: errorThrown } );
					deferred.reject( operation );
				}
			);
			
			return deferred.promise();
		},
		
		
		/**
		 * Updates the given Model on the server.  This method uses "incremental" updates, in which only the changed attributes of the `model`
		 * are persisted.
		 * 
		 * @param {data.persistence.operation.Write} operation The WriteOperation instance that holds the model(s) 
		 *   to be updated on the REST server.
		 * @return {jQuery.Promise} A Promise object which is resolved when the operation is complete.
		 *   `done`, `fail`, and `always` callbacks are called with the `operation` object provided to 
		 *   this method as the first argument.
		 */
		update : function( operation, options ) {
			throw new Error( "update() not yet implemented" );
		},
		
		
		/**
		 * Destroys (deletes) the Model on the server.
		 * 
		 * Note that this method is not named "delete" as "delete" is a JavaScript reserved word.
		 * 
		 * @param {data.persistence.operation.Write} operation The WriteOperation instance that holds the model(s) 
		 *   to be destroyed on the REST server.
		 * @return {jQuery.Promise} A Promise object which is resolved when the operation is complete.
		 *   `done`, `fail`, and `always` callbacks are called with the `operation` object provided to 
		 *   this method as the first argument.
		 */
		destroy : function( operation ) {
			throw new Error( "destroy() not yet implemented" );
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Builds the full URL that will be used for any given CRUD (create, read, update, destroy) request. This will
		 * be the base url provided by either the {@link #api} or {@link #url} configs, plus any parameters that need
		 * to be added based on the `operation` provided.
		 * 
		 * @protected
		 * @param {String} action The action that is being taken. Should be 'create', 'read', 'update', or 'destroy'.
		 * @param {data.persistence.operation.Read/data.persistence.operation.Write} operation
		 * @return {String} The full URL, with all parameters.
		 */
		buildUrl : function( action, operation ) {
			var params = _.assign( {}, this.defaultParams, operation.getParams() || {} );   // build the params map
			
			if( action === 'read' ) {
				var modelId = operation.getModelId(),
				    page = operation.getPage(),
				    pageSize = operation.getPageSize(),
				    pageParam = this.pageParam,
				    pageSizeParam = this.pageSizeParam;
				
				if( modelId !== null ) 
					params[ this.idParam ] = modelId;
				
				if( page > 0 && pageParam ) {   // an actual page was requested, and there is a pageParam config defined
					params[ pageParam ] = page;
					
					if( pageSize > 0 && pageSizeParam ) {
						params[ pageSizeParam ] = pageSize;
					}
				}
			}
			
			// Map the params object to an array of query string params
			params = _.map( params, function( value, prop ) {
				return prop + '=' + encodeURIComponent( value );
			} );
			return this.urlAppend( this.getUrl( action ), params.join( '&' ) );
		},
		
		
		
		/**
		 * Retrieves the base URL to use for the given CRUD (create, read, update, destroy) operation. This is based on 
		 * either the {@link #api} (if there is a URL defined for the given `action`), or otherwise, the {@link #url} config.
		 * 
		 * @protected
		 * @param {String} action The action that is being taken. Should be 'create', 'read', 'update', or 'destroy'.
		 * @return {String} The URL to use for the given `action`.
		 */
		getUrl : function( action ) {
			var url = this.api[ action ] || this.url;
			
			// <debug>
			if( !url ) 
				throw new Error( "No url found for action method '" + action + "'. Need to configure ajax proxy with `url` and/or `api` configs" );
			// </debug>
			
			return url;
		},
		
		
		/**
		 * Retrieves the HTTP method that should be used for a given action. This is, by default, done via 
		 * a lookup to the {@link #actionMethods} config object.
		 * 
		 * @protected
		 * @param {String} action The action that is being taken. Should be 'create', 'read', 'update', or 'destroy'.
		 * @return {String} The HTTP method that should be used, based on the {@link #actionMethods} config.
		 */
		getHttpMethod : function( action ) {
			return this.actionMethods[ action ];
		},
		
		
		/**
		 * Utility method which appends a query string of arguments to an existing url. Will append with the
		 * '&' character if there is already a query string separator in the url ('?'), or otherwise will append
		 * with the query string separator.
		 * 
		 * Ex:
		 *     
		 *     this.urlAppend( 'http://www.yahoo.com/', 'x=1&y=2' );
		 *     // <- http://www.yahoo.com/?x=1&y=2
		 *     
		 *     this.urlAppend( 'http://www.yahoo.com/?x=1', 'y=2&z=3' );
		 *     // <- http://www.yahoo.com/?x=1&y=2&z=3
		 *     
		 * @param {String} baseUrl The base url to append to.
		 * @param {String} queryString The query string to append.
		 * @return The baseUrl + queryString, with the correct separator character.
		 */
		urlAppend : function( baseUrl, queryString ) {
			var url = baseUrl;
			
			if( queryString ) {
				var sepChar = ( baseUrl.indexOf( '?' ) === -1 ) ? '?' : '&';
				url += sepChar + queryString;
			}
			return url;
		}
		
	} );
	
	// Register the persistence proxy so that it can be created by an object literal with a `type` property
	Proxy.register( 'ajax', AjaxProxy );
	
	return AjaxProxy;
	
} );