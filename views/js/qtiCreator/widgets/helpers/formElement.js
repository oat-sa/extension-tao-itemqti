define(['ui/incrementer', 'ui/tooltipster', 'ui/selecter'], function(spinner, tooltip, select2) {
    return {
        init : function($form){
            spinner($form);
            tooltip($form);
            select2($form);
        }
    };
});


