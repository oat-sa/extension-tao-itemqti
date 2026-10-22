define(['taoQtiItem/qtiItem/core/interactions/BlockInteraction', 'taoQtiItem/qtiItem/mixin/Container'], function (BlockInteraction, Container) { 'use strict';

	BlockInteraction = BlockInteraction && Object.prototype.hasOwnProperty.call(BlockInteraction, 'default') ? BlockInteraction['default'] : BlockInteraction;
	Container = Container && Object.prototype.hasOwnProperty.call(Container, 'default') ? Container['default'] : Container;

	var ContainerInteraction = BlockInteraction.extend({});
	Container.augment(ContainerInteraction);

	return ContainerInteraction;

});
