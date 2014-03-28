<div class="widget-box widget-inlineChoiceInteraction" data-serial="{{serial}}">
    <div class="qti-interaction qti-inlineChoiceInteraction">
        <table>
            <colgroup>
                <col class="text">
                <col class="icon">
                <col class="icon">
            </colgroup>
            <tbody>
                <tr>
                    <td class="main-option"><div>-- {{__ "edit choices"}} --<span class="icon-down"></span></div></td>
                    <td style="font-size:12px;visibility: hidden" use-data-optional-or so>Correct</td>
                    <td>Correct</td>
                </tr>
                {{#choices}}{{{.}}}{{/choices}}
                <tr data-edit="question">
                    <td>
                        <div class="add-option">
                            <span class="icon-add"></span>
                            {{__ "new option"}}
                        </div>
                    </td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>