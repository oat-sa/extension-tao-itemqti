<div class="feedbackRule-container" data-serial="{{serial}}">
    <div class="feedbackRule-rule-if">
        <span class="feedbackRule-desc">IF</span>
        <select class="feedbackRule-condition select2" data-has-search="false">
            {{#each availableConditions}}
            <option value="{{name}}" {{#equal name ../condition}}selected="selected"{{/equal}}>{{label}}</option>
            {{/each}}
        </select>
        <input class="feedbackRule-compared-value score" type="text" value="{{comparedValue}}" {{#if hideScore}}style="display:none"{{/if}}/>
    </div>
    <div class="feedbackRule-then-else">
        <span class="feedbackRule-desc">THEN show</span>
        <button class="btn-info small" type="button" data-feedback="then">feedback<span class="icon-edit r"></span></button>
        {{#if addElse}}
            <a title="add else feedback" href="#" class="adder feedbackRule-add-else">else</a>
        {{/if}}
    </div>
    {{#if feedbackElse}}
     <div class="feedbackRule-then-else">
            <span class="feedbackRule-desc">ELSE show</span>
            <button class="btn-info small" type="button" data-feedback="else">feedback<span class="icon-edit r"></span></button>
            <span class="feedbackRule-button-delete icon-bin" title="{{__ "delete else feedback"}}" data-role="else"></span>
        </div>
    {{/if}}
    <span class="feedbackRule-button-delete icon-bin" title="{{__ "delete feedback rule"}}" data-role="rule"></span>
</div>