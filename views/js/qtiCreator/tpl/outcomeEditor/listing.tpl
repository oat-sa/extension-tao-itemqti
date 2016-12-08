{{#each outcomes}}
<div class="outcome-container panel subpanel{{#if readonly}} readonly{{/if}}" data-serial="{{serial}}">
    <label title="{{description}}">{{identifier}}</label>
    <span class="icon-bin" title="Delete" data-role="delete"></span>
    <span class="icon-edit" title="Edit" data-role="edit"></span>
</div>
{{/each}}