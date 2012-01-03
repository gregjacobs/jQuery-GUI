/*global window, Kevlar */
/*jslint forin: true */
(function(){

var KevlarUTIL = Kevlar.util,
    TOARRAY = Kevlar.toArray,
    EACH = Kevlar.each,
    ISOBJECT = Kevlar.isObject,
    TRUE = true,
    FALSE = false;
	
/**
 * @class Kevlar.util.Observable
 * Base class that provides a common interface for publishing events. Subclasses are expected to
 * to have a property "events" with all the events defined, and, optionally, a property "listeners"
 * with configured listeners defined.<br>
 * For example:
 * <pre><code>
Employee = Kevlar.extend(Kevlar.util.Observable, {
    constructor: function(config){
        this.name = config.name;
        this.addEvents({
            "fired" : true,
            "quit" : true
        });

        // Copy configured listeners into *this* object so that the base class&#39;s
        // constructor will add them.
        this.listeners = config.listeners;

        // Call our superclass constructor to complete construction process.
        Employee.superclass.constructor.call(config)
    }
});
</code></pre>
 * This could then be used like this:<pre><code>
var newEmployee = new Employee({
    name: employeeName,
    listeners: {
        quit: function() {
            // By default, "this" will be the object that fired the event.
            alert(this.name + " has quit!");
        }
    }
});
</code></pre>
 */
KevlarUTIL.Observable = function(){
    /**
     * @cfg {Object} listeners (optional) <p>A config object containing one or more event handlers to be added to this
     * object during initialization.  This should be a valid listeners config object as specified in the
     * {@link #addListener} example for attaching multiple handlers at once.</p>
     * To access DOM events directly from a Component's HTMLElement, listeners must be added to the <i>{@link ui.Component#getEl Element}</i> 
     * after the Component has been rendered. A plugin can simplify this step:<pre><code>
// Plugin is configured with a listeners config object.
// The Component is appended to the argument list of all handler functions.
DomObserver = Kevlar.extend(Object, {
    constructor: function(config) {
        this.listeners = config.listeners ? config.listeners : config;
    },

    // Component passes itself into plugin&#39;s init method
    initPlugin: function(c) {
        var p, l = this.listeners;
        for (p in l) {
            if (Kevlar.isFunction(l[p])) {
                l[p] = this.createHandler(l[p], c);
            } else {
                l[p].fn = this.createHandler(l[p].fn, c);
            }
        }

        // Add the listeners to the Element immediately following the render call
        c.render = c.render.{@link Function#createSequence createSequence}(function() {
            var e = c.getEl();
            if (e) {
                e.on(l);
            }
        });
    },

    createHandler: function(fn, c) {
        return function(e) {
            fn.call(this, e, c);
        };
    }
});

var combo = new Kevlar.form.ComboBox({

    // Collapse combo when its element is clicked on
    plugins: [ new DomObserver({
        click: function(evt, comp) {
            comp.collapse();
        }
    })],
    store: myStore,
    typeAhead: true,
    mode: 'local',
    triggerAction: 'all'
});
     * </code></pre></p>
     */
    var me = this, e = me.events;
    me.events = e || {};
    if(me.listeners){
        me.on(me.listeners);
        delete me.listeners;
    }
};

KevlarUTIL.Observable.prototype = {
    // private
    filterOptRe : /^(?:scope|delay|buffer|single)$/,

    /**
     * <p>Fires the specified event with the passed parameters (minus the event name).</p>
     * <p>An event may be set to bubble up an Observable parent hierarchy (See {@link ui.Component#getBubbleTarget})
     * by calling {@link #enableBubble}.</p>
     * @param {String} eventName The name of the event to fire.
     * @param {Object...} args Variable number of parameters are passed to handlers.
     * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
     */
    fireEvent : function() {
        var args = TOARRAY(arguments),
            eventName = args[0].toLowerCase(),
            me = this,
            ret = TRUE,
            ce = me.events[eventName],
            q,
            parentComponent;
			
        if (me.eventsSuspended === TRUE) {
			q = me.eventQueue;
            if (q) {
                q.push(args);
            }
			
        } else if( ISOBJECT(ce) && ce.bubble ) {
            if( ce.fire.apply( ce, args.slice( 1 ) ) === false ) {
                return FALSE;
            }
			
			// Firing of the event on this Observable didn't return false, check the bubbleFn for permission (if the event has one).
			// If the bubbleFn returns false, we return here and don't bubble
			var bubbleFn = ce.bubbleFn,
			    bubbleFnScope = ce.bubbleFnScope;
				
			if( bubbleFn && bubbleFn.call( bubbleFnScope, this ) === false ) {
				return false;
			}
			
			
			// fire the event on the "parent" Observable (i.e. the "bubble target" observable)
            parentComponent = me.getBubbleTarget && me.getBubbleTarget();
            if( parentComponent && parentComponent.enableBubble ) {  // test for if parentComponent is an Observable?
				// If the parentComponent doesn't have the bubbled event, 
				// or the bubbled event on the parentComponent is not yet an Event object, 
				// or the bubbled event on the parentComponent doesn't have the bubble flag set to true,
				// or the bubbled event on the parentComponent doesn't have a bubbleFn, but this one does
				// then run enableBubble for the event on the parentComponent
                if( !parentComponent.events[ eventName ] || !Kevlar.isObject( parentComponent.events[ eventName ] ) || !parentComponent.events[ eventName ].bubble || ( !parentComponent.events[ eventName ].bubbleFn && bubbleFn ) ) {
                    parentComponent.enableBubble( {
						eventName: eventName,
						bubbleFn: bubbleFn,
						scope: bubbleFnScope
					} );
                }
                return parentComponent.fireEvent.apply( parentComponent, args );
            }
			
        } else {
            if( ISOBJECT( ce ) ) {
                args.shift();
                ret = ce.fire.apply( ce, args );
            }
        }
		
        return ret;
    },

    /**
     * Appends an event handler to this object.
     * @param {String}   eventName The name of the event to listen for.
     * @param {Function} handler The method the event invokes.
     * @param {Object}   scope (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options (optional) An object containing handler configuration.
     * properties. This may contain any of the following properties:<ul>
     * <li><b>scope</b> : Object<div class="sub-desc">The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b></div></li>
     * <li><b>delay</b> : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after the event fires.</div></li>
     * <li><b>single</b> : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
     * <li><b>buffer</b> : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Kevlar.util.DelayedTask} delayed
     * by the specified number of milliseconds. If the event fires again within that time, the original
     * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
     * <li><b>target</b> : Observable<div class="sub-desc">Only call the handler if the event was fired on the target Observable, <i>not</i>
     * if the event was bubbled up from a child Observable.</div></li>
     * </ul><br>
     * <p>
     * <b>Combining Options</b><br>
     * Using the options argument, it is possible to combine different types of listeners:<br>
     * <br>
     * A delayed, one-time listener.
     * <pre><code>
myDataView.on('click', this.onClick, this, {
single: true,
delay: 100
});</code></pre>
     * <p>
     * <b>Attaching multiple handlers in 1 call</b><br>
     * The method also allows for a single argument to be passed which is a config object containing properties
     * which specify multiple handlers.
     * <p>
     * <pre><code>
myGridPanel.on({
'click' : {
    fn: this.onClick,
    scope: this,
    delay: 100
},
'mouseover' : {
    fn: this.onMouseOver,
    scope: this
},
'mouseout' : {
    fn: this.onMouseOut,
    scope: this
}
});</code></pre>
 * <p>
 * Or a shorthand syntax:<br>
 * <pre><code>
myGridPanel.on({
'click' : this.onClick,
'mouseover' : this.onMouseOver,
'mouseout' : this.onMouseOut,
 scope: this
});</code></pre>
     */
    addListener : function(eventName, fn, scope, o){
        var me = this,
            e,
            oe,
            isF,
            ce;
			
        if (ISOBJECT(eventName)) {
            o = eventName;
            for (e in o){
                oe = o[e];
                if (!me.filterOptRe.test(e)) {
                    me.addListener(e, oe.fn || oe, oe.scope || o.scope, oe.fn ? oe : o);
                }
            }
        } else {
            eventName = eventName.toLowerCase();
            ce = me.events[eventName] || TRUE;
            if (Kevlar.isBoolean(ce)) {
                me.events[eventName] = ce = new KevlarUTIL.Event(me, eventName);
            }
            ce.addListener(fn, scope, ISOBJECT(o) ? o : {});
        }
    },

    /**
     * Removes an event handler.
     * @param {String}   eventName The type of event the handler was associated with.
     * @param {Function} handler   The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope     (optional) The scope originally specified for the handler.
     */
    removeListener : function( eventName, fn, scope ) {
        var ce = this.events[ eventName.toLowerCase() ];
        if ( ISOBJECT( ce ) ) {
            ce.removeListener( fn, scope );
        }
    },
	

    /**
     * Removes all listeners for this object
     */
    purgeListeners : function() {
        var events = this.events,
            evt,
            key;
		
        for( key in events ) {
            evt = events[ key ];
            if( ISOBJECT( evt ) ) {
                evt.clearListeners();
            }
        }
    },
	

    /**
     * Adds the specified events to the list of events which this Observable may fire.
     * @param {Object/String} o Either an object with event names as properties with a value of <code>true</code>
     * or the first event name string if multiple event names are being passed as separate parameters.
     * @param {String} Optional. Event name if multiple event names are being passed as separate parameters.
     * Usage:<pre><code>
this.addEvents('storeloaded', 'storecleared');
</code></pre>
     */
    addEvents : function(o){
        var me = this;
        me.events = me.events || {};
        if (Kevlar.isString(o)) {
            var a = arguments,
                i = a.length;
            while(i--) {
                me.events[a[i]] = me.events[a[i]] || TRUE;
            }
        } else {
            Kevlar.applyIf(me.events, o);
        }
    },

    /**
     * Checks to see if this object has any listeners for a specified event
     * @param {String} eventName The name of the event to check for
     * @return {Boolean} True if the event is being listened for, else false
     */
    hasListener : function(eventName){
        var e = this.events[eventName];
        return ISOBJECT(e) && e.listeners.length > 0;
    },


    /**
     * Suspend the firing of all events. (see {@link #resumeEvents})
     * @param {Boolean} queueSuspended Pass as true to queue up suspended events to be fired
     * after the {@link #resumeEvents} call instead of discarding all suspended events;
     */
    suspendEvents : function(queueSuspended){
        this.eventsSuspended = TRUE;
        if(queueSuspended && !this.eventQueue){
            this.eventQueue = [];
        }
    },

    /**
     * Resume firing events. (see {@link #suspendEvents})
     * If events were suspended using the `<b>queueSuspended</b>` parameter, then all
     * events fired during event suspension will be sent to any listeners now.
     */
    resumeEvents : function(){
        var me = this,
            queued = me.eventQueue || [];
        me.eventsSuspended = FALSE;
        delete me.eventQueue;
        EACH(queued, function(e) {
            me.fireEvent.apply(me, e);
        });
    },
	
	
	/**
     * Relays selected events from the specified Observable as if the events were fired by `<b>this</b>`.
     * @param {Object} o The Observable whose events this object is to relay.
     * @param {Array} events Array of event names to relay.
     */
    relayEvents : function(o, events){
        var me = this;
        function createHandler(eventName){
            return function(){
                return me.fireEvent.apply(me, [eventName].concat(Array.prototype.slice.call(arguments, 0)));
            };
        }
        for(var i = 0, len = events.length; i < len; i++){
            var eventName = events[i];
            me.events[eventName] = me.events[eventName] || true;
            o.on(eventName, createHandler(eventName), me);
        }
    },
	
	
	/**
     * <p>Enables events fired by this Observable to bubble up an owner hierarchy by calling {@link #getBubbleTarget} to determine
     * the object's owner. The default implementation of {@link #getBubbleTarget} in this class is just to return null, which specifies no owner.
     * This method should be overridden by subclasses to provide this if applicable.</p>
     * <p>This is commonly used by {@link ui.Component ui.Components} to bubble events to owner {@link ui.Container iu.Containers}. 
     * See {@link ui.Component#getBubbleTarget}. The default implementation in {@link ui.Component} returns the Component's immediate owner, 
     * but if a known target is required, this can be overridden to access that target more quickly.</p>
     * <p>Example:</p><pre><code>
MyClass = Kevlar.extend( Kevlar.util.Observable, {

	constructor : function() {
		...
		
		this.addEvents( 'myBubbledEvent' );
		this.enableBubble( 'myBubbledEvent' );  // enable the bubble
	},


	getBubbleTarget : function() {
		// return a reference to some component that is the target for bubbling. this component may be listened to directly for the 'myBubbledEvent' event
	}

} );
</code></pre>
	 * @param {Array/String.../Object...} events The event name to bubble, Array of event names, or one argument per event name. This may also
	 *   be an array of objects, where the objects have the following properties:<div class="mdetail-params"><ul>
	 *   <li><b>eventName</b> : String<div class="sub-desc">The name of the event to enable bubbling for.</div></li>
	 *   <li>
	 *     <b>bubbleFn</b> : Function
	 *     <div class="sub-desc">
	 *       A function that determines, at every level in the hierarchy, if bubbling should continue. If this function returns false
	 *       at any point, the bubbling of the event is stopped. The function is given one argument: the Observable that the event
	 *       has just been fired for.  This function can be used to test for some condition, and then stop bubbling based on that condition.
	 *     </div>
	 *   </li>
	 *   <li>
	 *     <b>scope</b> : Object
	 *     <div class="sub-desc">The scope to run the bubbleFn in. Defaults to the Observable that the event bubbling was enabled on.</div>
	 *   </li>
	 * </ul></div>
	 */
	enableBubble: function( events ) {
		var me = this;
		if( !Kevlar.isEmpty( events ) ) {
			events = Kevlar.isArray( events ) ? events : Kevlar.toArray( arguments );
			
			Kevlar.each( events, function( eventArg ) {
				var eventName, bubbleFn, scope;  // the last 2 vars are for if an argument was specified as an object, and these were included
				
				// an object with the key 'eventName' is accepted for the enableBubble method
				if( typeof eventArg === 'object' ) {
					eventName = eventArg.eventName;
					bubbleFn = eventArg.bubbleFn;
					scope = eventArg.scope;
				} else {
					eventName = eventArg;  // string event argument
				}
				
				eventName = eventName.toLowerCase();
				var ce = me.events[ eventName ] || true;
				if( Kevlar.isBoolean( ce ) ) {
					ce = new KevlarUTIL.Event( me, eventName );
					me.events[ eventName ] = ce;
				}
				ce.bubble = true;
				
				// Add the bubbleFn, if provided by an object argument to enableBubble
				if( typeof bubbleFn === 'function' ) {
					ce.bubbleFn = bubbleFn;
					ce.bubbleFnScope = scope || me;  // default to the Observable's scope
				}
			} );
		}
	},
	
	
	/**
	 * Specifies the Observable that is the target of the event's bubbling, if bubbling is enabled for
	 * events by the {@link #enableBubble} method. This default implementation returns null, and should
	 * be overridden by subclasses to specify their bubbling target.
	 * 
	 * @protected
	 * @method getBubbleTarget
	 * @return {Kevlar.util.Observable} The Observable that is the target for event bubbling, or null if none.
	 */
	getBubbleTarget : function() {
		return null;
	}
	
};

var OBSERVABLE = KevlarUTIL.Observable.prototype;
/**
 * Appends an event handler to this object (shorthand for {@link #addListener}.)
 * @param {String}   eventName     The type of event to listen for
 * @param {Function} handler       The method the event invokes
 * @param {Object}   scope         (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
 * <b>If omitted, defaults to the object which fired the event.</b>
 * @param {Object}   options       (optional) An object containing handler configuration.
 * @method
 */
OBSERVABLE.on = OBSERVABLE.addListener;
/**
 * Removes an event handler (shorthand for {@link #removeListener}.)
 * @param {String}   eventName     The type of event the handler was associated with.
 * @param {Function} handler       The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
 * @param {Object}   scope         (optional) The scope originally specified for the handler.
 * @method
 */
OBSERVABLE.un = OBSERVABLE.removeListener;

/**
 * Removes <b>all</b> added captures from the Observable.
 * @param {Kevlar.util.Observable} o The Observable to release
 * @static
 */
KevlarUTIL.Observable.releaseCapture = function(o){
    o.fireEvent = OBSERVABLE.fireEvent;
};

function createTargeted(h, o, scope){
    return function(){
        if(o.target == arguments[0]){
            h.apply(scope, TOARRAY(arguments));
        }
    };
}

function createBuffered(h, o, l, scope){
    l.task = new KevlarUTIL.DelayedTask();
    return function(){
        l.task.delay(o.buffer, h, scope, TOARRAY(arguments));
    };
}

function createSingle(h, e, fn, scope){
    return function(){
        e.removeListener(fn, scope);
        return h.apply(scope, arguments);
    };
}

function createDelayed(h, o, l, scope){
    return function(){
        var task = new KevlarUTIL.DelayedTask();
        if(!l.tasks) {
            l.tasks = [];
        }
        l.tasks.push(task);
        task.delay(o.delay || 10, h, scope, TOARRAY(arguments));
    };
}



KevlarUTIL.Event = function(obj, name){
    this.name = name;
    this.obj = obj;
    this.listeners = [];
	
	// this object may also get the properties 'bubble', 'bubbleFn', and 'bubbleFnScope' if Observable's enableBubble() method is run for it
};

KevlarUTIL.Event.prototype = {
    addListener : function(fn, scope, options){
        var me = this,
            l;
        scope = scope || me.obj;
        if(!me.isListening(fn, scope)){
            l = me.createListener(fn, scope, options);
            if(me.firing){ // if we are currently firing this event, don't disturb the listener loop
                me.listeners = me.listeners.slice(0);
            }
            me.listeners.push(l);
        }
    },

    createListener: function(fn, scope, o){
        o = o || {};
		scope = scope || this.obj;
		
        var l = {
            fn: fn,
            scope: scope,
            options: o
        }, h = fn;
        if(o.target){
            h = createTargeted(h, o, scope);
        }
        if(o.delay){
            h = createDelayed(h, o, l, scope);
        }
        if(o.single){
            h = createSingle(h, this, fn, scope);
        }
        if(o.buffer){
            h = createBuffered(h, o, l, scope);
        }
        l.fireFn = h;
        return l;
    },

    findListener : function(fn, scope){
        var list = this.listeners,
            i = list.length,
            l,
            s;
        while(i--) {
            l = list[i];
            if(l) {
                s = l.scope;
                if(l.fn == fn && (s == scope || s == this.obj)){
                    return i;
                }
            }
        }
        return -1;
    },

    isListening : function(fn, scope){
        return this.findListener(fn, scope) != -1;
    },

    removeListener : function(fn, scope){
        var index,
            l,
            k,
            me = this,
            ret = FALSE;
        if((index = me.findListener(fn, scope)) != -1){
            if (me.firing) {
                me.listeners = me.listeners.slice(0);
            }
            l = me.listeners[index];
            if(l.task) {
                l.task.cancel();
                delete l.task;
            }
            k = l.tasks && l.tasks.length;
            if(k) {
                while(k--) {
                    l.tasks[k].cancel();
                }
                delete l.tasks;
            }
            me.listeners.splice(index, 1);
            ret = TRUE;
        }
        return ret;
    },

    // Iterate to stop any buffered/delayed events
    clearListeners : function(){
        var me = this,
            l = me.listeners,
            i = l.length;
        while(i--) {
            me.removeListener(l[i].fn, l[i].scope);
        }
    },

    fire : function() {
        var me = this,
            args = TOARRAY(arguments),
            listeners = me.listeners,
            len = listeners.length,
            i = 0,
            l,
		    handlerReturnedFalse = false;  // added code

        if(len > 0){
            me.firing = TRUE;
            for (; i < len; i++) {
                l = listeners[i];
                if(l && l.fireFn.apply(l.scope || me.obj || window, args) === FALSE) {
					handlerReturnedFalse = true;
                    //return (me.firing = FALSE);  -- old code, prevented other handlers from running if one returned false
                }
            }
        }
        me.firing = FALSE;
        //return TRUE;  -- old code
        return ( handlerReturnedFalse ) ? false : true;  // if any of the event handlers returned false, return false from this method. otherwise, return true
    }
};
})();