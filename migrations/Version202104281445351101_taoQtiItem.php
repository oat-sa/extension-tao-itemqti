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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\qti\metadata\guardians\ItemMetadataGuardian;

final class Version202104281445351101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Register service ' . ItemMetadataGuardian::class;
    }

    public function up(Schema $schema): void
    {
        $this->getServiceManager()->register(ItemMetadataGuardian::SERVICE_ID, new ItemMetadataGuardian([
            ItemMetadataGuardian::OPTION_EXPECTED_PATH => [
                'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
            ],
            ItemMetadataGuardian::OPTION_PROPERTY_URI => 'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier',
        ]));
    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(ItemMetadataGuardian::SERVICE_ID);
    }
}
