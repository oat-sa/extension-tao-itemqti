<{{ns.pci}}portableCustomInteraction customInteractionTypeIdentifier="{{typeIdentifier}}">

    <{{ns.pci}}responseSchema href="http://imsglobal.org/schema/json/v1.0/response.json"/>

    <{{ns.pci}}resources location="http://imsglobal.org/pci/1.0.15/sharedLibraries.xml">
        <{{ns.pci}}libraries>
            {{#each libraries}}
            <{{../ns.pci}}lib name="{{@key}}" href="{{.}}"/>
            {{/each}}
        </{{ns.pci}}libraries>
    </{{ns.pci}}resources>
    
    {{{pciproperties properties ns.pci}}}

    <{{ns.pci}}markup>
        {{{markup}}}
    </{{ns.pci}}markup>

</{{ns.pci}}portableCustomInteraction>