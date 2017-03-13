<?php

namespace oat\taoQtiItem\model\qti\metadata\extractors\ontology;

use oat\generis\model\OntologyAwareTrait;
use oat\taoQtiItem\model\qti\metadata\extractors\LomMetadataExtractor;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class LiteralPropertyExtractor extends LomMetadataExtractor
{
    use OntologyAwareTrait;

    protected $path;
    protected $property;

    public function __construct(array $path, $property)
    {
        if (count($path) === 0) {
            throw new \InvalidArgumentException(__('The path argument for extractor must be a non-empty array.'));
        }
        $this->path     = $path;
        $this->property = is_string($property) ? $this->getProperty($property) : $property;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function extract($resource)
    {
        if (! $resource instanceof \core_kernel_classes_Resource) {
            throw new MetadataExtractionException(__('The given target is not an instance of core_kernel_classes_Resource'));
        }

        $value = $resource->getOnePropertyValue($this->property)->literal;

        if (is_null($value)) {
            return [];
        }

        return array(
            new SimpleMetadataValue($resource->getUri(), $this->path, $value)
        );
    }
}