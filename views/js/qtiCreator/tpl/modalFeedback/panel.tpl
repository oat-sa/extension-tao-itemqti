<div class="feedbackRules">
{{#if feedbackRules}}
    {{#feedbackRules}}{{{.}}}{{/feedbackRules}}
{{else}}
    <p>{{__ "No modal feedback defined yet."}}</p>
{{/if}}
</div>
<a title="add else feedback" href="#" class="adder feedbackRule-add">Add a modal feedback</a>