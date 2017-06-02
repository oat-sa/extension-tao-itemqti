define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/helper/gridUnits',
    'taoQtiItem/qtiCreator/editor/gridEditor/helper',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(_, $, gridUnits, gridHelper, contentHelper){

    'use strict';

    return function widgetDeleter(widget){

        var updateBody = false;
        var getElementToRemove = function getElementToRemove(){

            var $tbody, $tds;
            var $container = widget.$container;

            //if is a choice widget:
            if($container.hasClass('qti-choice')){

                if($container.prop('tagName') === 'TH'){

                    //matchInteraction:
                    if($container.parent().parent().prop('tagName') === 'THEAD'){

                        //hide col
                        $tbody = $container.closest('table.matrix').children('tbody');
                        $tds = $tbody.children('tr').find('td:last');
                        return $container.add($tds);

                    }else if($container.parent().parent().prop('tagName') === 'TBODY'){

                        //hide row
                        return $container.parent();
                    }
                }else{
                    return $container;
                }

            }

            /**
             * inline widget
             */
            if($container.hasClass('widget-inline')){
                return $container.add(widget.$original);
            }

            /**
             * block widget
             */
            var $col = $container.parent();

            //check sub-column condition
            var $subCol = $container.parent('.colrow');
            if($subCol.length){

                updateBody = true;

                var $colMulti = $subCol.parent();
                if($colMulti.find('.colrow').length === 1){
                    //this is the only sub-column remaining, hide the entire col
                    $col = $colMulti;
                }else{
                    //hide the whole sub-column only :
                    return $subCol;
                }
            }

            //check if we should hide the col only or the whole row
            var $row = $col.parent('.grid-row');
            if($row.length){
                updateBody = true;
                if($row.children().length === 1){
                    //if it is the only col in the row, hide the entire row
                    return $row;
                }else{
                    //else, hide the current one ...
                    return $col;
                }
            }else if($container.hasClass('grid-row')){
                //rubric block:
                updateBody = true;
                return $container;
            }

            //other block widgets:
            if($container.hasClass('widget-block') || $container.hasClass('widget-blockInteraction')){
                return $container;
            }
        };

        var deleteElement = function deleteElement(){

            var item = widget.element.getRelatedItem();
            var $item = item.data('widget').$container.find('.qti-itemBody');

            getElementToRemove().remove();//remove html from the dom
            widget.destroy();//remove what remains of the widget (almost nothing), call this after element remove
            widget.element.remove();//remove from model

            if(updateBody){
                //need to update item body
                item.body(contentHelper.getContent($item));
            }

        };

        var redistributeUnits = function redistributeUnits($col){

            var $otherCols = $col.siblings();
            var cols = [];

            $otherCols.each(function(){
                cols.push({
                    elt : $(this),
                    units : $col.data('units')
                });
            });

            cols = gridUnits.redistribute(cols);

            _.forEach(cols, function(col){
                col.elt.removeClass('col-' + col.units).addClass('col-' + col.refactoredUnits);
                gridHelper.setUnitsFromClass(col.elt);
            });

            //store results in the element for future ref?
            $col.data('redistributedUnits', cols);

            return cols;
        };

        return {
            deleteElement : deleteElement,
            getElementToRemove : getElementToRemove,
            redistributeUnits : redistributeUnits
        };
    };

});