<div class="preview-overlay tao-scope overlay preview-desktop item-no-print">
  <div class="preview-container-outer">
    <div class="preview-canvas">
      <form class="preview-utility-bar plain">
        <div class="preview-utility-bar-inner tbl">
          <h1 class="desktop-preview-heading desktop-only preview-heading tbl-cell">{{__ 'Desktop Preview'}}</h1>
          <h1 class="mobile-preview-heading mobile-only preview-heading tbl-cell">{{__ 'Mobile Preview'}}</h1>
          <div class="tbl-cell">
            <div class="feedback-info small">
              <span class="icon-info"></span>
              {{__ 'Final rendering may differ from this preview!'}}
            </div>
          </div>
          <ul class="plain tbl-cell clearfix">
            <li class="lft desktop-only">
              <select class="desktop-device-selector preview-device-selector">
                  {{#each desktopDevices}}
                  <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
                  {{/each}}
              </select>
            </li>
            <li class="lft desktop-only">
              <span class="btn-info toggle-view small" data-target="mobile">
                <span class="icon-mobile-preview"></span>
                {{__ 'Switch to mobile'}}</span>
            </li>
            <li class="lft mobile-only">
              <select class="mobile-device-selector preview-device-selector">
                  {{#each mobileDevices}}
                  <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
                  {{/each}}
              </select>
            </li>
            <li class="lft mobile-only">
              <select tabindex="-1" class="mobile-orientation-selector">
                <option value="landscape">{{__ 'Landscape'}}</option>
                <option value="portrait">{{__ 'Portrait'}}</option>
              </select></li>
            <li class="lft mobile-only">
              <span class="btn-info toggle-view small" data-target="desktop">
                <span class="icon-desktop-preview"></span>
                {{__ 'Switch to desktop'}}</span>
            </li>
            <li class="lft">
              <span class="btn-info small preview-closer">
                {{__ 'Close'}}
                <span class="icon-close r"></span>
              </span>
            </li>
          </ul>
        </div>
      </form>
      <div class="desktop-preview-frame desktop-only preview-outer-frame">
        <div class="desktop-preview-container preview-container">
            <iframe src="about:blank" name="desktop-preview-iframe" class="desktop-preview-iframe preview-iframe"></iframe>
        </div>
      </div>
      <div class="mobile-preview-frame mobile-only preview-outer-frame mobile-preview-landscape">
        <div class="mobile-preview-container preview-container">
            <iframe src="about:blank" name="mobile-preview-iframe" class="mobile-preview-iframe preview-iframe"></iframe>
        </div>
      </div>
    </div>
  </div>
</div>