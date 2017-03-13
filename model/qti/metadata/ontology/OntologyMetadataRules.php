<?php

namespace oat\taoQtiItem\model\qti\metadata\ontology;

use oat\taoQtiItem\model\qti\metadata\LomMetadata;

class OntologyMetadataRules
{
    /**
     * @var LomMetadata[]
     */
    protected $rules = [];

    protected function addRule(LomMetadata $rule)
    {
        $pathKey = $this->transformPath($rule->getPath());
        if (! $this->hasRule($pathKey)) {
            $this->rules[$pathKey] = array();
        }

        $this->rules[$pathKey][] = $rule;
    }

    protected function hasRule($path)
    {
        return isset($this->rules[$this->transformPath($path)]);
    }

    protected function serializePath(array $path)
    {
        return implode('->', $path);
    }

    protected function transformPath($path)
    {
        if (is_array($path)) {
            $path = $this->serializePath($path);
        }
        return $path;
    }
}