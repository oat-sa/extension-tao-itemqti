{{~#if attributes.showFigure ~}}
    <{{tag}}{{#if attributes}} {{{join attributes '=' ' ' '"' }}}{{/if}}>{{{body}}}</{{tag}}>
{{~else~}}
    {{{body}}}
{{~/if~}}
