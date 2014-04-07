define(['lodash'], function(_){

    /**
     * Argument cols format: 
     * [{elt:elementRef, units:6, min:4}]
     * 
     * Return format:
     * {last:6, middle:4, distributed:[{elt:elementRef, units:5}]}
     * 
     * @param {array} cols 
     * @param {int} min 
     * @param {int} max 
     * @returns {object}
     */
    function distributeUnits(cols, min, max){

        max = max || 12;
        var totalUnits = 0, size = 0, _cols = {}, ret = {}, minimized = [], decimals = [];

        for(var i in cols){
            _cols[i] = _.clone(cols[i]);
            totalUnits += cols[i].units;
            size++;
        }

        var avg = totalUnits / size;
        _cols[size + 1] = {
            'elt' : 'middle',
            'units' : avg,
            'min' : min
        };

        if(totalUnits + Math.round(avg) > max){

            var refactoredTotalUnits = 0;
            //need to squeeze the new col between existing ones:
            //refactored
            for(var i in _cols){

                var col = _cols[i];
                var refactoredUnits = col.units * max / (max + avg);//calculate the average, basis for the new inserted element's units
                decimals[i] = Math.round((refactoredUnits % 1) * 100);//get its decimals for later usage

                col.refactoredUnits = Math.round(refactoredUnits);
                if(col.min && col.refactoredUnits < col.min){//a col cannot be smaller than its min units value obviously
                    col.refactoredUnits = col.min;
                    minimized[i] = true;//marked it as not changeable
                }
                refactoredTotalUnits += col.refactoredUnits;

            }

            if(refactoredTotalUnits > max){
                //try ceil new units values:
                for(var i; i < size + 1; i++){
                    var col = _cols[i];
                    if(col.decimal > 50 && col.refactoredUnits - 1 > col.min){
                        col.refactoredUnits--;
                        refactoredTotalUnits--;
                    }
                    if(refactoredTotalUnits === max){
                        break;//target achieved
                    }
                }
            }

            var middleUnitValue = _cols[size + 1].refactoredUnits;
            var lastUnitValue = (refactoredTotalUnits > max) ? max : middleUnitValue;
            delete _cols[size + 1];

            ret = {
                last : lastUnitValue, //new col takes the remaining space
                middle : middleUnitValue,
                cols : _cols,
                refactoredTotalUnits : refactoredTotalUnits
            };
        }else{
            ret = {
                last : max - totalUnits,
                middle : Math.round(avg),
                cols : {}//no need to resize cols
            };
        }

        return ret;
    }

    return {
        distribute : function(cols, min, max){
            return distributeUnits(cols, min, max);
        }
    };
});
