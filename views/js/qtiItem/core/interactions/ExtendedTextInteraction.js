define(['taoQtiItem/qtiItem/core/interactions/BlockInteraction', 'lodash'], function(BlockInteraction, _){
    
    var ExtendedTextInteraction = BlockInteraction.extend({
        qtiClass : 'extendedTextInteraction',
        render : function(data, $container){

            var defaultData = {
                'multiple' : false,
                'maxStringLoop' : []
            };

            var response = this.getResponseDeclaration();
            if(this.attr('maxStrings') && (response.attr('cardinality') === 'multiple' || response.attr('cardinality') === 'ordered')){
                defaultData.multiple = true;
                for(var i = 0; i < this.attr('maxStrings'); i++){
                    defaultData.maxStringLoop.push(i + '');//need to convert to string. The tpl engine fails otherwise
                }
            }

            var tplData = _.merge(defaultData, data || {});

            return this._super(tplData, $container);
        }
    });
    
    return ExtendedTextInteraction;
});


