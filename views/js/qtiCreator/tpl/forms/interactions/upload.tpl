<div class="panel">
    <h3>{{__ "MIME-type"}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "The MIME-type attribute describes which kind of file may be uploaded."}}</div>
    
    <div class="reset-group">
        <select name="type" class="select2" data-has-search="false">
        	<option value="">{{__ "-- Any kind of file --"}}</option>
        	<option value="application/zip">{{__ "ZIP file"}}</option>
            <option value="text/plain">{{__ "Plain text"}}</option>
            <option value="application/pdf">{{__ "PDF file"}}</option>
            <option value="image/jpeg">{{__ "JPEG image"}}</option>
            <option value="image/png">{{__ "PNG image"}}</option>
            <option value="image/gif">{{__ "GIF image"}}</option>
            <option value="image/svg+xml">{{__ "SVG image"}}</option>
            <option value="application/ogg">{{__ "OGG media"}}</option>
            <option value="audio/mpeg">{{__ "MPEG media"}}</option>
            <option value="audio/x-ms-wma">{{__ "Windows Media audio"}}</option>
            <option value="audio/x-wav">{{__ "WAV audio"}}</option>
            <option value="video/mpeg">{{__ "MPEG video"}}</option>
            <option value="video/mp4">{{__ "MP4 video"}}</option>
            <option value="video/quicktime">{{__ "Quicktime video"}}</option>
            <option value="video/x-ms-wmv">{{__ "Windows Media video"}}</option>
            <option value="video/x-flv">{{__ "Flash video"}}</option>
            <option value="text/csv">{{__ "CSV file"}}</option>
            <option value="application/msword">{{__ "Microsoft Word file"}}</option>
            <option value="application/vnd.ms-excel">{{__ "Microsoft Excel file"}}</option>
            <option value="application/vnd.ms-powerpoint">{{__ "Microsoft Powerpoint file"}}</option>       
        </select>
    </div>
</div>
