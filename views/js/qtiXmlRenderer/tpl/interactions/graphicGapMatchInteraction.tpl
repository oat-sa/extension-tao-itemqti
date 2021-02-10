<graphicGapMatchInteraction{{#if attributes}} {{{join attributes '=' ' ' '"'}}}{{/if}}>
    {{~#if prompt}}{{{prompt}}}{{/if}}
    {{{object}}}
    {{~#gapImgs}}{{{.}}}{{/gapImgs}}
    {{~#gapTexts}}{{{.}}}{{/gapTexts}}
    {{~#choices}}{{{.}}}{{/choices}}
</graphicGapMatchInteraction>