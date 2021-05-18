<{{tag}}{{#if attributes}} {{{join attributes '=' ' ' '"'}}}{{~/if~}}>
    {{~#if prompt}}{{{prompt}}}{{/if}}
    {{{object}}}
    {{~#choices}}{{{.}}}{{/choices}}
    {{~#if body}}{{{body}}}{{/if}}
</{{tag}}>