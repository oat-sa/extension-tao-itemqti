define(['taoQtiItem/qtiItem/core/variables/VariableDeclaration'], function (VariableDeclaration) { 'use strict';

    VariableDeclaration = VariableDeclaration && Object.prototype.hasOwnProperty.call(VariableDeclaration, 'default') ? VariableDeclaration['default'] : VariableDeclaration;

    var OutcomeDeclaration = VariableDeclaration.extend({
        qtiClass: 'outcomeDeclaration'
    });

    return OutcomeDeclaration;

});
