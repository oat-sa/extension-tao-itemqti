
<div class="preview-overlay tao-scope overlay preview-{{previewType}} item-no-print"
     style="overflow-x: hidden;display:none">
    <div class="preview-container-outer">
        <div class="preview-canvas">
            <form class="preview-utility-bar plain">
                <div class="preview-utility-bar-inner tbl">
                    <h1 class="desktop-preview-heading desktop-only preview-heading tbl-cell">{{__ 'Desktop Preview'}}</h1>

                    <h1 class="mobile-preview-heading mobile-only preview-heading tbl-cell">{{__ 'Mobile Preview'}}</h1>

                    <ul class="plain tbl-cell clearfix">
                        <li class="lft desktop-only device-orientation">
                            <select class="desktop-device-selector preview-device-selector" data-target="desktop">
                                {{#each desktopDevices}}
                                <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
                                {{/each}}
                            </select>
                        </li>
                        <li class="lft desktop-only device-toggle">
              <span class="btn-info toggle-view small" data-target="mobile">
                <span class="icon-mobile-preview"></span>
                  {{__ 'Switch to mobile'}}</span>
                        </li>
                        <li class="lft mobile-only device-orientation">
                            <select class="mobile-device-selector preview-device-selector" data-target="mobile">
                                {{#each mobileDevices}}
                                <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
                                {{/each}}
                            </select>
                            <select tabindex="-1" class="mobile-orientation-selector orientation-selector"
                                    data-target="mobile">
                                <option value="landscape">{{__ 'Landscape'}}</option>
                                <option value="portrait">{{__ 'Portrait'}}</option>
                            </select></li>
                        <li class="lft mobile-only device-toggle">
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
                <div class="preview-message-box">
                    <div class="feedback-info small">
                        <span class="icon-info"></span>
                        <span class="preview-scale-down">{{__ 'This preview may be scaled to fit your screen.'}}</span>
                        {{__ 'The final rendering may differ!'}}
                        <span title="{{__ 'Remove this message'}}" class="icon-close close-trigger"></span>
                    </div>
                </div>
            </form>
            <div class="preview-scale-container">
                <div class="{{previewType}}-preview-frame preview-outer-frame {{previewType}}-preview-landscape">
                    <div class="{{previewType}}-preview-container preview-container">
                        <iframe class="preview-iframe"></iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>