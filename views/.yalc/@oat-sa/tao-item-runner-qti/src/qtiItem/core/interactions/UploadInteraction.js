import InlineInteraction from 'taoQtiItem/qtiItem/core/interactions/BlockInteraction';
var UploadInteraction = InlineInteraction.extend({
    qtiClass: 'uploadInteraction',
    getNormalMaximum() {
        return 0;
    }
});
export default UploadInteraction;
