<portableCustomInteraction customInteractionTypeIdentifier="{{typeIdentifier}}" hook="{{entryPoint}}" xmlns="http://www.imsglobal.org/xsd/portableCustomInteraction">
    <responseSchema href="http://imsglobal.org/schema/json/v1.0/response.json"/>
    <resources location="http://imsglobal.org/pci/1.0.15/sharedLibraries.xml">
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