<div {{#if attributes.id}}id="{{attributes.id}}"{{/if}} class="qti-interaction qti-blockInteraction qti-gapMatchInteraction{{#if attributes.class}} {{attributes.class}}{{/if}}" data-serial="{{serial}}" data-qti-class="gapMatchInteraction"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}>
    {{#if prompt}}{{{prompt}}}{{/if}}
    <ul class="choice-area none block-listing solid horizontal source">
        {{#choices}}{{{.}}}{{/choices}}
    </ul>
    <div class="instruction-container"></div>
    <div class="qti-flow-container">{{{body}}}</div>
</div>
