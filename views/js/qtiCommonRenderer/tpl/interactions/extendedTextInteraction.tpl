<div class="qti-interaction qti-blockInteraction qti-extendedTextInteraction" data-serial="{{serial}}" data-qti-class="extendedTextInteraction">
    {{#if prompt}}{{{prompt}}}{{/if}}
    {{#if multiple}}
    <div id="{{attributes.identifier}}">
        {{#maxStringLoop}}<input id="{{attributes.identifier}}_{{.}}" name="{{attributes.identifier}}_{{.}}"/><br />{{/maxStringLoop}}
    </div>
    {{else}}
    <textarea id="{{attributes.identifier}}" name="{{attributes.identifier}}"></textarea>
    {{/if}}
    <div class="notification-container"></div>
</div>