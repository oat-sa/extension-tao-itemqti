<portableCustomInteraction customInteractionTypeIdentifier="{{typeIdentifier}}" xmlns="http://www.imsglobal.org/xsd/portableCustomInteraction_v1">
    {{{portableElementProperties properties ''}}}
    <modules{{#if primaryConfiguration}} primaryConfiguration="{{primaryConfiguration}}"{{/if}}{{#if fallbackConfiguration}} fallbackConfiguration="{{fallbackConfiguration}}"{{/if}}>
        {{#each modules}}
        <module id="{{id}}"{{#if primaryPath}} primaryPath="{{primaryPath}}"{{/if}}{{#if fallbackPath}} fallbackPath="{{fallbackPath}}"{{/if}}/>
        {{/each}}
    </modules>
    <markup>
        {{{markup}}}
    </markup>
</portableCustomInteraction>