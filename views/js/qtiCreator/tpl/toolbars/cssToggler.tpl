{{#each stylesheets}}
<li data-css-res="{{path}}">
    <span class="icon-preview style-sheet-toggler" title="{{title}}"></span>
    <span class="file-label truncate" title="{{label}}">{{label}}</span>
    <span class="icon-bin" title="{{deleteTxt}}" data-role="css-delete"></span>
</li>
{{/each}}