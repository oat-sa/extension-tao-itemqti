define(['taoQtiItem/qtiItem/core/feedbacks/Feedback'], function (Feedback) { 'use strict';

	Feedback = Feedback && Object.prototype.hasOwnProperty.call(Feedback, 'default') ? Feedback['default'] : Feedback;

	var FeedbackInline = Feedback.extend({});

	return FeedbackInline;

});
