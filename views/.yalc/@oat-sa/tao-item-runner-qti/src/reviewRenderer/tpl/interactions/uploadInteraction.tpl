<div class="qti-interaction qti-blockInteraction qti-uploadInteraction" data-serial="{{serial}}"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}>
	{{#if prompt}}{{{prompt}}}{{/if}}
    <div class="file-upload fixed-grid-row lft">
        <span class="file-name placeholder col-8 truncate"></span>
        <button type="button" data-control="download" class="btn-info small"><span class="icon-download"></span> {{__ "Download"}}</button>
    </div>
    <div class="file-upload-preview lft visible-file-upload-preview runtime-visible-file-upload-preview">
        <p class="nopreview">{{__ 'No uploaded file'}}</p>
    </div>
</div>
