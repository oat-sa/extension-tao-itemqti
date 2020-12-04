define([
	'taoQtiItem/portableLib/jquery_2_1_1',
	'taoQtiItem/portableLib/lodash'
], function ($, _) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    _ = _ && _.hasOwnProperty('default') ? _['default'] : _;

    var video = {
    	category: "media",
    	mimes: [
    		"application/ogg",
    		"video/*"
    	],
    	extensions: [
    		"avi",
    		"mp4",
    		"ogg",
    		"mpeg",
    		"flv"
    	]
    };
    var audio = {
    	category: "media",
    	mimes: [
    		"audio/*"
    	],
    	extensions: [
    		"mp3",
    		"wav",
    		"aac"
    	]
    };
    var image = {
    	category: "media",
    	mimes: [
    		"image/*",
    		"application/x-gzip"
    	],
    	extensions: [
    		"png",
    		"jpg",
    		"jpeg",
    		"gif",
    		"svg",
    		"svgz",
    		"ico"
    	]
    };
    var flash = {
    	category: "media",
    	mimes: [
    		"application/x-shockwave-flash"
    	],
    	extensions: [
    		"flv",
    		"swf"
    	]
    };
    var geogebra = {
    	category: "media",
    	mimes: [
    		"application/vnd.geogebra.file",
    		"application/vnd.geogebra.tool"
    	],
    	extensions: [
    		"ggb",
    		"ggt"
    	]
    };
    var rdf = {
    	category: "sources",
    	mimes: [
    		"application/rdf+xml"
    	],
    	extensions: [
    		"rdf"
    	]
    };
    var xml = {
    	category: "sources",
    	mimes: [
    		"application/xml",
    		"application/xml-dtd",
    		"text/xml"
    	],
    	extensions: [
    		"xml",
    		"dtd",
    		"qti"
    	]
    };
    var html = {
    	category: "sources",
    	mimes: [
    		"text/html",
    		"text/xhtml",
    		"application/xhtml+xml",
    		"application/qti+xml"
    	],
    	extensions: [
    		"html",
    		"htm",
    		"html5",
    		"xhtml"
    	]
    };
    var font = {
    	category: "sources",
    	mimes: [
    		"application/font-woff"
    	],
    	extensions: [
    		"woff",
    		"eot",
    		"ttf"
    	]
    };
    var js = {
    	category: "sources",
    	mimes: [
    		"application/javascript",
    		"application/json",
    		"text/javascript"
    	],
    	extensions: [
    		"js",
    		"json"
    	]
    };
    var css = {
    	category: "sources",
    	mimes: [
    		"text/css"
    	],
    	extensions: [
    		"css",
    		"sass",
    		"scss",
    		"less"
    	]
    };
    var shell = {
    	category: "sources",
    	mimes: [
    		"application/x-sh"
    	],
    	extensions: [
    		"sh"
    	]
    };
    var mathml = {
    	category: "sources",
    	mimes: [
    		"application/mathml+xml"
    	],
    	extensions: [
    		"mathml"
    	]
    };
    var pdf = {
    	category: "document",
    	mimes: [
    		"application/pdf"
    	],
    	extensions: [
    		"pdf"
    	]
    };
    var office = {
    	category: "document",
    	mimes: [
    		"application/vnd.oasis.opendocument.text",
    		"application/vnd.oasis.opendocument.spreadsheet",
    		"application/vnd.oasis.opendocument.presentation",
    		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
    		"application/vnd.ms-powerpoint",
    		"application/vnd.ms-excel",
    		"application/msword"
    	],
    	extensions: [
    		"doc",
    		"odt",
    		"docx",
    		"xls",
    		"xlsx",
    		"ods",
    		"ppt",
    		"pptx",
    		"odp"
    	]
    };
    var text = {
    	category: [
    		"document"
    	],
    	mimes: [
    		"text/*"
    	],
    	extensions: [
    		"txt",
    		"csv"
    	]
    };
    var archive = {
    	category: "archive",
    	mimes: [
    		"application/zip",
    		"application/gzip",
    		"application/rar",
    		"application/x-7z-compressed",
    		"application/x-bzip",
    		"application/x-bzip2"
    	],
    	extensions: [
    		"zip",
    		"gz",
    		"bz",
    		"bz2",
    		"rar",
    		"p7z",
    		"7z"
    	]
    };
    var generic = {
    	category: "generic",
    	mimes: [
    		"application/octet-stream",
    		"application/force-download",
    		"application/x-force-download"
    	]
    };
    var cpp = {
    	category: "sources",
    	mimes: [
    		"text/x-c"
    	],
    	extensions: [
    		"cpp"
    	]
    };
    var pas = {
    	category: "sources",
    	mimes: [
    		"text/pascal"
    	],
    	extensions: [
    		"pas"
    	]
    };
    var categories = {
    	video: video,
    	audio: audio,
    	image: image,
    	flash: flash,
    	geogebra: geogebra,
    	rdf: rdf,
    	xml: xml,
    	html: html,
    	font: font,
    	js: js,
    	css: css,
    	shell: shell,
    	mathml: mathml,
    	pdf: pdf,
    	office: office,
    	text: text,
    	archive: archive,
    	generic: generic,
    	cpp: cpp,
    	pas: pas
    };

    var txt = "text/plain";
    var htm = "text/html";
    var html$1 = "text/html";
    var xhtml = "application/xhtml+xml";
    var php = "text/html";
    var css$1 = "text/css";
    var js$1 = "application/javascript";
    var json = "application/json";
    var xml$1 = "text/xml";
    var rdf$1 = "text/xml";
    var swf = "application/x-shockwave-flash";
    var flv = "video/x-flv";
    var csv = "text/csv";
    var rtx = "text/richtext";
    var png = "image/png";
    var jpe = "image/jpeg";
    var jpeg = "image/jpeg";
    var jpg = "image/jpeg";
    var gif = "image/gif";
    var bmp = "image/bmp";
    var ico = "image/vnd.microsoft.icon";
    var tiff = "image/tiff";
    var tif = "image/tiff";
    var svg = "image/svg+xml";
    var svgz = "image/svg+xml";
    var zip = "application/zip";
    var rar = "application/x-rar-compressed";
    var exe = "application/x-msdownload";
    var msi = "application/x-msdownload";
    var cab = "application/vnd.ms-cab-compressed";
    var mp3 = "audio/mpeg";
    var oga = "audio/ogg";
    var ogg = "audio/ogg";
    var aac = "audio/aac";
    var qt = "video/quicktime";
    var mov = "video/quicktime";
    var mp4 = "video/mp4";
    var webm = "video/webm";
    var ogv = "video/ogg";
    var pdf$1 = "application/pdf";
    var psd = "image/vnd.adobe.photoshop";
    var ai = "application/postscript";
    var eps = "application/postscript";
    var ps = "application/postscript";
    var doc = "application/msword";
    var rtf = "application/rtf";
    var xls = "application/vnd.ms-excel";
    var ppt = "application/vnd.ms-powerpoint";
    var odt = "application/vnd.oasis.opendocument.text";
    var ods = "application/vnd.oasis.opendocument.spreadsheet";
    var woff = "application/x-font-woff";
    var eot = "application/vnd.ms-fontobject";
    var ttf = "application/x-font-ttf";
    var cpp$1 = "text/x-c";
    var pas$1 = "text/pascal";
    var extensions = {
    	txt: txt,
    	htm: htm,
    	html: html$1,
    	xhtml: xhtml,
    	php: php,
    	css: css$1,
    	js: js$1,
    	json: json,
    	xml: xml$1,
    	rdf: rdf$1,
    	swf: swf,
    	flv: flv,
    	csv: csv,
    	rtx: rtx,
    	png: png,
    	jpe: jpe,
    	jpeg: jpeg,
    	jpg: jpg,
    	gif: gif,
    	bmp: bmp,
    	ico: ico,
    	tiff: tiff,
    	tif: tif,
    	svg: svg,
    	svgz: svgz,
    	zip: zip,
    	rar: rar,
    	exe: exe,
    	msi: msi,
    	cab: cab,
    	mp3: mp3,
    	oga: oga,
    	ogg: ogg,
    	aac: aac,
    	qt: qt,
    	mov: mov,
    	mp4: mp4,
    	webm: webm,
    	ogv: ogv,
    	pdf: pdf$1,
    	psd: psd,
    	ai: ai,
    	eps: eps,
    	ps: ps,
    	doc: doc,
    	rtf: rtf,
    	xls: xls,
    	ppt: ppt,
    	odt: odt,
    	ods: ods,
    	woff: woff,
    	eot: eot,
    	ttf: ttf,
    	cpp: cpp$1,
    	pas: pas$1
    };

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
     * Copyright (c) 2014-2019 Open Assessment Technologies SA ;
     */
    /**
     * Helps you to retrieve file type and categories based on a file mime type
     * @exports core/mimetype
     */

    var mimetypeHelper = {
      /**
       * Gets the MIME type of a resource.
       *
       * @param {String} url - The URL of the resource to get type of
       * @param {Function} [callback] - An optional function called when the response is received.
       *                                This callback must accept 2 arguments:
       *                                the first is the potential error if the request failed,
       *                                the second is the MIME type if the request succeed.
       * @returns {mimetype}
       */
      getResourceType: function getResourceType(url, callback) {
        $.ajax({
          type: 'HEAD',
          async: true,
          url: url,
          success: function onSuccess(message, text, jqXHR) {
            var mime = jqXHR.getResponseHeader('Content-Type');

            if (callback) {
              callback(null, mime);
            }
          },
          error: function onError(jqXHR) {
            var error = jqXHR.status || 404;

            if (callback) {
              callback(error);
            }
          }
        });
        return this;
      },

      /**
       * Get the type from a mimeType regarding the mimeMapping above
       * @param {Object} file - the file
       * @param {String} [file.mime] - the mime type
       * @param {String} [file.name] - the file name
       * @returns {String} the type
       */
      getFileType: function getFileType(file) {
        var type;
        var mime = file.mime;
        var ext;

        if (mime) {
          //lookup for exact mime
          type = _.findKey(categories, {
            mimes: [mime]
          }); //then check  with star

          if (!type) {
            type = _.findKey(categories, {
              mimes: [mime.replace(/\/.*$/, '/*')]
            });
          }
        } //try by extension


        if (!type) {
          ext = getFileExtension(file.name);

          if (ext) {
            type = _.findKey(categories, {
              extensions: [ext]
            });
          }
        }

        return type;
      },

      /**
       * Check if a given mime type matches some filters
       * @param {String} type - the mime type
       * @param {String[]} filters - the validTypes
       * @returns {String} category
       */
      match: function match(type, validTypes) {
        // Under rare circumstances a browser may report the mime type
        // with quotes (e.g. "application/foo" instead of application/foo)
        var checkType = type.replace(/^["']+|['"]+$/g, '');
        var starType = checkType.replace(/\/.*$/, '/*');
        return _.contains(validTypes, checkType) || _.contains(validTypes, starType);
      },

      /**
       * Get the category of a type
       * @param {String} type
       * @returns {String} category
       */
      getCategory: function getCategory(type) {
        if (categories[type]) {
          return categories[type].category;
        }
      },

      /**
       * Get mime type from a File object
       * It first based the detection on the standard type File.type property
       * If the returned type is empty or in a generic application/octet-stream, it will use its extension.
       * If the extension is unknown, the property File.type is returned anyway.
       *
       * @param {File} file
       * @returns {String} the mime type
       */
      getMimeType: function getMimeType(file) {
        var ext,
            type = file.type,
            category = mimetypeHelper.getFileType({
          name: file.name,
          mime: type
        });

        if (type && !type.match(/invalid/) && category !== 'generic') {
          return type;
        } else {
          ext = getFileExtension(file.name);

          if (ext && extensions[ext]) {
            return extensions[ext];
          }
        }

        return type;
      }
    };
    /**
     * Get the file extension from the file name
     *
     * @param {String} fileName
     * @returns {String}
     */

    function getFileExtension(fileName) {
      var extMatch = fileName.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);

      if (extMatch && extMatch.length > 1) {
        return extMatch[1];
      }
    }

    return mimetypeHelper;

});
