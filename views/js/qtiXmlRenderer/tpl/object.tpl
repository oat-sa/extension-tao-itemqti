{{~#if body~}}
<object{{#if attributes}} {{{join attributes '=' ' ' '"'}}}{{/if}}>{{{body}}}</object>
{{~else~}}
<object{{#if attributes}} {{{join attributes '=' ' ' '"'}}}{{/if}} />
{{~/if~}}