{{~#equal contentModel "blockStatic"~}}
<div class="qti-block"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}>{{{body}}}</div>
{{~else~}}
{{{body}}}
{{~/equal~}}