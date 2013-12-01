/*global define */
define( [
	'jquery',
	'lodash',
	'gui/ComponentManager',
	'gui/view/DataBound',
	'gui/util/ModelBindable'
], function( jQuery, _, ComponentManager, DataBoundView, ModelBindable ) {
	
	/**
	 * @class gui.view.Model
	 * @extends gui.view.DataBound
	 * @mixins gui.util.ModelBindable
	 * @alias type.modelview
	 * 
	 * A view of the data in a single {@link data.Model}. The view uses the {@link #tpl} config, which 
	 * is automatically passed the {@link #model} to populate the template. When any of the {@link #model model's} 
	 * attributes change, the Model View is automatically refreshed to reflect the change.  
	 * 
	 * This view is similar to the {@link gui.view.Collection Collection View}, which shows a {@link data.Collection Collection}
	 * of {@link data.Model Models} instead of a single one.  
	 */
	var ModelView = DataBoundView.extend( {
		mixins : [ ModelBindable ],
		
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
		 * @cfg {String/String[]/Function/gui.template.Template} tpl (required)
		 * 
		 * The template which will be used to populate the Model View. By default, this template will be provided
		 * the variable `model`, which is the {@link #model} instance bound to this Model View. The name of the 
		 * variable provided to the {@link #tpl} that holds the models may be configured using the {@link #modelVar} config.
		 * 
		 * For example, if we had a "User" model, which had fields `id`, `firstName`, and `lastName`, then we
		 * might want to display this information in a template as such: (using a {@link gui.template.LoDash Lo-Dash template}
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
		 * For more information on templates themselves, see the {@link gui.Component#tpl tpl} config in the superclass, 
		 * {@link gui.Component Component}.
		 */
		
		/**
		 * @cfg {String} modelVar
		 * 
		 * The name of the variable that will be provided to the {@link #tpl} that holds the {@link #model} that
		 * is to be rendered by it. 
		 * 
		 * This may be used to provide a variable name that makes more sense inside the template for the type of model 
		 * being used. For example, if the Model View is working with a "User" model, one might want to
		 * set this config to `user`. Example: (using a {@link gui.template.LoDash Lo-Dash template} in this case)
		 * 
		 *     modelVar : 'user',
		 *     tpl : new LoDashTpl( [
		 *         '<span>The current user is: <%= user.get( "name" ) %></span>',
		 *     ] )
		 */
		modelVar : 'model',
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Call the ModelBindable constructor
			ModelBindable.call( this );
			
			this._super( arguments );
			
			if( this.model ) {
				this.bindModel( this.model );
			} else {
				this.refresh();  // do an initial refresh if no model, which simply sets up the ModelView to not show anything (and not run the template, since we don't have a model to run it with)
			}
		},
		
		
		/**
		 * Implementation of abstract method from superclass. Returns the {@link #model}, if one is bound.
		 * 
		 * @protected
		 * @return {data.Model} The bound {@link #model}, or `null` if there is no model bound.
		 */
		getDataComponent : function() {
			return this.getModel();
		},
		
		
		/**
		 * Implementation of abstract method from superclass. Unbinds the {@link #model}, if one is bound.
		 * 
		 * @protected
		 */
		unbindDataComponent : function() {
			this.unbindModel();
		},
		
		
		// -----------------------------------
		
		// Implementation of ModelBindable mixin methods
		
		
		/**
		 * Implementation of {@link gui.util.ModelBindable} mixin method, which retrieves an Object (map) of the listeners that 
		 * should be set up on the {@link #model}, when a {@link data.Model} is bound to the view. This method may be overridden 
		 * in a subclass to add extra events that should be listened for.
		 * 
		 * @protected
		 * @param {data.Model} model The Model being bound.
		 * @return {Object} An {@link Observable#addListener addListener} config object for the listeners.
		 */
		getModelListeners : function( model ) {
			return {
				'loadbegin' : this.onLoadBegin,    // method in superclass
				'load'      : this.onLoadComplete, // method in superclass
				'changeset' : this.refresh,
				'rollback'  : this.refresh,
				scope : this
			};
		},
		
		
		/**
		 * Implementation of {@link gui.util.ModelBindable} mixin method. Handles when a new {@link #model} has been 
		 * bound to the view.
		 * 
		 * @protected
		 * @param {data.Model} newModel The newly bound model. Will be `null` if the previous model was
		 *   simply unbound (i.e. `null` was passed to {@link #bindModel}, or {@link #unbindModel} was called). 
		 * @param {data.Model} oldModel The model that was just unbound. Will be `null` if there was no
		 *   previously-bound model.
		 */
		onModelBind : function( newModel ) {
			// Handle `maskOnLoad` behavior for the new bind. If the "new" model is loading, mask.
			// Otherwise, make sure the ModelView is unmasked.
			if( this.maskOnLoad ) {
				this[ newModel && newModel.isLoading() ? 'mask' : 'unMask' ]();
			}
			
			this.refresh();
		},
		
		
		// -----------------------------------
		
		
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
		 * Retrieves the data that will be {@link gui.template.Template#apply applied} to the {@link #tpl} upon 
		 * {@link #refresh}. 
		 * 
		 * This method may be overridden by subclasses to add additional properties which will be provided
		 * to the {@link #tpl}.
		 * 
		 * @protected
		 * @param {data.Model} model The model that is to be rendered by the {@link #tpl}.
		 * @return {Object} An Object (map) of the properties which will be {@link gui.template.Template#apply applied}
		 *   to the {@link #tpl}, to produce the output.
		 */
		prepareTplData : function( model ) {
			var data = {};
			data[ this.modelVar ] = model;
			
			return data;
		}
		
	} );
	
	
	ComponentManager.registerType( 'modelview', ModelView );
	
	return ModelView;
	
} );