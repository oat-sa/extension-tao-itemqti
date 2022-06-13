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
 *
 * @author Sergei Mikhailov <sergei.mikhailov@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiItem\install\scripts;

use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\QtiCreator\ExtendedTextInteractionConfigurationRegistry;

/**
 * Run the following to enable Math Entry format option
 * php index.php 'oat\taoQtiItem\install\scripts\SetupExtendedTextInteractionConfigurationRegistry' -m 1
 *
 * Run the following to disable Math Entry format option
 * php index.php 'oat\taoQtiItem\install\scripts\SetupExtendedTextInteractionConfigurationRegistry' -m 0
 *
 * @deprecated This configuration will only be handled by featureFlag by default is always false
 */
class SetupExtendedTextInteractionConfigurationRegistry extends ScriptAction
{
    public const HAS_MATH = 'math';

    /** @var ExtendedTextInteractionConfigurationRegistry */
    private $registry;

    protected function provideOptions(): array
    {
        return [
            self::HAS_MATH => [
                'prefix'      => 'm',
                'longPrefix'  => self::HAS_MATH,
                'description' => 'Enables / disables Math entry on extended text interactions',
            ],
        ];
    }

    protected function provideDescription(): string
    {
        return sprintf('Sets `%s` values.', ExtendedTextInteractionConfigurationRegistry::class);
    }

    protected function run(): Report
    {
        $this->registry = $this->propagate(new ExtendedTextInteractionConfigurationRegistry());

        if ($this->hasOption(self::HAS_MATH)) {
            $this->registry->setHasMath(
                (bool)$this->getOption(self::HAS_MATH)
            );
        }

        return $this->createReport();
    }

    private function createReport(): Report
    {
        $setValues = $this->registry->get(ExtendedTextInteractionConfigurationRegistry::ID);

        return $setValues
            ? Report::createSuccess(
                sprintf(
                    "Applied the following configuration to `%s`\n%s",
                    ExtendedTextInteractionConfigurationRegistry::class,
                    json_encode($setValues)
                )
            )
            : Report::createError(
                sprintf('No values set to `%s`', ExtendedTextInteractionConfigurationRegistry::class)
            );
    }
}
