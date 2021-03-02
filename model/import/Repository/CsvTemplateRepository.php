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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Repository;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\TemplateInterface;

class CsvTemplateRepository extends ConfigurableService implements TemplateRepositoryInterface
{
    public const OPTION_TEMPLATES = 'templates';

    public function findById(string $id): ?TemplateInterface
    {
        if ($id === self::DEFAULT) {
            return new CsvTemplate(
                TemplateRepositoryInterface::DEFAULT,
                TemplateRepositoryInterface::DEFAULT_DEFINITION
            );
        }

        foreach ($this->getTemplates() as $template) {
            if ($template['id'] === $id) {
                return new CsvTemplate($template['id'], $template['definition']);
            }
        }

        return null;
    }

    private function getTemplates(): array
    {
        return $this->getOption(self::OPTION_TEMPLATES, []);
    }
}
