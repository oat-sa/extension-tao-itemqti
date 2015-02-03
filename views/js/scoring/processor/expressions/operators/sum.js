define([
    'lodash'
], function(_){

    var sumProcessor = {

        constraints : {
            minOperand : 1,
            maxOperand : -1,
            cardinalities : ['single', 'multiple', 'ordered'],
            baseTypes : ['int', 'float']
        },

        operands   : [],

        process : function(){
            return _(this.operands).filter(_.isNumber).reduce(this.operands, function(sum, value){
                return sum + value;
            });
        }
    };

    return sumProcessor;
});
