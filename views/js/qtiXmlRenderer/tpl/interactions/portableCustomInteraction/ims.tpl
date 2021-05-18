<portableCustomInteraction customInteractionTypeIdentifier="{{typeIdentifier}}" xmlns="http://www.imsglobal.org/xsd/portableCustomInteraction_v1">
    {{{imsPortableElementProperties properties ''}}}
    <modules{{#if primaryConfiguration}} primaryConfiguration="{{primaryConfiguration}}"{{/if}}{{#if fallbackConfiguration}} fallbackConfiguration="{{fallbackConfiguration}}"{{/if}}>
        {{#each modules}}
        <module id="{{id}}"{{#if primaryPath}} primaryPath="{{primaryPath}}"{{/if}}{{#if fallbackPath}} fallbackPath="{{fallbackPath}}"{{/if}}/>
        {{/each}}
    </modules>
    <markup xmlns="http://www.w3.org/1999/xhtml">
        {{{markup}}}
    </markup>
</portableCustomInteraction>