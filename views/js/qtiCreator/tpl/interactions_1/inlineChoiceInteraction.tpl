<div class="widget-box widget-inline" data-serial="{{serial}}" data-edit="active">
    <div class="qti-interaction qti-inlineInteraction qti-inlineChoiceInteraction">
        <table>
            <colgroup>
                <col class="text">
                <col class="icon">
                <col class="icon">
            </colgroup>
            <tbody>
                <tr>
                    <td class="main-option">Edit choices</td>
                    <td colspan="2"><span class="icon-down"></span></td>
                </tr>
                {{#choices}}{{{.}}}{{/choices}}
                <tr>
                    <td>
                        <div class="add-option" data-edit="question">
                            <span class="icon-add"></span>
                            Add another option
                        </div>
                    </td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>