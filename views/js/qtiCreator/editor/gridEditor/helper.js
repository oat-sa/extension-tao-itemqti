define([], function(){
    var helpers = {};
    
    function getColUnits($elt){
        var cssClasses = $elt.attr('class');
        if(!cssClasses){
            console.log($elt);
            throw new Error('the element has no css class');
        }
        return parseInt(cssClasses.match(/col-([\d]+)/).pop());
    }
    
    helpers.setUnitsFromClass = function($el){
        var units = getColUnits($el);
        $el.attr('data-units', units);
        return units;
    };
    
    return helpers;
});