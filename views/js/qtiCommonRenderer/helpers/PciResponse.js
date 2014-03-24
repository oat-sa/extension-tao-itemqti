define(['lodash'], function(_){

    var _qtiModelPciResponseCardinalities = {
        single : 'base',
        multiple : 'list',
        ordered : 'list',
        record : 'record'
    };

    return {
        /**
         * Parse a response variable formatted according to IMS PCI: http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @see serialize
         * @param {Object} response
         * @param {Object} interaction
         * @returns {Array}
         */
        unserialize : function(response, interaction){

            var responseValues = [],
                responseDeclaration = interaction.getResponseDeclaration(),
                baseType = responseDeclaration.attr('baseType'),
                cardinality = responseDeclaration.attr('cardinality'),
                mappedCardinality;

            if(_qtiModelPciResponseCardinalities[cardinality]){
                mappedCardinality = _qtiModelPciResponseCardinalities[cardinality];

                if(_.isObject(response[mappedCardinality])){
                    responseValues = response[mappedCardinality]
                    if(responseValues[baseType]){
                        responseValues = responseValues[baseType];
                        responseValues = _.isArray(responseValues) ? responseValues : [responseValues];
                    }else{
                        throw 'invalid response baseType';
                    }
                }else{
                    throw 'invalid response cardinality';
                }
            }else{
                throw 'unknown cardinality in the responseDeclaration of the interaction';
            }
            
            return responseValues;
        },
        /**
         * Serialize the input response array into the format to be send to result server according to IMS PCI recommendation :
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * With the only exception for empty response, which is represented by a javascript "null" value
         * 
         * @see http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * @param {Array} responseValues
         * @param {Object} interaction
         * @returns {Object|null}
         */
        serialize : function(responseValues, interaction){
            
            if(!_.isArray(responseValues)){
                throw 'invalid argument : responseValues must be an Array';
            }

            var response = {},
                responseDeclaration = interaction.getResponseDeclaration(),
                baseType = responseDeclaration.attr('baseType'),
                cardinality = responseDeclaration.attr('cardinality'),
                mappedCardinality;

            if(_qtiModelPciResponseCardinalities[cardinality]){
                mappedCardinality = _qtiModelPciResponseCardinalities[cardinality];
                if(mappedCardinality === 'base'){
                    if(responseValues.length === 0){
                        //return empty response:
                        response.base = null;
                    }else{
                        response.base = {};
                        response.base[baseType] = responseValues[0];
                    }
                }else{
                    response[mappedCardinality] = {};
                    response[mappedCardinality][baseType] = responseValues;
                }
            }else{
                throw 'unknown cardinality in the responseDeclaration of the interaction';
            }

            return response;
        },
        isEmpty : function(response){
            return (
                response === null
                || _.isEmpty(response)
                || response.base === null
                || _.isArray(response.list) && _.isEmpty(response.list)
                || _.isArray(response.record) && _.isEmpty(response.record)
            );
        }
    };
});