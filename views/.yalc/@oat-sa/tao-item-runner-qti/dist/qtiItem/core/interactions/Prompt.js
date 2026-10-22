define(['taoQtiItem/qtiItem/core/Element', 'taoQtiItem/qtiItem/mixin/ContainerInline'], function (Element, Container) { 'use strict';

	Element = Element && Object.prototype.hasOwnProperty.call(Element, 'default') ? Element['default'] : Element;
	Container = Container && Object.prototype.hasOwnProperty.call(Container, 'default') ? Container['default'] : Container;

	var Prompt = Element.extend({ qtiClass: 'prompt' });
	Container.augment(Prompt);

	return Prompt;

});
