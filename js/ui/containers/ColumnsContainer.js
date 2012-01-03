/**
 * @class ui.containers.ColumnsContainer
 * @extends ui.Container
 *  
 * A convenience Container class that is automatically created with a {@link ui.layouts.ColumnsLayout}, to 
 * render child containers in columns.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.containers.ColumnsContainer = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Number/String} columnWidth
	 * A number of pixels, or any valid CSS width for the column.  This config is to be applied to <b>*child items*</b> of the ColumnsContainer,
	 * and not the ColumnsContainer itself. Defaults to 'auto'.
	 */
	
	/**
	 * @hide
	 * @cfg {String/Object/ui.layouts.AbstractLayout} layout
	 * A {@link ui.layouts.ColumnsLayout} is automatically configured for this subclass.
	 */
	
	// protected
	initComponent : function() {
		this.layout = new ui.layouts.ColumnsLayout();
		
		ui.containers.ColumnsContainer.superclass.initComponent.call( this );
	}

} );


// Register the type so it can be created by the string 'Columns' in the manifest
ui.ComponentManager.registerType( 'Columns', ui.containers.ColumnsContainer );