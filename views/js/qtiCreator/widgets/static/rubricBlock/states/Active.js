define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/rubricBlock',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
], function(stateFactory, Active, formTpl, formElement){

    var RubricBlockStateActive = stateFactory.extend(Active, function(){
        
        this.addOptionForm();
        
    },function(){
        
        this.widget.$form.empty();
    });
    
    return RubricBlockStateActive;
});