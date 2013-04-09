Ext.data.JsonP.jqc_layout_Card_SwitchTransition({"tagname":"class","name":"jqc.layout.Card.SwitchTransition","extends":"jqc.layout.Card.AbstractTransition","mixins":[],"alternateClassNames":[],"aliases":{},"singleton":false,"requires":[],"uses":[],"enum":null,"override":null,"inheritable":null,"inheritdoc":null,"meta":{},"private":null,"id":"class-jqc.layout.Card.SwitchTransition","members":{"cfg":[],"property":[],"method":[{"name":"destroy","tagname":"method","owner":"jqc.layout.Card.AbstractTransition","meta":{},"id":"method-destroy"},{"name":"onDestroy","tagname":"method","owner":"jqc.layout.Card.AbstractTransition","meta":{"protected":true,"template":true},"id":"method-onDestroy"},{"name":"setActiveItem","tagname":"method","owner":"jqc.layout.Card.SwitchTransition","meta":{},"id":"method-setActiveItem"}],"event":[],"css_var":[],"css_mixin":[]},"linenr":6,"files":[{"filename":"Card.SwitchTransition.js","href":"Card.SwitchTransition.html#jqc-layout-Card-SwitchTransition"}],"html_meta":{},"statics":{"cfg":[],"property":[],"method":[],"event":[],"css_var":[],"css_mixin":[]},"component":false,"superclasses":["jqc.layout.Card.AbstractTransition"],"subclasses":[],"mixedInto":[],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/jqc.layout.Card.AbstractTransition' rel='jqc.layout.Card.AbstractTransition' class='docClass'>jqc.layout.Card.AbstractTransition</a><div class='subclass '><strong>jqc.layout.Card.SwitchTransition</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/Card.SwitchTransition.html#jqc-layout-Card-SwitchTransition' target='_blank'>Card.SwitchTransition.js</a></div></pre><div class='doc-contents'><p><a href=\"#!/api/jqc.layout.Card\" rel=\"jqc.layout.Card\" class=\"docClass\">jqc.layout.Card</a> transition strategy for switching cards immediately by simply hiding the \"currently active\" card\nand then showing the new card. This is the default <a href=\"#!/api/jqc.layout.Card\" rel=\"jqc.layout.Card\" class=\"docClass\">CardsLayout</a> transition strategy for changing\nthe active card.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-destroy' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/jqc.layout.Card.AbstractTransition' rel='jqc.layout.Card.AbstractTransition' class='defined-in docClass'>jqc.layout.Card.AbstractTransition</a><br/><a href='source/Card.Transition.html#jqc-layout-Card-AbstractTransition-method-destroy' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqc.layout.Card.AbstractTransition-method-destroy' class='name expandable'>destroy</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Destroys the CardsLayout transition strategy. ...</div><div class='long'><p>Destroys the CardsLayout transition strategy. Subclasses should extend the onDestroy method to implement\nany destruction process they specifically need.</p>\n</div></div></div><div id='method-onDestroy' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/jqc.layout.Card.AbstractTransition' rel='jqc.layout.Card.AbstractTransition' class='defined-in docClass'>jqc.layout.Card.AbstractTransition</a><br/><a href='source/Card.Transition.html#jqc-layout-Card-AbstractTransition-method-onDestroy' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqc.layout.Card.AbstractTransition-method-onDestroy' class='name expandable'>onDestroy</a>( <span class='pre'></span> )<strong class='protected signature' >protected</strong><strong class='template signature' >template</strong></div><div class='description'><div class='short'>Template method that subclasses should extend to implement their own destruction process. ...</div><div class='long'><p>Template method that subclasses should extend to implement their own destruction process.</p>\n      <div class='signature-box template'>\n      <p>This is a <a href=\"#!/guide/components\">template method</a>.\n         a hook into the functionality of this class.\n         Feel free to override it in child classes.</p>\n      </div>\n</div></div></div><div id='method-setActiveItem' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='jqc.layout.Card.SwitchTransition'>jqc.layout.Card.SwitchTransition</span><br/><a href='source/Card.SwitchTransition.html#jqc-layout-Card-SwitchTransition-method-setActiveItem' target='_blank' class='view-source'>view source</a></div><a href='#!/api/jqc.layout.Card.SwitchTransition-method-setActiveItem' class='name expandable'>setActiveItem</a>( <span class='pre'>cardsLayout, currentItem, newItem, options</span> )</div><div class='description'><div class='short'>Sets the active item that should be transitioned to. ...</div><div class='long'><p>Sets the active item that should be transitioned to.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>cardsLayout</span> : <a href=\"#!/api/jqc.layout.Card\" rel=\"jqc.layout.Card\" class=\"docClass\">jqc.layout.Card</a><div class='sub-desc'><p>The CardsLayout instance that is using this transition strategy.</p>\n</div></li><li><span class='pre'>currentItem</span> : <a href=\"#!/api/jqc.Component\" rel=\"jqc.Component\" class=\"docClass\">jqc.Component</a><div class='sub-desc'><p>The currently active item. This may be null if the CardsLayout does not currently have an active item.</p>\n</div></li><li><span class='pre'>newItem</span> : <a href=\"#!/api/jqc.Component\" rel=\"jqc.Component\" class=\"docClass\">jqc.Component</a><div class='sub-desc'><p>The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).</p>\n</div></li><li><span class='pre'>options</span> : Object<div class='sub-desc'><p>There are no options for this <a href=\"#!/api/jqc.layout.Card.AbstractTransition\" rel=\"jqc.layout.Card.AbstractTransition\" class=\"docClass\">jqc.layout.Card.AbstractTransition</a> subclass, so this argument is ignored.</p>\n</div></li></ul><p>Overrides: <a href='#!/api/jqc.layout.Card.AbstractTransition-method-setActiveItem' rel='jqc.layout.Card.AbstractTransition-method-setActiveItem' class='docClass'>jqc.layout.Card.AbstractTransition.setActiveItem</a></p></div></div></div></div></div></div></div>"});