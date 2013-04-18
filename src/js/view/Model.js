/*global define */
define( [
	'jquery',
	'lodash',
	'jqc/Component'
], function( jQuery, _, Component ) {
	
	/**
	 * @class jqc.view.Model
	 * @extends jqc.Component
	 * 
	 * A view of the data in a single {@link data.Model}. The view uses the {@link #tpl} config, which 
	 * is automatically passed the {@link #model} to populate the template. When any of the {@link #model model's} 
	 * attributes change, the Model View is automatically refreshed to reflect the change.  
	 * 
	 * This view is similar to the {@link jqc.view.Collection Collection View}, which shows a {@link data.Collection Collection}
	 * of {@link data.Model Models} instead of a single one.  
	 */
	var ModelView = Component.extend( {
		
		/**
		 * @cfg {data.Model} model (required)
		 * 
		 * The Model to work with. This is required to populate the Component's {@link #tpl}, but
		 * does not need to be provided upon instantiation. It may be provided at a later time with the
		 * {@link #bindModel} method.
		 * 
		 * The Model is monitored for changes, and the view is refreshed when they occur.
		 */
		
		/**
		 * @cfg {String/String[]/Function/jqc.template.Template} tpl (required)
		 * 
		 * The template which will be used to populate the Model View. By default, this template will be provided
		 * the variable `model`, which is the {@link #model} instance bound to this Model View. The name of the 
		 * variable provided to the {@link #tpl} that holds the models may be configured using the {@link #modelVar} config.
		 * 
		 * For example, if we had a "User" model, which had fields `id`, `firstName`, and `lastName`, then we
		 * might want to display this information in a template as such: (using a {@link jqc.template.LoDash Lo-Dash template}
		 * in this case)
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<div>',
		 *             'Current User: <%= model.get( "lastName" ) %>, <%= model.get( "firstName" ) %> (<%= model.get( "id" ) %>)',
		 *         '</div>'
		 *     ] )
		 *     
		 * If we wanted to convert all of the {@link data.Model Model's} attributes to a plain JavaScript Object (map)
		 * before working with them, we can call {@link data.Model#getData getData} on it beforehand. For example:
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<% var data = model.getData() %>
		 *         '<div>',
		 *             'Current User: <%= data.lastName %>, <%= data.firstName %> (<%= data.id %>)',
		 *         '</div>'
		 *     ] )
		 * 
		 * While the above example may be more readable than the example before it, it may involve more processing and
		 * conversions being executed behind the scenes for attribute retrieval than are needed by the template. If only 
		 * a subset of the attributes in the {@link data.Model Model} are needed for the template, it would be more efficient 
		 * to only retrieve those particular attributes using {@link data.Model#get}.
		 * 
		 * For more information on templates themselves, see the {@link jqc.Component#tpl tpl} config in the superclass, 
		 * {@link jqc.Component Component}.
		 */
		
		/**
		 * @cfg {String} modelVar
		 * 
		 * The name of the variable that will be provided to the {@link #tpl} that holds the {@link #model} that
		 * is to be rendered by it. 
		 * 
		 * This may be used to provide a variable name that makes more sense inside the template for the type of model 
		 * being used. For example, if the Model View is working with a "User" model, one might want to
		 * set this config to `user`. Example: (using a {@link jqc.template.LoDash Lo-Dash template} in this case)
		 * 
		 *     modelVar : 'user',
		 *     tpl : new LoDashTpl( [
		 *         '<span>The current user is: <%= user.get( "name" ) %></span>',
		 *     ] )
		 */
		modelVar : 'model',
		
		/**
		 * @cfg {Boolean} maskOnLoad
		 * 
		 * True to automatically mask the Model View while the backing {@link #model} is loading. The mask that is shown
		 * can be configured with the {@link #maskConfig} configuration option, or defaults to showing the message "Loading..."
		 * 
		 * This really only applies to a {@link data.Model Model} that is being {@link data.Model#reload reloaded} from 
		 * its backing data source (ex: a web server).
		 */
		maskOnLoad : true,
		
		
		
		/**
		 * @private
		 * @property {Boolean} firstBindComplete
		 * 
		 * Property which is set to true when the initial bind (called from {@link #initComponent} is complete.
		 */
		
		/**
		 * @private
		 * @property {Object} modelListeners
		 * 
		 * The listeners that were bound to the current {@link #model} in the {@link #bindModelListeners} method. 
		 * If there has been no model bound to this view yet, this will be `undefined`.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			// <debug>
			if( !this.tpl ) throw new Error( "`tpl` config required" );
			// </debug>
			
			this.bindModel( this.model || null );
			
			// Set up the maskConfig if there is not a user-defined one. This is for masking the component
			// while the model is loading.
			this.maskConfig = this.maskConfig || { msg: "Loading..." };
		},
		
		
		/**
		 * @inheritdoc
		 */
		onAfterRender : function() {
			this._super( arguments );
			
			// Mask the view if the Model is currently loading when the view is rendered
			/*var model = this.model;
			if( model && this.maskOnLoad && model.isLoading() ) {
				this.mask();
			}*/
		},
		
		
		// -----------------------------------
		
		// Model binding methods
		
		
		/**
		 * Binds a {@link data.Model} to the view. The Model will be used to populate the {@link #tpl},
		 * and will also be monitored for changes to refresh the view as well.
		 * 
		 * Any previous {@link #model} will be unbound from the view.
		 * 
		 * @param {data.Model} model The Model to bind. To unbind the currently-bound Model,
		 *   pass `null`.
		 */
		bindModel : function( model ) {
			if( this.model !== model || !this.firstBindComplete ) {
				// If there is a current model, and there have been listeners bound to it (i.e. it is not the initial bind
				// call from having a `model` config), then unbind its listeners in preparation to bind a new Model
				if( this.model ) {
					this.unbindModelListeners();
				}
				
				this.model = model;
				if( model ) {
					this.bindModelListeners();
				}
				this.firstBindComplete = true;
				
				this.refresh();
			}
		},
		
		
		/**
		 * Binds listeners to the current {@link #model}, so that the view can refresh itself upon
		 * changes. The listeners that are set up are created by the {@link #getModelListeners} method,
		 * which may be overridden to listen to other events that a particular {@link data.Model} subclass
		 * may fire.
		 * 
		 * @private
		 */
		bindModelListeners : function() {
			var model = this.model,
			    listeners = _.clone( this.getModelListeners( model ) );  // shallow copy of the listeners
			
			model.on( listeners );
			this.modelListeners = listeners;
		},
		
		
		/**
		 * Retrieves an Object (map) of the listeners that should be set up on the {@link #model}, when 
		 * a {@link data.Model} is bound to the view. This method may be overridden in a subclass to add 
		 * events that should be listened for.
		 * 
		 * @protected
		 * @param {data.Model} model The Model being bound.
		 * @return {Object} An {@link Observable#addListener addListener} config object for the listeners.
		 */
		getModelListeners : function( model ) {
			return {
				'loadbegin' : this.onLoadBegin,
				'load'      : this.onLoadComplete,
				'changeset' : this.refresh,
				'rollback'  : this.refresh,
				scope : this
			};
		},
		
		
		/**
		 * Unbinds the current {@link #model model's} listeners, which were bound by
		 * {@link #bindModelListeners}.
		 * 
		 * @private
		 */
		unbindModelListeners : function() {
			if( this.model && this.modelListeners ) {
				this.model.un( this.modelListeners );  // the Model listener's set up in bindModelListeners()
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Handles the {@link #model} starting to load, by displaying the "loading" mask over the Model View
		 * if the {@link #maskOnLoad} config is true.
		 * 
		 * @protected
		 */
		onLoadBegin : function() {
			if( this.maskOnLoad ) {
				this.mask();
			}
		},
		
		
		/**
		 * Handles the {@link #model} completing its load, by removing the "loading" mask from the Model View,
		 * which was shown by {@link #onLoadBegin} if the {@link #maskOnLoad} config was true.
		 * 
		 * Note: The view will be refreshed due to the addition/removal of models, and doesn't need to be refreshed
		 * from this method.
		 * 
		 * @protected
		 */
		onLoadComplete : function() {
			if( this.maskOnLoad ) {
				this.unMask();
			}
		},
		
		
		/**
		 * Refreshes the view by {@link #update updating} the Component's markup, based on the {@link #tpl}
		 * and the current state of the {@link #model}. This method should normally not need to be called 
		 * directly, as the view will automatically be updated when changes are detected on the {@link #model}.
		 */
		refresh : function() {
			if( !this.model ) {
				this.update( "" );  // don't display anything
				
			} else {
				this.update( this.prepareTplData( this.model ) );
			}
		},
		
		
		/**
		 * Retrieves the data that will be {@link jqc.template.Template#apply applied} to the {@link #tpl} upon 
		 * {@link #refresh}. 
		 * 
		 * This method may be overridden by subclasses to add additional properties which will be provided
		 * to the {@link #tpl}.
		 * 
		 * @protected
		 * @param {data.Model} model The model that is to be rendered by the {@link #tpl}.
		 * @return {Object} An Object (map) of the properties which will be {@link jqc.template.Template#apply applied}
		 *   to the {@link #tpl}, to produce the output.
		 */
		prepareTplData : function( model ) {
			var data = {};
			data[ this.modelVar ] = model;
			
			return data;
		},
		
		
		// ---------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.model ) {
				this.unbindModelListeners();
				delete this.model;
			}
			
			this._super( arguments );
		}
		
	} );
	
	return ModelView;
	
} );