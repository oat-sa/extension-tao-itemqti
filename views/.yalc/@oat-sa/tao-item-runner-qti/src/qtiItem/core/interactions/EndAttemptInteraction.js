import InlineInteraction from 'taoQtiItem/qtiItem/core/interactions/InlineInteraction';
export default InlineInteraction.extend({
    qtiClass: 'endAttemptInteraction',
    getNormalMaximum() {
        return 0;
    }
});
