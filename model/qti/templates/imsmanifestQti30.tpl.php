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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */
// phpcs:ignoreFile
?>

<manifest
        xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqtiv3p0_imscpv1p2_v1p0.xsd
                        http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
        identifier="<?php echo $manifestIdentifier; ?>">
    <metadata>
        <schema>QTI Item</schema>
        <schemaversion>3.0.0</schemaversion>
    </metadata>
    <organizations/>
    <resources>
        <?php foreach ($qtiItems as $qtiItem) : ?>
        <resource
            identifier="<?php echo $qtiItem['identifier']; ?>"
            type="imsqti_item_xmlv3p0"
            href="<?php echo str_replace(DIRECTORY_SEPARATOR, '/', $qtiItem['filePath']); ?>">
            <file href="<?php echo str_replace(DIRECTORY_SEPARATOR, '/', $qtiItem['filePath']);?>"/>
            <?php foreach ($qtiItem['medias'] as $media) :?>
            <file href="<?php echo str_replace(DIRECTORY_SEPARATOR, '/', $media);?>"/>
            <?php endforeach ?>
        </resource>
        <?php endforeach ?>
    </resources>
</manifest>
