define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/helpers/deletingState',
    'taoQtiItem/qtiCreator/helper/gridUnits',
    'taoQtiItem/qtiCreator/widgets/helpers/comments',
    'taoQtiItem/qtiCreator/editor/gridEditor/helper',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function (_, $, stateFactory, deletingHelper, gridUnits, comments, gridHelper, contentHelper) {
    const DeletingState = stateFactory.create(
        'deleting',
        function init() {
            const element = this.widget.element;

            //array to store new col untis
            this.refactoredUnits = [];
            this.updateBody = false;

            //reference to the dom element(s) to be remove on delete
            this.$elementToRemove = this.getElementToRemove();

            this.hideWidget();

            this.showMessage(element);

            element.data('deleting', true);

            //trigger resizing
            if (this.updateBody) {
                //store reference to the item and its container:
                this.item = element.getRootElement();
                this.$item = this.item.data('widget').$container.find('.qti-itemBody');

                //call for resize action
                this.$item.trigger('resize.qti-widget');
            }
        },
        function exit() {
            this.showWidget();
            deletingHelper.confirmDeletion(this.messageBox);
            this.widget.element.data('deleting', false);
            $('body').off('.deleting');

            if (this.updateBody) {
                this.$item.trigger('resize.qti-widget');
            }
        }
    );

    /**
     * @todo move widget specific code to their respective location
     *
     * @returns {jQuery} container
     */
    DeletingState.prototype.getElementToRemove = function () {
        const $container = this.widget.$container;

        //if is a choice widget:
        if ($container.hasClass('qti-choice')) {
            if ($container.prop('tagName') === 'TH') {
                //matchInteraction:
                if ($container.parent().parent().prop('tagName') === 'THEAD') {
                    //hide col
                    const $tbody = $container.closest('table.matrix').children('tbody');
                    const $tds = $tbody.children('tr').find('td:visible:last');
                    return $container.add($tds);
                } else if ($container.parent().parent().prop('tagName') === 'TBODY') {
                    //hide row
                    return $container.parent();
                }
            } else {
                return $container;
            }
        }

        /**
         * inline widget
         */
        if ($container.hasClass('widget-inline')) {
            return $container.add(this.widget.$original);
        }

        /**
         * block widget
         */
        let $col = $container.parent();

        //check sub-column condition
        const $subCol = $container.parent('.colrow');
        if ($subCol.length) {
            this.updateBody = true;

            const $colMulti = $subCol.parent();
            if ($colMulti.find('.colrow').length === 1) {
                //this is the only sub-column remaining, hide the entire col
                $col = $colMulti;
            } else {
                //hide the whole sub-column only :
                return $subCol;
            }
        }

        //check if we should hide the col only or the whole row
        const $row = $col.parent('.grid-row');
        if ($row.length) {
            this.updateBody = true;
            if ($row.children().length === 1) {
                //if it is the only col in the row, hide the entire row
                return $row;
            } else {
                //else, hide the current one ...
                return $col;
            }
        } else if ($container.hasClass('grid-row')) {
            //rubric block:
            this.updateBody = true;
            return $container;
        }

        //other block widgets:
        if ($container.hasClass('widget-block') || $container.hasClass('widget-blockInteraction')) {
            return $container;
        }
    };

    const _isCol = function ($col) {
        const attrClass = $col.attr('class');
        return attrClass && /col-([\d]+)/.test(attrClass);
    };

    const _redistributeUnits = function ($col) {
        const $otherCols = $col.siblings();
        let cols = [];

        $otherCols.each(function () {
            const $thisCol = $(this),
                units = $col.data('units');

            cols.push({
                elt: $thisCol,
                units: units
            });
        });

        cols = gridUnits.redistribute(cols);

        _.forEach(cols, function (col) {
            let oldClass = col.elt.context.classList.value;
            col.elt.removeClass(oldClass.match(/col-([\d]+)/).input).addClass(`col-${col.refactoredUnits}`);
            gridHelper.setUnitsFromClass(col.elt);
        });

        //store results in the element for future ref?
        $col.data('redistributedUnits', cols);

        return cols;
    };
    DeletingState.prototype.hideWidget = function () {
        const $elt = this.$elementToRemove;

        if ($elt.length) {
            $elt.hide();
            if (_isCol($elt)) {
                //it is a column : redistribute the units of the columdn to the others
                this.refactoredUnits = _redistributeUnits($elt);
            }
        }
    };

    DeletingState.prototype.showWidget = function () {
        const $elt = this.$elementToRemove;
        if ($elt.length && $.contains(document, $elt[0])) {
            $elt.show();

            if (_isCol($elt)) {
                //restore the other units:
                _.forEach(this.refactoredUnits, function (col) {
                    col.elt.removeClass(`col-${col.refactoredUnits}`).addClass(`col-${col.units}`);
                    gridHelper.setUnitsFromClass(col.elt);
                });
            }
        }
    };

    DeletingState.prototype.showMessage = function () {
        const $messageBox = deletingHelper.createInfoBox([this.widget]);

        $messageBox
            .on('confirm.deleting', () => {
                this.deleteElement();
            })
            .on('undo.deleting', () => {
                try {
                    this.widget.changeState('question');
                } catch (e) {
                    this.widget.changeState('active');
                }
            });

        this.messageBox = $messageBox;
    };

    DeletingState.prototype.deleteElement = function () {
        this.refactoredUnits = [];

        // remove inner widgets
        const container = this.widget.element;
        const elements =  container.getBody ? container.getBody().elements : container.elements;
        if (elements) {
            _.forEach(_.values(elements), function (elt) {
                if (elt.metaData && elt.metaData.widget) {
                    const widget = elt.metaData.widget;
                    widget.destroy();
                    widget.element.remove();
                }
            });
        }

        //remove autogenerated comments
        comments.removeAutogeneratedCommentNodes(this.$elementToRemove[0]);

        this.$elementToRemove.remove(); //remove html from the dom
        this.widget.destroy(); //remove what remains of the widget (almost nothing), call this after element remove
        this.widget.element.remove(); //remove from model

        if (this.updateBody) {
            //need to update item body
            this.item.body(contentHelper.getContent(this.$item));
        }

        if (this.$item) {
            this.$item.trigger('item.deleted');
        }
    };

    return DeletingState;
});
