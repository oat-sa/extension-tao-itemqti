define([
    'lodash',
    'taoQtiItem/qtiItem/core/variables/ResponseDeclaration',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/variables/OutcomeDeclaration',
    'taoQtiItem/qtiCreator/model/response/SimpleFeedbackRule',
    'taoQtiItem/qtiCreator/model/feedbacks/ModalFeedback',
    'taoQtiItem/qtiItem/helper/response'
], function(_, ResponseDeclaration, editable, OutcomeDeclaration, SimpleFeedbackRule, ModalFeedback, responseHelper){

    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, {
        setTemplate : function(template){
            var templateUri = responseHelper.getTemplateUriFromName(template);
            if(templateUri && this.template !== templateUri){
                this.template = templateUri;
                $(document).trigger('responseTemplateChange.qti-widget', {'element' : this, 'value' : template});
            }
            return this;
        },
        getTemplate : function(){
            return this.template;
        },
        setCorrect : function(value){
            if(_.isString(value)){
                value = [value];
            }
            this.correctResponse = value;
            $(document).trigger('correctResponseChange.qti-widget', {'element' : this, 'value' : value});
            return this;
        },
        getCorrect : function(){
            return this.correctResponse;
        },
        setMappingAttribute : function(name, value){
            this.mappingAttributes[name] = value;
            $(document).trigger('mappingAttributeChange.qti-widget', {'element' : this, 'key' : name, 'value' : value});
        },
        getMappingAttribute : function(name){
            return this.mappingAttributes[name];
        },
        setMapEntry : function(mapKey, mappedValue, caseSensitive){

            mappedValue = parseFloat(mappedValue);
            caseSensitive = caseSensitive ? true : false;

            if(!isNaN(mappedValue)){
                if(this.attr('cardinality') === 'multiple' && this.attr('baseType') === 'pair'){
                    //in this case, A-B is equivalent to B-A so need to check if any of those conbination already exists:

                    var mapKeys = mapKey.split(' '),
                        mapKeysReverse = mapKeys[1] + ' ' + mapKeys[0];

                    if(this.mapEntries[mapKeysReverse]){
                        this.mapEntries[mapKeysReverse] = mappedValue;
                    }else{
                        this.mapEntries[mapKey] = mappedValue;
                    }
                }else{
                    this.mapEntries[mapKey] = mappedValue;
                }

                /**
                 * @todo caseSensitive is always set to "false" currently, need to add an option for this
                 * this.mapEntries[mapKey] = {
                 'mappedValue' : mappedValue,
                 'caseSensitive' : caseSensitive
                 };
                 */

                $(document).trigger('mapEntryChange.qti-widget', {
                    element : this,
                    mapKey : mapKey,
                    mappedValue : mappedValue,
                    caseSensitive : caseSensitive
                });
            }else{
                throw 'the mapped value is not a number';
            }

            return this;
        },
        removeMapEntry : function(mapKey){

            if(mapKey){
                if(this.attr('cardinality') === 'multiple' && this.attr('baseType') === 'pair'){
                    //in this case, A-B is equivalent to B-A so need to check if any of those conbination already exists:
                    var mapKeys = mapKey.split(' '),
                        mapKeysReverse = mapKeys[1] + ' ' + mapKeys[0];

                    delete this.mapEntries[mapKeysReverse];
                }
                delete this.mapEntries[mapKey];

                $(document).trigger('mapEntryRemove.qti-widget', {element : this, mapKey : mapKey});
            }

            return this;
        },
        getMapEntries : function(){
            return _.clone(this.mapEntries);
        },
        createFeedbackRule : function(){

            var item = this.getRelatedItem();

            var outcome = new OutcomeDeclaration({cardinality : 'single', baseType : 'identifier'});
            item.addOutcomeDeclaration(outcome);
            outcome.buildIdentifier('FEEDBACK');

            var modalFeedback = new ModalFeedback({outcomeIdentifier : outcome.id()});
            item.addModalFeedback(modalFeedback);
            modalFeedback.buildIdentifier('feedbackModal');

            var rule = new SimpleFeedbackRule(outcome, modalFeedback);
            rule.setCondition(this, 'correct');
            this.feedbackRules[rule.getSerial()] = rule;

            return rule;
        },
        getFeedbackRules : function(){
            return _.clone(this.feedbackRules);
        },
        setCondition : function(rule, condition, value){
            rule.setCondition(this, condition, value);
        },
        deleteFeedbackRule : function(rule){
            return this.remove('feedbackRules', rule);
        },
        createFeedbackElse : function(rule){

            var modalFeedback = new ModalFeedback({outcomeIdentifier : rule.comparedOutcome.id()});
            this.getRelatedItem().addModalFeedback(modalFeedback);
            modalFeedback.buildIdentifier('feedbackModal');

            rule.setFeedbackElse(modalFeedback);

            return modalFeedback;
        },
        deleteFeedbackElse : function(rule){
            this.getRelatedItem().remove('feedback', rule);
            rule.feedbackElse = null;
        },
        getDefaultAttributes : function(){
            return {};
        }
    });

    return ResponseDeclaration.extend(methods);
});


