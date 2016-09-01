<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:13
 */

namespace oat\taoQtiItem\model\portableElement\base;


use oat\taoQtiItem\model\portableElement\base\helper\FileSystemAwareInterface;
use oat\taoQtiItem\model\portableElement\base\helper\FileSystemAwareTrait;

abstract class AbstractPortableElement implements FileSystemAwareInterface
{

    use FileSystemAwareTrait;

    /**
     * @var AbstractPortableElementManifest
     */
    protected $manifest;

    /**
     * @var AbstractPortableElementAssetManager
     */
    protected $assets;

    /**
     * @var AbstractPortableElementExporter
     */
    protected $exporter;

    /**
     * @var AbstractPortableElementImporter
     */
    protected $importer;

    /**
     * @var AbstractPortableElementValidator
     */
    protected $validator;

    /**
     * @param \DOMElement $element
     * @return $this
     */
    abstract public function hydrateFromElement(\DOMElement $element);

    /**
     * @param array $data
     * @return $this
     */
    abstract public function hydrateFromData(array $data);

    /**
     * @param string $path
     * @return $this
     */
    abstract public function loadFromPath($path);

    /**
     * export this element
     * @return mixed
     */
    public function export() {
        return $this->exporter->export($this);
    }

    /**
     * import this element
     * @return mixed
     */
    public function import() {
        return $this->importer->import($this);
    }

    public function isValid() {
        return $this->validator->isValid($this);
    }

    /**
     * @return AbstractPortableElementAssetManager
     */
    public function getAssets()
    {
        return $this->assets;
    }

    /**
     * @return AbstractPortableElementManifest
     */
    public function getManifest()
    {
        return $this->manifest;
    }



}