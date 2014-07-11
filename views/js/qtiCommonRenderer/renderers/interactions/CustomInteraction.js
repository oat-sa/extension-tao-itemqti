define([
    'lodash',
    'i18n',
    'jquery',
    'tpl!taoQtiItem/qtiCommonRenderer/tpl/interactions/customInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse'
], function(_, __, $, tpl, Helper, pciResponse){
    
    
    var render = function(){
        //get pci id
        //get param
        //call hook.initialize();
    };
    
    var setResponse = function(){
        
    };
    
    var getResponse = function(){
        
    };
    
    var resetResponse = function(){
        
    };
    
    var destroy = function(){
        
    };
    
    return {
        qtiClass : 'customInteraction',
        template : tpl,
        render : render,
        getContainer : Helper.getContainer,
        setResponse : setResponse,
        getResponse : getResponse,
        resetResponse : resetResponse,
        destroy : destroy
    };
});