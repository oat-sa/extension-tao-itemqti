<portableCustomInteraction customInteractionTypeIdentifier="{{typeIdentifier}}" hook="{{entryPoint}}" xmlns="http://www.imsglobal.org/xsd/portableCustomInteraction">
    <resources>
        <libraries>
            {{#each libraries}}
            <lib id="{{.}}"/>
            {{/each}}
        </libraries>
    </resources>
    {{{portableElementProperties properties ''}}}
    <markup>
        {{{markup}}}
    </markup>
</portableCustomInteraction>