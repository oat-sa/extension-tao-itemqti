{{~#equal tag 'figure'~}}
    <{{tag}}{{#if attributes}} {{{join attributes '=' ' ' '"' }}}{{/if}}>{{{body}}}</{{tag}}>
{{~else~}}
    {{{body}}}
{{~/equal~}}
