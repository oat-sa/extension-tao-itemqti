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

namespace oat\taoQtiItem\model\import\Template;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\ItemImportResult;
use oat\taoQtiItem\model\import\ItemInterface;
use oat\taoQtiItem\model\import\TemplateInterface;
use Renderer;

class ItemsQtiTemplateRender2 extends ConfigurableService implements ItemsTemplateRenderInterface
{
    /** @var Renderer */
    private $renderer;

    public function processItem(ItemInterface $item, TemplateInterface $xmlQtiTemplate): string
    {
        $renderer = $this->getRenderer();

        $renderer->setTemplate($xmlQtiTemplate->getQtiTemplate());
        $renderer->setMultipleData(
            [
                'choices' => $item->getChoices(),
                'language' => $item->getLanguage(),
                'maxChoices' => $item->getMaxChoices(),
                'maxScore' => $item->getMaxScore(),
                'metaData' => $item->getMetadata(),
                'minChoices' => $item->getMinChoices(),
                'name' => $item->getName(),
                'question' => $item->getQuestion(),
                'shuffle' => $item->isShuffle() ? 'true' : 'false',
            ]
        );
        return $renderer->render();
    }

    private function isMatchCorrect(ItemInterface $item): bool
    {
        // match_correct: In case there is just one choice_N_score, the score will be considered match_correct
    }

    private function isMapResponse(ItemInterface $item): bool
    {
        // map_response: In case there is more than one choice_N_score.
    }

    private function isNoneResponse(ItemInterface $item): bool
    {
        /*
            WHEN choice_1_score…choice_N_score and correct_answer are all empty
            THEN system shall
            consider this as warning
            set Response Processing to none (survey use case)
            set MAXSCORE to 0
        */
    }

    private function getMaxScore(ItemInterface $item): bool
    {
        /*
        MAXSCORE:

        If max_choices = 0 (unlimited), it will be the sum of all choice_N_score without include negative values.
        If max_choices = 1, it will be the higher choice_N_score value.
        If max_choices = 2..N, it will be higher possible sum of choice_N_score.

        WHEN choice_1_score … choice_N_score and correct_answer are ALL EMPTY
            THEN system shall consider this as warning
            set Response Processing to none (survey use case)
            set MAXSCORE to 0
        */
    }

    public function processResultSet(ItemImportResult $itemResults, TemplateInterface $xmlQtiTemplate): iterable
    {
        $result = [];
        foreach ($itemResults->getItems() as $lineNumber => $item) {
            $result[$lineNumber] = $this->processItem($item, $xmlQtiTemplate);
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
