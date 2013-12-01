/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	
	'gui/Component'
], function( jQuery, _, Class, Component ) {
	
	/**
	 * @abstract
	 * @class gui.view.DataBound
	 * @extends gui.Component
	 * 
	 * This class serves as the abstract base class of the {@link gui.view.Collection} and {@link gui.view.Model} classes,
	 * which provides the common functionality for data-bound views. See subclasses for details.
	 */
	var DataBoundView = Component.extend( {
		abstractClass : true,
		
		
		/**
		 * @cfg {String/String[]/Function/gui.template.Template} tpl (required)
		 * @inheritdoc
		 */
		
		/**
		 * @cfg {Boolean} maskOnLoad
		 * 
		 * True to automatically mask the DataBoundView while its backing {@link data.DataComponent DataComponent} (a 
		 * {@link data.Model} or {@link data.Collection}) is loading. The mask that is shown can be configured with the 
		 * {@link #maskConfig} configuration option, or defaults to showing the message "Loading...".
		 */
		maskOnLoad : true,
		
		/**
		 * @cfg {Number} loadingHeight
		 * 
		 * A minimum height to give the DataBoundView while its {@link data.DataComponent DataComponent} (a 
		 * {@link data.Model} or {@link data.Collection}) is loading. This is useful to prevent the DataBoundView from collapsing 
		 * to 0 height while the load mask is being shown, and there is no content in the view.
		 * 
		 * This is only used if the {@link #maskOnLoad} config is `true`. It is also only applied if the DataBoundView's height
		 * is less than this number.
		 */
		
		
		/**
		 * @private
		 * @property {Boolean} hasLoadingHeight
		 * 
		 * Flag which is set to true when the {@link #loadingHeight} is applied, and set back to `false` after the
		 * {@link #loadingHeight} has been removed.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			// <debug>
			if( !this.tpl ) throw new Error( "`tpl` config required" );
			// </debug>
			
			// Set up the maskConfig if there is not a user-defined one. This is for masking the component
			// while the model is loading.
			this.maskConfig = this.maskConfig || { spinner: true, msg: "Loading..." };
		},
		
		
		/**
		 * @inheritdoc
		 */
		onAfterRender : function() {
			this._super( arguments );
			
			// Apply the loading height if the Data is currently loading when the view is rendered 
			// (and the DataBoundView is supposed to be masked on load)
			var dataComponent = this.getDataComponent();
			if( dataComponent ) {
				if( this.maskOnLoad && dataComponent.isLoading() ) {
					this.applyLoadingHeight();
				}
			}
		},
		
		
		/**
		 * Method which must be implemented in subclasses so that the DataBoundView can retrieve the {@link data.DataComponent}
		 * which is currently bound.  
		 * 
		 * @protected
		 * @abstract
		 * @method getDataComponent
		 * @return {data.DataComponent} The DataComponent which is currently bound, or `null`.
		 */
		getDataComponent : Class.abstractMethod,
		
		
		/**
		 * Method which must be implemented in subclasses so that the DataBoundView can unbind the {@link data.DataComponent}
		 * which is currently bound.
		 * 
		 * @protected
		 * @abstract
		 * @method unbindDataComponent
		 */
		unbindDataComponent : Class.abstractMethod,
		
		
		// -------------------------------------
		
		
		/**
		 * Handles the bound {@link data.DataComponent} starting to load, by displaying the "loading" mask over the DataBoundView
		 * if the {@link #maskOnLoad} config is true.
		 * 
		 * @protected
		 */
		onLoadBegin : function() {
			if( this.maskOnLoad ) {
				this.mask();
				this.applyLoadingHeight();
			}
		},
		
		
		/**
		 * Handles the bound {@link data.DataComponent} completing its load, by removing the "loading" mask from the DataBoundView,
		 * which was shown by {@link #onLoadBegin} if the {@link #maskOnLoad} config was true.
		 * 
		 * Note: The view will be refreshed automatically due to the changes on the underlying {@link data.DataComponent}, and 
		 * doesn't need to be refreshed from this method.
		 * 
		 * @protected
		 */
		onLoadComplete : function() {
			if( this.maskOnLoad ) {
				this.unMask();
				this.removeLoadingHeight();
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Applies the {@link #loadingHeight} to the DataBoundView's {@link #$el element}, if the current height of the
		 * DataBoundView is less than the configured {@link #loadingHeight}. It also only applies the {@link #loadingHeight}
		 * if the {@link #maskOnLoad} config is `true`.
		 * 
		 * This is called when the bound {@link data.DataComponent} is in its loading state.
		 * 
		 * @protected
		 */
		applyLoadingHeight : function() {
			if( this.rendered ) {
				var loadingHeight = this.loadingHeight,
				    $el = this.$el;
				
				if( loadingHeight > this.getHeight() ) {
					this.hasLoadingHeight = true;
					$el.css( 'min-height', loadingHeight + 'px' );
				}
			}
		},
		
		
		/**
		 * Removes the {@link #loadingHeight} from the DataBoundView's {@link #$el element}, restoring any {@link #minHeight} that
		 * the DataBoundView has configured. This is only done if the {@link #loadingHeight} was applied in {@link #applyLoadingHeight}.
		 * 
		 * This is called when the {@link #collection} has finished loading.
		 * 
		 * @protected
		 */
		removeLoadingHeight : function() {
			if( this.hasLoadingHeight ) {
				var minHeight = ( this.minHeight ) ? this.minHeight + 'px' : '';
				this.$el.css( 'min-height', minHeight );  // re-apply any configured `minHeight` to the component's element
				
				this.hasLoadingHeight = false;
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			this.unbindDataComponent();  // unbind any bound DataComponent
			
			this._super( arguments );
		}
		
	} );
	
	return DataBoundView;
	
} );
		