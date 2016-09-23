<div {{#if attributes.id}}id="{{attributes.id}}"{{/if}} class="qti-interaction qti-blockInteraction qti-matchInteraction{{#if attributes.class}} {{attributes.class}}{{/if}}" data-serial="{{serial}}" data-qti-class="matchInteraction">
  {{#if prompt}}{{{prompt}}}{{/if}}
  <div class="instruction-container"></div>
  <div class="match-interaction-area">
    <table class="matrix">
      <thead>
      <tr>
        <th> </th>
        {{#matchSet2}}{{{.}}}{{/matchSet2}}
      </tr>
      </thead>
      <tbody>
      {{#matchSet1}}
      <tr>
        {{{.}}}
        {{#each ../matchSet2}}
        <td>
          <label>
            <input type="checkbox" >
            <span class="icon-checkbox cross"></span>
          </label>
        </td>
        {{/each}}
      </tr>
      {{/matchSet1}}
      </tbody>
    </table>
  </div>
  <div class="notification-container"></div>
</div>
