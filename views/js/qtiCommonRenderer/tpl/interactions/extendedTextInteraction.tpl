<div class="qti-interaction qti-blockInteraction qti-extendedTextInteraction" data-serial="{{serial}}" data-qti-class="extendedTextInteraction">
    {{#if prompt}}{{{prompt}}}{{/if}}
    <div class="instruction-container"></div>
    {{#if multiple}}
    <div id="{{attributes.identifier}}">
        {{#maxStringLoop}}<input id="_{{.}}" name="{{attributes.identifier}}_{{.}}"/><br />{{/maxStringLoop}}
    </div>
    {{else}}
        <div class="text-container">
            <textarea class="solid{{#if attributes.class}} attributes.class{{/if}}" cols="72"></textarea>
        </div>
    {{/if}}
</div>
