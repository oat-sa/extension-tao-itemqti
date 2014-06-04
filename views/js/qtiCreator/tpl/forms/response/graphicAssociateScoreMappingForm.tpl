    <div class="form-container">
        <h2>{{title}}</h2>

        <div class="panel grid-row">
             <div class="col-7">{{__ 'Pair'}}</div>
            
            {{#unless noCorrect}}
            <div class="col-2" data-edit="correct">
                <span>{{__ "Correct"}}</span>
                <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
                <span class="tooltip-content">{{__ 'Is this choice the correct response?'}}</span>
            </div>
            {{/unless}}

            <div class="col-3">
                <span>{{__ "Score"}}</span>
                <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
                <span class="tooltip-content">{{__ 'Set the score for this response'}}</span>
            </div>
        </div>
        {{#each mappings}}
        <div class="panel grid-row">
            <div class="col-7">
               {{pair0}} - {{pair1}}
            </div>
            
            {{#unless noCorrect}}
            <div class="col-2" data-edit="correct">
                <label>
                    <input name="{{id}}-correct" type="checkbox" {{#if correct}} checked="checked"{{/if}} />
                    <span class="icon-checkbox"></span>
                </label>
            </div>
            {{/unless}}

            <div class="col-3">
                <input value="{{score}}" type="text" name="{{id}}-score" class="score" data-validate="$numeric" data-validate-option="$allowEmpty; $event(type=keyup)" />
            </div>
        </div>
        <hr>
        {{/each}}

        <span class="arrow"></span>
        <span class="arrow-cover"></span>
    </div>
