{{~#if body~}}
<textEntryInteraction{{#if attributesMarkup}} {{{attributesMarkup}}}{{/if}}>{{{body}}}</textEntryInteraction>
{{~else~}}
<textEntryInteraction{{#if attributesMarkup}} {{{attributesMarkup}}}{{/if}} />
{{~/if~}}
