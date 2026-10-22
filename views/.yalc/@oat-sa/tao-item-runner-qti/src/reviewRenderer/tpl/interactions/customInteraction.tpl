<div {{#if isInteractionDisabled}}style="pointer-events: none;" {{/if}} class="qti-interaction qti-customInteraction"
    data-serial="{{serial}}" {{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}" {{/if}}>
    {{{markup}}}
</div>