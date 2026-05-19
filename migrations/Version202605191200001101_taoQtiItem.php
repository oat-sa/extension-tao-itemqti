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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\generis\model\OntologyRdfs;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\qti\metadata\guardians\ItemLabelMetadataGuardian;

final class Version202605191200001101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Register service ' . ItemLabelMetadataGuardian::class;
    }

    public function up(Schema $schema): void
    {
        $this->getServiceManager()->register(ItemLabelMetadataGuardian::SERVICE_ID, new ItemLabelMetadataGuardian([
            ItemLabelMetadataGuardian::OPTION_EXPECTED_PATHS => [
                [OntologyRdfs::RDFS_LABEL],
                [
                    'http://ltsc.ieee.org/xsd/LOM#lom',
                    OntologyRdfs::RDFS_LABEL,
                ],
            ],
            ItemLabelMetadataGuardian::OPTION_PROPERTY_URI => OntologyRdfs::RDFS_LABEL,
        ]));
    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(ItemLabelMetadataGuardian::SERVICE_ID);
    }
}
