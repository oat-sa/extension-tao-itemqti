<div class="qti-interaction qti-blockInteraction qti-uploadInteraction" data-serial="{{serial}}"{{#if attributes.xml:lang}} lang="{{attributes.xml:lang}}"{{/if}}>
	{{#if prompt}}{{{prompt}}}{{/if}}
	<div class="instruction-container"></div>
    <div class="file-upload fixed-grid-row lft">
        <div class="progressbar"></div>
        <span class="btn-info small col-4"></span>
        <span class="file-name placeholder col-8 truncate"></span>
        <input type="file" {{#if accept}}accept="{{accept}}"{{/if}}/>
    </div>
    <div class="file-upload-preview lft visible-file-upload-preview runtime-visible-file-upload-preview">
        <p class="nopreview">{{__ 'No preview available'}}</p>
    </div>
    <div class="file-upload-preview-popup modal">
        <div class="modal-body">
        </div>
    </div>
</div>
