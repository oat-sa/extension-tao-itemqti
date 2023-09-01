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
 * Copyright (c) 2021-2023 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Template;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\ItemImportResult;
use oat\taoQtiItem\model\import\ItemInterface;
use oat\taoQtiItem\model\import\Decorator\CvsToQtiTemplateDecorator;
use oat\taoQtiItem\model\import\ProcessedItemResult;
use oat\taoQtiItem\model\import\TemplateInterface;
use Renderer;

class ItemsQtiTemplateRender extends ConfigurableService implements ItemsTemplateRenderInterface
{
    /** @var Renderer */
    private $renderer;

    public function processItem(ItemInterface $item, TemplateInterface $xmlQtiTemplate): string
    {
        $renderer = $this->getRenderer();

        $decorator = new CvsToQtiTemplateDecorator($xmlQtiTemplate);

        $templatePath = $decorator->getQtiTemplatePath($item);

        $correctChoices = $item->getCorrectChoices();

        $renderer->setTemplate($templatePath);
        $renderer->setMultipleData(
            [
                'isMapResponse' => $item->isMapResponse(),
                'isMatchCorrectResponse' => $item->isMatchCorrectResponse(),
                'isNoneResponse' => $item->isNoneResponse(),
                'choices' => $item->getChoices(),
                'hasCorrectChoices' => !empty($correctChoices),
                'correctChoices' => $correctChoices,
                'language' => $item->getLanguage(),
                'maxChoices' => $item->getMaxChoices(),
                'maxScore' => $item->getMaxScore(),
                'metaData' => $item->getMetadata(),
                'minChoices' => $item->getMinChoices(),
                'name' => $item->getName(),
                'question' => $item->getQuestion(),
                'shuffle' => $item->isShuffle() ? 'true' : 'false',
                'responseDeclarationCardinality' => $item->getMaxChoices() === 1 ? 'single' : 'multiple',
                'outcomeDeclarationScoreCardinality' => 'single',
                'outcomeDeclarationMaxScoreCardinality' => 'single'
            ]
        );

        return $renderer->render();
    }

    /**
     * @return iterable<ProcessedItemResult>
     */
    public function processResultSet(ItemImportResult $itemResults, TemplateInterface $xmlQtiTemplate): iterable
    {
        $result = [];
        foreach ($itemResults->getItems() as $lineNumber => $item) {
            $result[$lineNumber] = new ProcessedItemResult(
                $this->processItem($item, $xmlQtiTemplate),
                $item->getMetadata()
            );
        }

        return $result;
    }

    public function withRenderer(Renderer $renderer): self
    {
        $this->renderer = $renderer;
        return $this;
    }

    private function getRenderer(): Renderer
    {
        if (!$this->renderer) {
            $this->renderer = new Renderer();
        }
        return $this->renderer;
    }
}
