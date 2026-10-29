define(['lodash', 'tpl!taoQtiItem/qtiXmlRenderer/tpl/responseDeclaration'], function(_, tpl){
    'use strict';

    /**
     * mapping@defaultValue must be a double in QTI 2.x; empty string fails schema validation.
     *
     * @param {Object} mappingAttributes
     * @param {boolean} hasMapEntries
     * @returns {Object}
     */
    const normalizeMappingAttributes = function normalizeMappingAttributes(mappingAttributes, hasMapEntries) {
        const normalized = _.clone(mappingAttributes || {});

        if (!hasMapEntries) {
            return normalized;
        }

        const defaultValue = normalized.defaultValue;

        if (defaultValue === '' || _.isNull(defaultValue) || _.isUndefined(defaultValue)) {
            normalized.defaultValue = '0';
        }

        return normalized;
    };

    return {
        qtiClass : 'responseDeclaration',
        template : tpl,
        getData : function(responseDeclaration, data){
            var hasMapEntries = _.size(responseDeclaration.mapEntries),
                defaultData = {
                empty : !hasMapEntries && !_.size(responseDeclaration.correctResponse) && !_.size(responseDeclaration.defaultValue),
                correctResponse : _.values(responseDeclaration.correctResponse),
                isAreaMapping : (responseDeclaration.attributes.baseType === "point"),
                mappingAttributes : normalizeMappingAttributes(responseDeclaration.mappingAttributes, hasMapEntries),
                hasMapEntries : hasMapEntries,
                mapEntries : responseDeclaration.mapEntries,
                defaultValue : responseDeclaration.defaultValue,
                isRecord : responseDeclaration.attributes.cardinality === 'record'
            };

            return _.merge(defaultData, data || {});
        }
    };
});