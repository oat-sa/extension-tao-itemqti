<span class="qti-choice qti-hottext hottext" data-identifier="{{attributes.identifier}}" data-serial="{{serial}}"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}>
    <label class="hottext-checkmark">
        <input type="checkbox" value="{{attributes.identifier}}">
        <span class="icon-checkbox small"></span>
    </label>
    <span class="hottext-content">{{{body}}}</span>
</span>