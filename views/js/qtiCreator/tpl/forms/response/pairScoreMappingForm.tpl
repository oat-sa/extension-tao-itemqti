    <div class="form-container widget-box">
        <h2>{{title}}</h2>

        <div class="panel grid-row">
            <div class="col-7"></div>
            
            {{#unless noCorrect}}
            <div class="col-2" data-edit="correct">
                <span>{{__ "Correct"}}</span>
                <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
                <span class="tooltip-content">{{__ 'Is this choice the correct response?'}}</span>
            </div>
            {{/unless}}

            <div class="col-2">
                <span>{{__ "Score"}}</span>
                <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
                <span class="tooltip-content">{{__ 'Set the score for this response'}}</span>
            </div>
        </div>
        <div class="panel grid-row">
            <div class="col-3">
               gap_id_12334
            </div>
            <div class="col-4">
               gap_img_876
            </div>
            
            {{#unless noCorrect}}
            <div class="col-2" data-edit="correct">
                <label>
                    <input name="correct" type="checkbox" {{#if correct}} checked="checked"{{/if}} />
                    <span class="icon-checkbox"></span>
                </label>
            </div>
            {{/unless}}

            <div class="col-2">
                <input value="{{score}}" type="text" data-for="{{identifier}}" name="score" class="score" data-validate="$numeric" data-validate-option="$allowEmpty; $event(type=keyup)" />
            </div>
            <div class="col-1">
                <a href="#"><span class="icon-bin"></span></a>
            </div>
        </div>
        <hr>
        <div class="panel grid-row">
            <div class="col-3">
               gap_id_12334
            </div>
            <div class="col-4">
               gap_img_876
            </div>
            
            {{#unless noCorrect}}
            <div class="col-2" data-edit="correct">
                <label>
                    <input name="correct" type="checkbox" {{#if correct}} checked="checked"{{/if}} />
                    <span class="icon-checkbox"></span>
                </label>
            </div>
            {{/unless}}

            <div class="col-2">
                <input value="{{score}}" type="text" data-for="{{identifier}}" name="score" class="score" data-validate="$numeric" data-validate-option="$allowEmpty; $event(type=keyup)" />
            </div>
            <div class="col-1">
                <a href="#"><span class="icon-bin"></span></a>
            </div>
        </div>
        <span class="arrow"></span>
        <span class="arrow-cover"></span>
    </div>
