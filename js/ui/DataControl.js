/**
 * @class ui.DataControl
 * @extends Kevlar.util.Observable
 * 
 * Generalized class that is intended to be used as a mixin class (pretty much just as an interface) with a {@link ui.Component},
 * that is to be part of the general data-collection routine defined by {@link ui.Container#getData} and {@link ui.Container#setData} methods.
 * 
 * This class itself does not provide any mechanism for data storage, but instead defines the {@link #getData} and {@link #setData} interface
 * that must be implemented by classes that it is mixed with. It also defines the {@link #datachange} event, for generalized handling of changes to
 * a DataControl's data. Subclasses are expected to call the {@link #onDataChange} method when they want this event to be fired.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.DataControl = Kevlar.extend( Kevlar.util.Observable, {
	
	/**
	 * @cfg {String} key
	 * The key to store the data (value) for this DataControl under. When data is collected from Containers using the DataControl,
	 * the key is the property name in the resulting hash.  If the DataControl does not have a key, its data will not be collected. 
	 * See {@link ui.Container#getData}.
	 */
	key: null,
	
	
	constructor : function() {
		// Call observable constructor
		ui.DataControl.superclass.constructor.call( this );
		
		this.addEvents(
			/**
			 * @event datachange
			 * @bubbles
			 * Fires when the data for the DataControl has changed. For performance reasons,
			 * it is up to the subscriber to retrieve the data.
			 * @param {ui.DataControl} dataObject This DataControl instance (the component in which data has changed).
			 */
			/*
			 * *** Comment for if the datachange is ever changed to bubble again. Uncomment "enableBubble" code below for this feature.
			 * 
			 * Note that even though this event bubbles, it has the special behavior of not bubbling up to another DataControl
			 * that is a parent/ancestor of this DataControl. This is to facilitate the building of more complex DataControls,
			 * by allowing them to be composed of one or more child DataControls. External code should not know anything about 
			 * these "inner" DataControls, as they are part of the "outer" DataControl's implementation. The "outer" DataControl 
			 * knows how to retrieve its data, and listen to the events of its "inner" DataControls, and should therefore fire its own
			 * 'datachange' event when it sees fit.  Therefore, the "outer" DataControl should be the only Component that should be 
			 * listened to for its 'datachange' event from external code, not the "inner" ones.
			 * 
			 */
			'datachange'
		);
		
		// Enable bubbling for the datachange event
		// Commented out for now, as this was taken out for performance reasons. However, the performance gain expected by taking
		// this out was not that much, and this feature may be re-enabled at a later date. However, it does involve a lot of function
		// calls as this event bubbles up a big hierarchy, esp with needing to call Kevlar.isInstanceOf() at each parent Container.
		/*this.enableBubble( {
			eventName : 'datachange',
			
			// provide a bubbleFn, which determines if the event should continue to bubble at each level in a hierarchy it hits
			bubbleFn  : function( observableObj ) {
				var bubbleTarget = observableObj.getBubbleTarget();
				
				// If the next component to bubble to in the hierarchy is a ui.DataControl instance, stop bubbling now.
				// See the documentation of the 'datachange' event (above) for details.
				if( Kevlar.isInstanceOf( bubbleTarget, ui.DataControl ) ) {
					return false;
				}
			}
		} );*/
	},
	
	
	/**
	 * Retrieves the key for this field.  Used with data storage.
	 * 
	 * @method getKey
	 * @return {String} This DataControl's key. Returns null if no {@link #key} config was specified.
	 */
	getKey : function() {
		return this.key;
	},
	
	
	/**
	 * Gets the data held by this DataControl. Subclasses are expected to implement this method.
	 *
	 * @abstract
	 * @method getData
	 * @return {Mixed}
	 */
	getData : function() {
		throw new Error( "ui.DataControl::getData() must be implemented in subclass." );
	},
	
	
	/**
	 * Sets the data to be held by this DataControl. Subclasses are expected to implement this method.
	 * 
	 * @abstract
	 * @method setData
	 * @param {Mixed} data The data to set.
	 */
	setData : function( data ) {
		throw new Error( "ui.DataControl::setData() must be implemented in subclass." );
	},
	
	
	/**
	 * Method that is to be run when data has changed in the component. Subclasses are expected
	 * to call this method when data has been updated.
	 * 
	 * @protected
	 * @method onDataChange
	 */
	onDataChange : function() {
		this.fireEvent( 'datachange', this );
	}
	
} );