define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'ui/modal'
], function (
    stateFactory,
    Active
    ) {

    /**
     * handle z-indices of sidebar and ckeditor
     */
    var indices = (function () {

        var elements = {
            sidebar: '#item-editor-item-widget-bar',
            cke: '.cke',
            ckeBase: '.cke_inner',
            ckeNose: '.cke_nose',
            ckeToolbar: '.cke_toolbar'
        };

        var raised = false,
            element;

        return {
            raise: function (baseIndex) {
                var $elem,
                    newIndex;

                baseIndex = parseInt(baseIndex, 10);

                for (element in elements) {
                    $elem = $(elements[element]);
                    elements[element] = {
                        element: $elem,
                        index: parseInt($elem.css('z-index'), 10)
                    };

                    newIndex = isNaN(elements[element].index) ? baseIndex + 100 : elements[element].index + baseIndex;
                    $elem.css('z-index', newIndex);
                }
            },
            reset: function () {
                if (!raised) {
                    return;
                }
                for (element in elements) {
                    elements[element].element.css('z-index', elements[element].index);
                }
            }
        }
    }());

    var _ckeIsReady = function() {
        var dfd = new jQuery.Deferred(),
            iteration = 0;

        var poll = function() {
            if(iteration > 20) {
              return;
            }
            var cke = $('.cke');
            if(cke.length){
                dfd.resolve();
            }
            else {
                setTimeout(poll, 200);
            }
        };
        poll();

        return dfd.promise();
    };


    var StaticStateActive = stateFactory.extend(Active, function () {

        var _widget = this.widget,
            $container = this.widget.$container;

        $container.modal({startClosed: true});
        $container.modal('open');

        $.when(_ckeIsReady()).then(function(){
            indices.raise($container.css('z-index'));
        });

        $container.on('closed.modal', function () {
            _widget.changeState('sleep');
        });

    }, function () {

        var $container = this.widget.$container;

        $container.off('opened.modal');
        $container.modal('close');

        // reset ck and sidebar
        indices.reset();
    });

    return StaticStateActive;
});