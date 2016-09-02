<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:22
 */

namespace oat\taoQtiItem\model\portableElement\base\asset;


abstract class AbstractPortableElementAsset
{

    /**
     * @var string mimeType
     */
    protected $type;

    /**
     * @var string
     */
    protected $fileName;

    /**
     * @var string
     */
    protected $path;

    /**
     * @var resource
     */
    protected $stream;
    
    /**
     * return mime type
     * @return string
     */
    public function getType() {
        return $this->type;
    }
    
    /**
     * return file name
     * @return string
     */
    public function getFileName() {
        return $this->fileName;
    }
    
    /**
     * return full absolute path to asset file
     * @return string
     */  
    public function getPath() {
        return $this->path;
    }
    
    /**
     * return stream
     * @return type
     */
    public function getStream() {
        return $this->stream;
    }
    
    /**
     * set up mime type
     * @param string $type
     * @return \oat\taoQtiItem\model\portableElement\base\asset\AbstractPortableElementAsset
     */
    public function setType($type) {
        $this->type = $type;
        return $this;
    }
    
    /**
     * setup filename
     * @param string $fileName
     * @return \oat\taoQtiItem\model\portableElement\base\asset\AbstractPortableElementAsset
     */
    public function setFileName($fileName) {
        $this->fileName = $fileName;
        return $this;
    }
    
    /**
     * set up full absolute path to asset file
     * @param string $path
     * @return \oat\taoQtiItem\model\portableElement\base\asset\AbstractPortableElementAsset
     */
    public function setPath($path) {
        $this->path = $path;
        return $this;
    }
    
    /**
     * set up file stream
     * @param type $stream
     * @return \oat\taoQtiItem\model\portableElement\base\asset\AbstractPortableElementAsset
     */
    public function setStream($stream) {
        $this->stream = $stream;
        return $this;
    }



}