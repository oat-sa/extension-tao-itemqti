define([], function(){
    var helpers = {};
    
    function getColUnits($elt){
        
        var cssClasses = $elt.attr('class');
        if(!cssClasses){
            console.log($elt);
            debugger;
            throw new Error('the element has no css class');
        }
        
        var colMatch = cssClasses.match(/col-([\d]+)/);
        if(colMatch && colMatch.length){
            return colMatch.pop();
        }else{
            console.log($elt);
            debugger;
            throw 'the element has no col-* class';
        }
    }
    
    helpers.setUnitsFromClass = function($el){
        var units = getColUnits($el);
        $el.attr('data-units', units);
        return units;
    };
    
    return helpers;
});