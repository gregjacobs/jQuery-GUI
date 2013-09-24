Ext.data.JsonP.jqGui_util_ModelBindable({"tagname":"class","name":"jqGui.util.ModelBindable","extends":null,"mixins":[],"alternateClassNames":[],"aliases":{},"singleton":false,"requires":[],"uses":[],"enum":null,"override":null,"inheritable":null,"inheritdoc":null,"meta":{},"private":null,"id":"class-jqGui.util.ModelBindable","members":{"cfg":[{"name":"modelProp","tagname":"cfg","owner":"jqGui.util.ModelBindable","meta":{"protected":true},"id":"cfg-modelProp"}],"property":[{"name":"firstModelBindComplete","tagname":"property","owner":"jqGui.util.ModelBindable","meta":{"private":true},"id":"property-firstModelBindComplete"},{"name":"modelListeners","tagname":"property","owner":"jqGui.util.ModelBindable","meta":{"private":true},"id":"property-modelListeners"}],"method":[{"name":"bindModel","tagname":"method","owner":"jqGui.util.ModelBindable","meta":{},"id":"method-bindModel"},{"name":"bindModelListeners","tagname":"method","owner":"jqGui.util.ModelBindable","meta":{"private":true},"id":"method-bindModelListeners"},{"name":"getModel","tagname":"method","owner":"jqGui.util.ModelBindable","meta":{},"id":"method-getModel"},{"name":"getModelListeners","tagname":"method","owner":"jqGui.util.ModelBindable","meta":{"protected":true},"id":"method-getModelListeners"},{"name":"onModelBind","tagname":"method","owner":"jqGui.util.ModelBindable","meta":{"protected":true,"template":true},"id":"method-onModelBind"},{"name":"unbindModel","tagname":"method","owner":"jqGui.util.ModelBindable","meta":{},"id":"method-unbindModel"},{"name":"unbindModelListeners","tagname":"method","owner":"jqGui.util.ModelBindable","meta":{"private":true},"id":"method-unbindModelListeners"}],"event":[],"css_var":[],"css_mixin":[]},"linenr":8,"files":[{"filename":"ModelBindable.js","href":"ModelBindable.html#jqGui-util-ModelBindable"}],"html_meta":{},"statics":{"cfg":[],"property":[],"method":[],"event":[],"css_var":[],"css_mixin":[]},"component":false,"superclasses":[],"subclasses":[],"mixedInto":["jqGui.view.Model"],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Mixed into</h4><div class='dependency'><a href='#!/api/jqGui.view.Model' rel='jqGui.view.Model' class='docClass'>jqGui.view.Model</a></div><h4>Files</h4><div class='dependency'><a href='source/ModelBindable.html#jqGui-util-ModelBindable' target='_blank'>ModelBindable.js</a></div></pre><div class='doc-contents'><p>This class is intended to be used as a mixin. It allows any class that it is mixed into (the \"target\" class in these docs) to have\na <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a> bound to it by providing the common functionality to allow a model's events to be listened to and handled.\nThese same event listeners are also removed when the model is unbound, and the class provides the functionality to make sure that\nthe same model isn't bound over itself.</p>\n\n<p>This mixin provides the basic method to <a href=\"#!/api/jqGui.util.ModelBindable-method-bindModel\" rel=\"jqGui.util.ModelBindable-method-bindModel\" class=\"docClass\">bind a model</a>, which automatically unbinds any previously-bound\n<a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">Model</a> in the process. Classes using this mixin should implement the <a href=\"#!/api/jqGui.util.ModelBindable-method-getModelListeners\" rel=\"jqGui.util.ModelBindable-method-getModelListeners\" class=\"docClass\">getModelListeners</a> method,\nto specify which listeners should automatically be attached when a model is bound, and unattached when the model is unbound.</p>\n\n<p>The target class may also implement the <a href=\"#!/api/jqGui.util.ModelBindable-method-onModelBind\" rel=\"jqGui.util.ModelBindable-method-onModelBind\" class=\"docClass\">onModelBind</a> method, to detect and handle when a new <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a> has\nbeen bound, and/or when the currently-bound model has been unbound.</p>\n\n<p>Here is an example of mixing this class into a <a href=\"#!/api/jqGui.Component\" rel=\"jqGui.Component\" class=\"docClass\">Component</a>, to make the Component data-bound to a Model:</p>\n\n<pre><code>define( [\n    'jqGui/Component',\n    'jqGui/util/ModelBindable'\n], function( Component, ModelBindable ) {\n\n    var MyBindableComponent = Component.extend( {\n        mixins : [ ModelBindable ],\n\n\n        initComponent : function() {\n            this._super( arguments );\n\n            // Call ModelBindable's constructor, in the scope of this object.\n            // Even though there is no implementation in the ModelBindable constructor \n            // at this time, it is a good idea in case an implementation is added in the future.\n            ModelBindable.call( this );\n        }\n\n        // ...\n\n        // Specifies the listeners that will be added to the model\n        getModelListeners : function( model ) {\n            return {\n                'loadbegin' : this.onLoadBegin,\n                'load'      : this.onLoad,\n                'change'    : this.onChange,\n                scope       : this\n            };\n        },\n\n\n        onLoadBegin : function() {\n            // handle the model's `loadbegin` event here\n        },\n\n        onLoad : function() {\n            // handle the model's `load` event here\n        },\n\n        onChange : function() {\n            // handle the model's `change` event here\n        },\n\n\n        // ...\n\n\n        onDestroy : function() {\n            // Don't forget to unbind any currently-bound model when the Component \n            // is destroyed!\n            this.unbindModel();\n\n            this._super( arguments );\n        }\n\n    } );\n\n    return MyBindableComponent;\n\n} );\n</code></pre>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-modelProp' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-cfg-modelProp' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-cfg-modelProp' class='name expandable'>modelProp</a><span> : String</span><strong class='protected signature' >protected</strong></div><div class='description'><div class='short'>The name of the property which stores the data.Model that is bound to this object\n(i.e. ...</div><div class='long'><p>The name of the property which stores the <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a> that is bound to this object\n(i.e. the object that this class is mixed into).</p>\n\n<p>This property can be specified by the mixed-into class, to change the property name that it stores\nthe model under.</p>\n<p>Defaults to: <code>'model'</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-firstModelBindComplete' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-property-firstModelBindComplete' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-property-firstModelBindComplete' class='name not-expandable'>firstModelBindComplete</a><span> : Boolean</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'><p>Property which is set to true after an initial model bind has been made.</p>\n</div><div class='long'><p>Property which is set to true after an initial model bind has been made.</p>\n</div></div></div><div id='property-modelListeners' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-property-modelListeners' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-property-modelListeners' class='name expandable'>modelListeners</a><span> : Object</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'>The listeners that were bound to the currently stored data.Model, in the bindModelListeners\nmethod. ...</div><div class='long'><p>The listeners that were bound to the currently stored <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a>, in the <a href=\"#!/api/jqGui.util.ModelBindable-method-bindModelListeners\" rel=\"jqGui.util.ModelBindable-method-bindModelListeners\" class=\"docClass\">bindModelListeners</a>\nmethod. If there has been no Model bound to this view yet, this will be <code>undefined</code>.</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-bindModel' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-method-bindModel' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-method-bindModel' class='name expandable'>bindModel</a>( <span class='pre'>model</span> )</div><div class='description'><div class='short'>Binds a data.Model to this object. ...</div><div class='long'><p>Binds a <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a> to this object. The model will be set to the property specified by\nthe <a href=\"#!/api/jqGui.util.ModelBindable-cfg-modelProp\" rel=\"jqGui.util.ModelBindable-cfg-modelProp\" class=\"docClass\">modelProp</a>. Any previous model will be unbound.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>model</span> : <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a><div class='sub-desc'><p>The Model to bind. To unbind the currently-bound model,\n  either pass <code>null</code>, or call <a href=\"#!/api/jqGui.util.ModelBindable-method-unbindModel\" rel=\"jqGui.util.ModelBindable-method-unbindModel\" class=\"docClass\">unbindModel</a> instead.</p>\n</div></li></ul></div></div></div><div id='method-bindModelListeners' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-method-bindModelListeners' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-method-bindModelListeners' class='name expandable'>bindModelListeners</a>( <span class='pre'></span> )<strong class='private signature' >private</strong></div><div class='description'><div class='short'>Binds listeners to the current model, so that the view can refresh itself upon changes. ...</div><div class='long'><p>Binds listeners to the current model, so that the view can refresh itself upon changes. The listeners\nthat are set up are defined by the <a href=\"#!/api/jqGui.util.ModelBindable-method-getModelListeners\" rel=\"jqGui.util.ModelBindable-method-getModelListeners\" class=\"docClass\">getModelListeners</a> method, which should be overridden by\nthe target class to listen for the events that are needed.</p>\n</div></div></div><div id='method-getModel' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-method-getModel' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-method-getModel' class='name expandable'>getModel</a>( <span class='pre'></span> ) : <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a></div><div class='description'><div class='short'>Retrieves the current Model which is bound to this object. ...</div><div class='long'><p>Retrieves the current <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">Model</a> which is bound to this object. Returns <code>null</code> if there\nis no currently-bound Model.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a></span><div class='sub-desc'><p>The currently-bound model, or <code>null</code> if there is none.</p>\n</div></li></ul></div></div></div><div id='method-getModelListeners' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-method-getModelListeners' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-method-getModelListeners' class='name expandable'>getModelListeners</a>( <span class='pre'>model</span> ) : Object<strong class='protected signature' >protected</strong></div><div class='description'><div class='short'>Retrieves an Object (map) of the listeners that should be set up on the model when one is bound to this object. ...</div><div class='long'><p>Retrieves an Object (map) of the listeners that should be set up on the model when one is bound to this object.\nThis method should be overridden by the target class to add the events that should be listened for. Example:</p>\n\n<pre><code>require( [\n    'Class',\n    'jqGui/util/ModelBindable'\n], function( Class, ModelBindable ) {\n\n    var MyBindableClass = <a href=\"#!/api/Class-method-create\" rel=\"Class-method-create\" class=\"docClass\">Class.create</a>( {\n        mixins : [ ModelBindable ],\n\n        // ...\n\n        getModelListeners : function( model ) {\n            return {\n                'loadbegin' : this.onLoadBegin,\n                'load'      : this.onLoad,\n                'change'    : this.onChange,\n                scope       : this\n            };\n        },\n\n\n        onLoadBegin : function() {\n            // ...\n        },\n\n        onLoad : function() {\n            // ...\n        },\n\n        onChange : function() {\n            // ...\n        }\n\n    } );\n\n} );\n</code></pre>\n\n<p>Note that the handler functions should always be references to functions defined in the class, not anonymous\nfunctions. The same function references are needed to unbind the model later, and providing an anonymous\nfunction as a handler for an event will not allow the event listener to be removed.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>model</span> : <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a><div class='sub-desc'><p>The Model being bound. Note that listeners should not be attached here,\n  but the Model instance is provided in case it needs to be queried for any reason (such as for a particular\n  Model subclass type).</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>An <a href=\"#!/api/Observable-method-addListener\" rel=\"Observable-method-addListener\" class=\"docClass\">addListener</a> config object for the listeners to be added.</p>\n</div></li></ul></div></div></div><div id='method-onModelBind' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-method-onModelBind' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-method-onModelBind' class='name expandable'>onModelBind</a>( <span class='pre'>model, oldModel</span> )<strong class='protected signature' >protected</strong><strong class='template signature' >template</strong></div><div class='description'><div class='short'>Hook method which is called when a new data.Model has been bound to this object using\nbindModel. ...</div><div class='long'><p>Hook method which is called when a new <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a> has been bound to this object using\n<a href=\"#!/api/jqGui.util.ModelBindable-method-bindModel\" rel=\"jqGui.util.ModelBindable-method-bindModel\" class=\"docClass\">bindModel</a>. Also called when a <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a> is unbound from this object, either\nby <code>null</code> being passed to <a href=\"#!/api/jqGui.util.ModelBindable-method-bindModel\" rel=\"jqGui.util.ModelBindable-method-bindModel\" class=\"docClass\">bindModel</a>, or <a href=\"#!/api/jqGui.util.ModelBindable-method-unbindModel\" rel=\"jqGui.util.ModelBindable-method-unbindModel\" class=\"docClass\">unbindModel</a> being called.</p>\n      <div class='signature-box template'>\n      <p>This is a <a href=\"#!/guide/components\">template method</a>.\n         a hook into the functionality of this class.\n         Feel free to override it in child classes.</p>\n      </div>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>model</span> : <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a><div class='sub-desc'><p>The newly bound model. Will be <code>null</code> if the previous model was\n  simply unbound (i.e. <code>null</code> was passed to <a href=\"#!/api/jqGui.util.ModelBindable-method-bindModel\" rel=\"jqGui.util.ModelBindable-method-bindModel\" class=\"docClass\">bindModel</a>, or <a href=\"#!/api/jqGui.util.ModelBindable-method-unbindModel\" rel=\"jqGui.util.ModelBindable-method-unbindModel\" class=\"docClass\">unbindModel</a> was called).</p>\n</div></li><li><span class='pre'>oldModel</span> : <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a><div class='sub-desc'><p>The model that was just unbound. Will be <code>null</code> if there was no\n  previously-bound model.</p>\n</div></li></ul></div></div></div><div id='method-unbindModel' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-method-unbindModel' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-method-unbindModel' class='name expandable'>unbindModel</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Unbinds the currently-bound data.Model, if there is one. ...</div><div class='long'><p>Unbinds the currently-bound <a href=\"#!/api/data.Model\" rel=\"data.Model\" class=\"docClass\">data.Model</a>, if there is one. Removes its event listeners (which are\nspecified by the <a href=\"#!/api/jqGui.util.ModelBindable-method-getModelListeners\" rel=\"jqGui.util.ModelBindable-method-getModelListeners\" class=\"docClass\">getModelListeners</a> method), and then sets the reference to the model (governed\nby the <a href=\"#!/api/jqGui.util.ModelBindable-cfg-modelProp\" rel=\"jqGui.util.ModelBindable-cfg-modelProp\" class=\"docClass\">modelProp</a> config) to <code>null</code>.</p>\n</div></div></div><div id='method-unbindModelListeners' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqGui.util.ModelBindable'>jqGui.util.ModelBindable</span><br/><a href='source/ModelBindable.html#jqGui-util-ModelBindable-method-unbindModelListeners' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqGui.util.ModelBindable-method-unbindModelListeners' class='name expandable'>unbindModelListeners</a>( <span class='pre'></span> )<strong class='private signature' >private</strong></div><div class='description'><div class='short'>Unbinds the currently-bound model's listeners, which were set up in bindModelListeners. ...</div><div class='long'><p>Unbinds the currently-bound model's listeners, which were set up in <a href=\"#!/api/jqGui.util.ModelBindable-method-bindModelListeners\" rel=\"jqGui.util.ModelBindable-method-bindModelListeners\" class=\"docClass\">bindModelListeners</a>.</p>\n</div></div></div></div></div></div></div>"});