{{~#equal contentModel "blockStatic"~}}
<div class="qti-block">{{{body}}}</div>
<svg class="qti-block-overlay">
    <line x1="0" y1="100%" x2="100%" y2="0" style="stroke:rgb(0,0,0);stroke-width:1"/>
    <line x1="0" y1="0" x2="100%" y2="100%" style="stroke:rgb(0,0,0);stroke-width:1"/>
</svg>
{{~else~}}
{{{body}}}
{{~/equal~}}