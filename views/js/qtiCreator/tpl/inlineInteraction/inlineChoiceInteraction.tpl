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
                    <td class="main-option">Jimmy Page</td>
                    <td colspan="2"><span class="icon-down"></span></td>
                </tr>
                {{#choices}}{{{.}}}{{/choices}}
                <tr data-edit="question">
                    <td>
                        <div class="add-option">
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