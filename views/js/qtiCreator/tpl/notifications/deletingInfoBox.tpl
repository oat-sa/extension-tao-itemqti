<div class="feedback-info" data-for="{{serial}}">
    <span class="icon-info"></span>
    {{#equal count 1}}
        {{__ "You have delete an element"}}.
    {{else}}
        {{__ "You have delete"}} {{count}} {{__ "elements"}}.
    {{/equal}}
    <a class="undo" href="#">{{__ "undo"}}</a>
    <span title="Remove Message" class="icon-close close-trigger"></span>
</div>