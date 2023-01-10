<?php

/**
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
 * Copyright (c) 2013-2023 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

declare(strict_types=1);

?>

<customInteraction <?=get_data('attributes')?>>
    <portableCustomInteraction
            xmlns="<?=get_data('xmlns')?>"
            customInteractionTypeIdentifier="<?=get_data('typeIdentifier')?>"
            hook="<?=get_data('entryPoint')?>"
            version="<?=get_data('version')?>"
    >
        <resources>
            <?php if (count(get_data('libraries'))) :?>
                <libraries>
                    <?php foreach (get_data('libraries') as $lib) :?>
                        <lib id="<?=$lib?>"/>
                    <?php endforeach;?>
                </libraries>
            <?php endif;?>
            <?php if (count(get_data('stylesheets'))) :?>
                <stylesheets>
                    <?php foreach (get_data('stylesheets') as $stylesheet) :?>
                        <link href="<?=$stylesheet?>" type="text/css" title="base"/>
                    <?php endforeach;?>
                </stylesheets>
            <?php endif;?>
            <?php if (count(get_data('mediaFiles'))) :?>
                <mediaFiles>
                    <?php foreach (get_data('mediaFiles') as $file) :?>
                        <file src="<?=$file?>"/>
                    <?php endforeach;?>
                </mediaFiles>
            <?php endif;?>
        </resources>
        <?=get_data('serializedProperties')?>
        <markup xmlns="http://www.w3.org/1999/xhtml">
            <?=get_data('markup')?>
        </markup>
    </portableCustomInteraction>
</customInteraction>
