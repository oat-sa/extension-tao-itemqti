{{#if constraint}}
<span {{#if attributes.id}}id="{{attributes.id}}"{{/if}} class="qti-interaction qti-inlineInteraction qti-textEntryInteraction{{#if attributes.class}} {{attributes.class}}{{/if}}" data-serial="{{serial}}" data-qti-class="textEntryInteraction">
    <input type="text" />
    {{#if constraint.show}}
    <span class="constraint">
        <span class="count">0</span>
        <span class="separator">&frasl;</span>
        <span class="max">{{constraint.max}}</span>
        <span class="unit">{{constraint.unit}}</span>
    </span>
    {{/if}}
</span>
{{else}}
<input {{#if attributes.id}}id="{{attributes.id}}"{{/if}} class="qti-interaction qti-inlineInteraction qti-textEntryInteraction{{#if attributes.class}} {{attributes.class}}{{/if}}" data-serial="{{serial}}" data-qti-class="textEntryInteraction" type="text">
{{/if}}
