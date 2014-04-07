define([], function(){
    var helpers = {};
    
    function getColUnits($elt){
        return parseInt($elt.attr('class').match(/col-([\d]+)/).pop());
    }
    
    helpers.setUnitsFromClass = function($el){
        var units = getColUnits($el);
        $el.attr('data-units', units);
        return units;
    };
    
    return helpers;
});