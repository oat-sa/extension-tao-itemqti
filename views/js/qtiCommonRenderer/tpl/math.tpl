{{#if block}}
<span data-serial="{{serial}}" data-qti-class="math">
    <math display = "block">{{{body}}}</math>
</span>
{{else}}
<span data-serial="{{serial}}" data-qti-class="math">
    <math>{{{body}}}</math>
</span>   
{{/if}}