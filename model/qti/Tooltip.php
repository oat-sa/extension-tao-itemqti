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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Christophe Noël <christophe@taotesting.com>
 */

namespace oat\taoQtiItem\model\qti;

use oat\taoQtiItem\model\qti\container\ContainerTooltip;
use oat\taoQtiItem\model\qti\container\FlowContainer;

class Tooltip extends Element implements FlowContainer
{
    protected static $qtiTagName = '_tooltip';
    protected $content = '';
    protected $body = null;

    public function __construct($attributes, Item $relatedItem = null, $serial = '')
    {
        parent::__construct($attributes, $relatedItem, $serial);
        $this->body = new ContainerTooltip();
    }

    public function getUsedAttributes()
    {
        return [];
    }

    public function getSerial()
    {
        return '_' . parent::getSerial();
    }

    public function getContent()
    {
        return $this->content;
    }

    public function setContent($content)
    {
        if (empty($content)) {
            $content = strval($content);
        }
        if (is_string($content)) {
            $this->content = $content;
        } else {
            throw new InvalidArgumentException('a Tooltip content can only be text');
        }
    }

    /**
     * Add tooltip id & content to template variables
     */
    protected function getTemplateQtiVariables()
    {
        // this is necessary because the QTI template gets a serialized string for attributes and cannot address a
        // specific attribute
        $tooltipId = $this->getAttributeValue('aria-describedby');

        $variables = parent::getTemplateQtiVariables();
        $variables['tooltipId'] = $tooltipId;
        $variables['content'] = (string) $this->getContent();
        return $variables;
    }

    /**
     * Add tooltip content to element serialization
     */
    public function toArray($filterVariableContent = false, &$filtered = [])
    {
        $returnValue = parent::toArray($filterVariableContent, $filtered);
        $returnValue['content'] = (string) $this->getContent();
        return $returnValue;
    }

    public function getBody()
    {
        return $this->body;
    }
}
