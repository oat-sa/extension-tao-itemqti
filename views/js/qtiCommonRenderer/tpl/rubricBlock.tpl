{{#unless empty}}
<div class="grid-row qti-rubricBlock" data-use="{{attributes.use}}" data-serial="{{serial}}" data-qti-class="rubricBlock"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}>
    <div class="col-12">
        <div class="qti-rubricBlock-body">{{{body}}}</div>
    </div>
</div>
{{/unless}}