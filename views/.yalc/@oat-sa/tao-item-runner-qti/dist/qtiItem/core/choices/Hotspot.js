define(['taoQtiItem/qtiItem/core/choices/Choice'], function (QtiChoice) { 'use strict';

	QtiChoice = QtiChoice && Object.prototype.hasOwnProperty.call(QtiChoice, 'default') ? QtiChoice['default'] : QtiChoice;

	var QtiHotspot = QtiChoice.extend({});

	return QtiHotspot;

});
