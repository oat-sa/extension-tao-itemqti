/**
 * Gap text choice tile sizing for the graphic gap match source bay (authoring).
 */
define(['jquery', 'i18n'], function ($, __) {
    'use strict';

    const GAP_TEXT_MAX_TILE_WIDTH = 150;
    const GAP_TEXT_MIN_TILE_WIDTH = 75;
    const GAP_TEXT_MIN_TILE_HEIGHT = 60;
    /** @see $ggm-text-choice-inner-padding in qtiCreator/_graphic-gap.scss (sum of both sides) */
    const GAP_TEXT_TILE_PADDING = 16;
    const GAP_TEXT_MAX_CHARS = 350;
    const GAP_TEXT_FONT_SIZE = 14;
    const GAP_TEXT_LINE_HEIGHT = 1.25;

    function normalizeGapTextTileLabel(label) {
        const normalizedLabel = (label || '').trim();

        if (!normalizedLabel || normalizedLabel === __('New label')) {
            return '';
        }

        return normalizedLabel;
    }

    function getPlainLabelFromGapText(gapText) {
        if (!gapText || typeof gapText.body !== 'function') {
            return '';
        }

        return normalizeGapTextTileLabel(
            $('<div/>')
                .html(gapText.body() || '')
                .text()
                .trim()
        );
    }

    /**
     * Source-bay DOM for a gap text choice (textarea + wrap), shared by Sleep and Question states.
     *
     * @param {jQuery} $gapTextBox
     * @param {String} label
     */
    function mountGapTextTileLabel($gapTextBox, label) {
        $gapTextBox.empty();

        const $wrap = $('<div class="gap-text-label-wrap"/>');
        const $textarea = $('<textarea class="gap-text-label"/>')
            .attr('aria-label', __('Label'))
            .attr('placeholder', __('Enter text'))
            .attr('rows', 1)
            .attr('maxlength', GAP_TEXT_MAX_CHARS)
            .prop('readonly', true)
            .val(normalizeGapTextTileLabel(label));

        $wrap.append($textarea);
        $gapTextBox.append($wrap);
    }

    function mountGapTextTileFromModel($gapTextBox, gapText) {
        mountGapTextTileLabel($gapTextBox, getPlainLabelFromGapText(gapText));
    }

    function measureSampleTextWidth(sampleText, $context) {
        const $probeHost = $context && $context.length ? $context : $('body');
        const $measure = $('<span/>').css({
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'pre',
            fontFamily: $probeHost.css('font-family'),
            fontSize: `${GAP_TEXT_FONT_SIZE}px`,
            lineHeight: GAP_TEXT_LINE_HEIGHT,
            fontWeight: $probeHost.css('font-weight'),
            fontStyle: $probeHost.css('font-style'),
            letterSpacing: $probeHost.css('letter-spacing')
        }).text(sampleText || ' ');

        $('body').append($measure);
        const measured = Math.ceil($measure.outerWidth());
        $measure.remove();

        return measured;
    }

    function getLongestLine(text) {
        return (text || '')
            .split('\n')
            .reduce(function (longest, line) {
                return line.length > longest.length ? line : longest;
            }, '');
    }

    function resolveTileWidth(text, hasHardLineBreak) {
        const contentWidth = measureSampleTextWidth(getLongestLine(text) || ' ', null) + GAP_TEXT_TILE_PADDING;
        const wraps = hasHardLineBreak || contentWidth > GAP_TEXT_MAX_TILE_WIDTH;

        if (wraps) {
            return GAP_TEXT_MAX_TILE_WIDTH;
        }

        return Math.min(GAP_TEXT_MAX_TILE_WIDTH, Math.max(GAP_TEXT_MIN_TILE_WIDTH, contentWidth));
    }

    function isGapTextTileExpanded($gapTextBox) {
        return $gapTextBox.closest('.widget-box.edit-question').length > 0;
    }

    function applyTileDimensions($gapTextBox, tileWidth, tileHeight, expanded) {
        $gapTextBox[0].style.setProperty('width', `${tileWidth}px`, 'important');
        $gapTextBox[0].style.setProperty('min-width', `${GAP_TEXT_MIN_TILE_WIDTH}px`, 'important');
        $gapTextBox[0].style.setProperty('max-width', `${GAP_TEXT_MAX_TILE_WIDTH}px`, 'important');
        $gapTextBox[0].style.setProperty('height', `${tileHeight}px`, 'important');
        $gapTextBox[0].style.setProperty('min-height', `${GAP_TEXT_MIN_TILE_HEIGHT}px`, 'important');
        $gapTextBox[0].style.setProperty(
            'max-height',
            expanded ? 'none' : `${tileHeight}px`,
            'important'
        );
        $gapTextBox[0].style.setProperty('flex-shrink', '0', 'important');
        $gapTextBox.attr('data-gap-text-tile-width', tileWidth);
        $gapTextBox.toggleClass('gap-text-tile-expanded', expanded);
    }

    function getGapTextLineHeightPx($textarea) {
        const textareaEl = $textarea[0];

        if (!textareaEl || !window.getComputedStyle) {
            return Math.ceil(GAP_TEXT_FONT_SIZE * GAP_TEXT_LINE_HEIGHT);
        }

        const styles = window.getComputedStyle(textareaEl);
        const lineHeight = parseFloat(styles.lineHeight);

        if (!Number.isNaN(lineHeight) && lineHeight > 0) {
            return Math.ceil(lineHeight);
        }

        const fontSize = parseFloat(styles.fontSize) || GAP_TEXT_FONT_SIZE;

        return Math.ceil(fontSize * GAP_TEXT_LINE_HEIGHT);
    }

    function measureTextareaContentHeight($textarea, textareaEl) {
        const lineHeightPx = getGapTextLineHeightPx($textarea);
        const previousHeight = textareaEl.style.height;
        const previousMinHeight = textareaEl.style.minHeight;

        $textarea.css({
            width: '100%',
            height: '0',
            minHeight: '0',
            overflowY: 'hidden'
        });

        const measuredHeight = Math.max(lineHeightPx, textareaEl.scrollHeight);

        textareaEl.style.height = previousHeight;
        textareaEl.style.minHeight = previousMinHeight;

        return measuredHeight;
    }

    function normalizeGapTextValue(value) {
        return (value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    function syncGapTextTileSize($gapTextBox) {
        if (!$gapTextBox || !$gapTextBox.length) {
            return;
        }

        const expanded = isGapTextTileExpanded($gapTextBox);
        const $textarea = $gapTextBox.find('.gap-text-label');
        const textareaEl = $textarea[0];
        let tileWidth;
        let tileHeight = GAP_TEXT_MIN_TILE_HEIGHT;
        let normalizedValue;
        let textareaHeight;

        if ($textarea.length && textareaEl) {
            normalizedValue = normalizeGapTextValue(textareaEl.value || '');
            tileWidth = resolveTileWidth(normalizedValue, normalizedValue.indexOf('\n') !== -1);

            $gapTextBox[0].style.setProperty('width', `${tileWidth}px`, 'important');

            if (expanded) {
                textareaHeight = measureTextareaContentHeight($textarea, textareaEl);
                tileHeight = Math.max(GAP_TEXT_MIN_TILE_HEIGHT, textareaHeight + GAP_TEXT_TILE_PADDING);
            }
        } else {
            const plainText = $gapTextBox.text().trim();
            tileWidth = resolveTileWidth(plainText, plainText.indexOf('\n') !== -1);
        }

        applyTileDimensions($gapTextBox, tileWidth, tileHeight, expanded);

        if ($textarea.length && textareaEl) {
            if (expanded) {
                const lineHeightPx = getGapTextLineHeightPx($textarea);

                $textarea.css({
                    width: '100%',
                    height: `${textareaHeight}px`,
                    minHeight: `${lineHeightPx}px`,
                    maxHeight: 'none',
                    overflowX: 'hidden',
                    overflowY: 'hidden'
                });
            } else {
                $textarea.css({
                    width: '100%',
                    height: '100%',
                    minHeight: '0',
                    maxHeight: '100%',
                    overflowX: 'hidden',
                    overflowY: 'hidden'
                });
            }
        }
    }

    function syncAllGapTextTilesInList($gapList) {
        $gapList.find('li.qti-gapText').each(function () {
            syncGapTextTileSize($(this));
        });
    }

    return {
        GAP_TEXT_MAX_TILE_WIDTH,
        GAP_TEXT_MIN_TILE_WIDTH,
        GAP_TEXT_MIN_TILE_HEIGHT,
        GAP_TEXT_TILE_PADDING,
        GAP_TEXT_MAX_CHARS,
        normalizeGapTextTileLabel,
        getPlainLabelFromGapText,
        mountGapTextTileLabel,
        mountGapTextTileFromModel,
        isGapTextTileExpanded,
        syncGapTextTileSize,
        syncAllGapTextTilesInList
    };
});
