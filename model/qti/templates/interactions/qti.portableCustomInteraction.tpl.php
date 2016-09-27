<?php
/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 * 
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */
?>
<customInteraction <?=get_data('attributes')?>>
    <pci:portableCustomInteraction customInteractionTypeIdentifier="<?=get_data('typeIdentifier')?>" hook="<?=get_data('entryPoint')?>" version="<?=get_data('version')?>">
        <pci:responseSchema href="http://imsglobal.org/schema/json/v1.0/response.json"/>
        <pci:resources location="http://imsglobal.org/pci/1.0.15/sharedLibraries.xml">
            <pci:libraries>
                <?php foreach(get_data('libraries') as $lib):?>
                <pci:lib id="<?=$lib?>"/>
                <?php endforeach;?>
            </pci:libraries>
            <pci:stylesheets>
                <?php foreach(get_data('stylesheets') as $stylesheet):?>
                <pci:lib id="<?=$stylesheet?>"/>
                <?php endforeach;?>
            </pci:stylesheets>
            <pci:mediaFiles>
                <?php foreach(get_data('mediaFiles') as $file):?>
                <pci:lib id="<?=$file?>"/>
                <?php endforeach;?>
            </pci:mediaFiles>
        </pci:resources>
        <?=get_data('serializedProperties')?>
        <pci:markup>
            <?=get_data('markup')?>
        </pci:markup>
    </pci:portableCustomInteraction>
</customInteraction>