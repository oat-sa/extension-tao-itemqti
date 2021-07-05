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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Validator\Rule;

use core_kernel_classes_Resource;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\Validator\WarningValidationException;
use tao_helpers_I18n;
use tao_models_classes_LanguageService;

class SupportedLanguageRule extends ConfigurableService implements ValidationRuleInterface
{
    /** @var array */
    private $languages;

    /**
     * @inheritDoc
     */
    public function validate(string $column, $value, $rules = null, array $context = []): void
    {
        if (false === array_search(strtolower($value), $this->getLanguages())) {
            $exception = new WarningValidationException(
                '`%s` is invalid',
                [
                    $column,
                ]
            );

            $exception->setColumn($column);

            throw $exception;
        }
    }

    private function getLanguages(): array
    {
        if (null === $this->languages) {
            $this->languages = array_map(
                'strtolower',
                array_keys(
                    tao_helpers_I18n::getAvailableLangsByUsage(
                        new core_kernel_classes_Resource(
                            tao_models_classes_LanguageService::INSTANCE_LANGUAGE_USAGE_GUI
                        )
                    )
                )
            );
        }
        return $this->languages;
    }
}
