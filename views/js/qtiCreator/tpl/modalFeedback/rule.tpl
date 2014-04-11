<div class="feedbackRule-container" data-serial="{{serial}}">
    <div class="feedbackRule-rule-if">
        <span class="feedbackRule-desc">IF</span>
        <select class="feedbackRule-condition">
            {{#conditions}}
            <option value="{{./name}}">{{./label}}</option>
        </select>
        <input class="feedbackRule-compared-value" type="text" value="{{comparedValue}}"/>
    </div>
    <div class="feedbackRule-then-else">
        <span class="feedbackRule-desc">THEN show</span>
        <button class="btn-info small" type="button" data-feedback="{{feedbackThen}}"><span class="icon-download"></span>feedback</button>
        {{#if addElse}}
            <a title="add else feedback" href="#" class="adder feedbackRule-add-else">else</a>
        {{/if}}    
    </div>
    {{#if feedbackElse}}
     <div class="feedbackRule-then-else">
            <span class="feedbackRule-desc">ELSE show</span>
            <button class="btn-info small" type="button" data-feedback="{{feedbackElse}}"><span class="icon-download"></span>feedback</button>
            <span class="feedbackRule-button-delete icon-bin" title="{{__ delete else feedback}}"></span>
        </div>
    {{/if}}
    <span class="feedbackRule-button-delete icon-bin" title="{{__ delete feedback rule}}"></span>
</div>