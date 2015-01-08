<div class="qti-interaction qti-blockInteraction qti-extendedTextInteraction" data-serial="{{serial}}" data-qti-class="extendedTextInteraction">
    {{#if prompt}}{{{prompt}}}{{/if}}
    <div class="instruction-container"></div>
    {{#if multiple}}
    <div id="{{attributes.identifier}}">
        {{#maxStringLoop}}<input id="_{{.}}" name="{{attributes.identifier}}_{{.}}"/><br />{{/maxStringLoop}}
    </div>
    {{else}}
        {{#equal attributes.format "xhtml"}}
        <div class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}" contenteditable></div>
        {{else}}
        <textarea class="text-container text-{{attributes.format}} solid{{#if attributes.class}} attributes.class{{/if}}"></textarea>
        {{/equal}}
    {{/if}}
</div>
