<div {{#if attributes.id}}id="{{attributes.id}}"{{/if}} class="qti-interaction qti-blockInteraction qti-sliderInteraction{{#if attributes.class}} {{attributes.class}}{{/if}}" data-serial="{{serial}}" data-qti-class="sliderInteraction"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}} >
    {{#if prompt}}{{{prompt}}}{{/if}}
    <div class="instruction-container"></div>
</div>
