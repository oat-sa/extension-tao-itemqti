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
 * Copyright (c) 2022  (original work) Open Assessment Technologies SA;
 *
 * @author Gabriel Felipe Soares <gabriel.felipe.soares@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\reporting\Report;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\QtiCreator\ExtendedTextInteractionConfigurationRegistry;

final class Version202205181148531101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Removes base64 data pattern from item compilation asset blacklist.';
    }

    public function up(Schema $schema): void
    {
        $registry = $this->propagate(new ExtendedTextInteractionConfigurationRegistry());
        $registry->setHasMath(false);

        $setValues = $registry->get(ExtendedTextInteractionConfigurationRegistry::ID);

        if ($setValues) {
            $this->addReport(
                Report::createSuccess(
                    sprintf(
                        "Applied the following configuration to `%s`\n%s",
                        ExtendedTextInteractionConfigurationRegistry::class,
                        json_encode($setValues)
                    )
                )
            );

            return;
        }

        $this->addReport(
            Report::createError(
                sprintf('No values set to `%s`', ExtendedTextInteractionConfigurationRegistry::class)
            )
        );
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }
}
