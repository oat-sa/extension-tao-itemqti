<div
  {{#if attributes.id}}id="{{attributes.id}}"{{/if}}
  class="qti-interaction qti-blockInteraction qti-choiceInteraction{{#if attributes.class}} {{attributes.class}}{{/if}}{{#if allowEliminationVisible}} allow-elimination-visible{{/if}}"
  data-serial="{{serial}}"
  data-qti-class="choiceInteraction"
  {{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}
  {{#if attributes.data-scrolling}} data-scrolling="{{attributes.data-scrolling}}"{{/if}}
  {{#if attributes.data-scrolling-height}} data-scrolling-height="{{attributes.data-scrolling-height}}"{{/if}}
>
  {{#if prompt}}{{{ prompt }}}{{/if}}
  <div class="instruction-container"></div>
  <ol
    class="plain block-listing solid choice-area{{#if horizontal}} horizontal{{/if}} {{#if listStyle}}{{{listStyle}}}{{/if}}"
    tabindex="-1"
    aria-labelledby="{{promptId}}"
  >
      {{#choices}}{{{.}}}{{/choices}}
  </ol>
  <div class="notification-container"></div>
</div>
