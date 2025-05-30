import { Injectable, Logger } from '@nestjs/common';
import { ContentSegmentType } from '@prisma/client';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import type {
  Node as DomNode,
  Element as DomElement,
  Text as DomText,
} from 'domhandler';
import { ElementType } from 'domelementtype';
import {
  TranslationSpecialTokenType,
  TranslationSpecialTokenMap,
} from '../../domain/interfaces/translation-segment-token-map.interface';
import { FormatMetadata } from '../../domain/interfaces/format-metadata.interface';
import {
  OriginalStructure,
  NodeStructure,
  ElementNodeStruct,
} from '../../domain/interfaces/original-structure.interface';
import { URL } from 'url';

export interface SegmentDto {
  id: string;
  segmentOrder: number;
  segmentType: ContentSegmentType;
  sourceContent: string;
  targetContent?: string;
  specialTokensMap?: TranslationSpecialTokenMap | null;
  formatMetadata?: FormatMetadata | null;
}

export interface HtmlParsingResult {
  segments: SegmentDto[];
  originalStructure: OriginalStructure;
}

@Injectable()
export class HTMLParsingService {
  private readonly logger = new Logger(HTMLParsingService.name);

  parse(originalContent: string): HtmlParsingResult {
    this.logger.debug(
      `Parsing HTML content of length ${originalContent.length} characters`,
    );

    const { originalStructure, segments } =
      this.parseHTMLContent(originalContent);

    this.logger.debug(`Parsed ${segments.length} segments`);

    return {
      segments,
      originalStructure,
    };
  }

  private parseHTMLContent(htmlContent: string): {
    originalStructure: OriginalStructure;
    segments: SegmentDto[];
  } {
    const originalStructure: OriginalStructure = {
      children: [],
    };
    const segments: SegmentDto[] = [];

    const $ = cheerio.load(htmlContent);

    const bodyElement = $('body')[0];

    if (bodyElement) {
      this.processNode(bodyElement, $, originalStructure, segments);
    } else {
      this.logger.warn('No body element found in html content');
    }

    return {
      originalStructure,
      segments,
    };
  }

  private processNode(
    node: DomNode,
    $: cheerio.CheerioAPI,
    parentStructure: OriginalStructure | ElementNodeStruct,
    segments: SegmentDto[],
  ) {
    if (!node) return;

    if (node.type === ElementType.Tag) {
      const element = node as DomElement;

      if (
        element.name === 'style' ||
        element.name === 'script' ||
        element.name === 'meta'
      ) {
        return;
      }

      this.processElementNode(element, $, parentStructure, segments);
    } else if (node.type === ElementType.Text) {
      const textNode = node as DomText;

      if (!textNode.data || textNode.data.trim() === '') {
        return;
      }

      if (parentStructure.children) {
        parentStructure.children.push({
          type: 'text',
          data: textNode.data,
        });
      }
    }
  }

  private processElementNode(
    element: DomElement,
    $: cheerio.CheerioAPI,
    parentStructure: OriginalStructure | ElementNodeStruct,
    segments: SegmentDto[],
  ) {
    const nodeStructure: ElementNodeStruct = {
      type: 'element',
      tag: element.name,
      attributes: element.attribs || {},
      children: [],
    };

    if (parentStructure.children) {
      parentStructure.children.push(nodeStructure);
    }

    if (this.isBlockElement(element) && !this.hasBlockChildren(element, $)) {
      const segmentId = segments.length + 1;
      nodeStructure.children.push({
        type: 'segment',
        id: segmentId,
      });

      const segment = this.processBlockForTranslation(element, $, segmentId);
      segments.push(segment);
    } else {
      $(element)
        .children()
        .each((_, child) => {
          this.processNode(child, $, nodeStructure, segments);
        });
    }
  }

  private processBlockForTranslation(
    node: DomElement,
    $: cheerio.CheerioAPI,
    segmentOrder: number,
  ): SegmentDto {
    const $clone = $(node).clone();

    const specialTokensMap: TranslationSpecialTokenMap = {};

    let tokenCounter = 1;

    $clone.find('b, strong, i, em, u, span, font, sup, sub').each((_, elem) => {
      const $elem = $(elem);
      const tokenId = String(tokenCounter++);

      const originalHtml = $.html($elem);
      const tagName = ($elem.prop('tagName') ?? '').toLowerCase();
      const attrs = $elem.attr() || {};
      const innerHtml = $elem.html() ?? '';

      let formatType = '';
      if (['b', 'strong'].includes(tagName)) formatType = 'bold';
      else if (['i', 'em'].includes(tagName)) formatType = 'italic';
      else if (tagName === 'u') formatType = 'underline';
      else formatType = tagName;

      const token = `<INLINE_${tokenId}>`;
      specialTokensMap[token] = {
        id: tokenId,
        type: TranslationSpecialTokenType.INLINE_FORMATTING,
        sourceContent: originalHtml,
        attrs,
        innerHtml,
      };

      const text = $elem.text();
      $elem.replaceWith(`<g id="${tokenId}" type="${formatType}">${text}</g>`);
    });

    $clone.find('a').each((_, elem) => {
      const $elem = $(elem);
      const tokenId = String(tokenCounter++);
      const tagName = ($elem.prop('tagName') ?? '').toLowerCase();

      const originalHtml = $.html($elem);
      const attrs = $elem.attr() || {};
      const innerHtml = $elem.html() ?? '';
      const displayText = $elem.text() ?? '';
      const href = attrs.href || '';

      const token = `<URL_${tokenId}>`;
      specialTokensMap[token] = {
        id: tokenId,
        type: TranslationSpecialTokenType.URL,
        sourceContent: originalHtml,
        attrs,
        innerHtml,
        href,
        displayText,
      };

      const innerText = $elem.text().trim();

      const isValidUrl = (text: string): boolean => {
        const urlToTest =
          text.startsWith('http://') || text.startsWith('https://')
            ? text
            : `http://${text}`;

        try {
          new URL(urlToTest);
          return true;
        } catch {
          return false;
        }
      };

      const isURL =
        isValidUrl(innerText) ||
        innerText === href ||
        innerText === href.replace(/^https?:\/\//, '');
      if (!innerHtml.includes('<') && !isURL) {
        $elem.replaceWith(
          `<g id="${tokenId}" type="${tagName}">${innerHtml}</g>`,
        );
      } else {
        $elem.replaceWith(`<ph id="${tokenId}" type="${tagName}"/>`);
      }
    });

    $clone.find('img, br, hr').each((_, elem) => {
      const $elem = $(elem);
      const tokenId = String(tokenCounter++);
      const tagName = ($elem.prop('tagName') ?? '').toLowerCase();

      const originalHtml = $.html($elem);
      const attrs = $elem.attr() || {};

      if (tagName === 'img') {
        const token = `<IMG_${tokenId}>`;
        specialTokensMap[token] = {
          id: tokenId,
          type: TranslationSpecialTokenType.IMAGE,
          sourceContent: originalHtml,
          attrs,
          src: $elem.attr('src') ?? '',
          alt: $elem.attr('alt') ?? '',
        };
      } else {
        const token = `<INLINE_${tokenId}>`;
        specialTokensMap[token] = {
          id: tokenId,
          type: TranslationSpecialTokenType.INLINE_FORMATTING,
          sourceContent: originalHtml,
          attrs,
          innerHtml: '',
        };
      }

      $elem.replaceWith(`<ph id="${tokenId}" type="${tagName}"/>`);
    });

    const htmlWithTokens = $clone.html() ?? '';

    return {
      id: uuidv4(),
      segmentOrder,
      segmentType: ContentSegmentType.HTML_BLOCK,
      sourceContent: htmlWithTokens,
      specialTokensMap,
      formatMetadata: this.extractFormatMetadata(node, $),
    };
  }

  private extractFormatMetadata(
    node: DomElement,
    $: cheerio.CheerioAPI,
  ): FormatMetadata {
    const metadata: FormatMetadata = {
      container: node.name?.toLowerCase() || 'div',
      row: 0,
      col: 0,
    };

    if ($(node).closest('td,th').length > 0) {
      const cell = $(node).closest('td,th')[0];
      const row = $(cell).parent('tr')[0];
      const table = $(row).closest('table')[0];

      const rowIndex = $(table).find('tr').index(row) + 1;

      const colIndex = $(row).find('td,th').index(cell) + 1;

      metadata.row = rowIndex;
      metadata.col = colIndex;
    }

    return metadata;
  }

  private isBlockElement(node: DomElement): boolean {
    const blockElements = [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'div',
      'blockquote',
      'li',
    ];
    return Boolean(node?.name && blockElements.includes(node.name));
  }

  private hasBlockChildren(node: DomElement, $: cheerio.CheerioAPI): boolean {
    let hasBlocks = false;
    $(node)
      .children()
      .each((_, child) => {
        if (this.isBlockElement(child)) {
          hasBlocks = true;
          return false;
        }
      });
    return hasBlocks;
  }

  public reconstructHTMLContent(
    originalStructure: OriginalStructure,
    segments: SegmentDto[],
  ): string {
    const buildNode = (node: NodeStructure): string => {
      if (node.type === 'text') {
        return node.data;
      }
      if (node.type === 'segment') {
        const seg = segments.find((s) => s.segmentOrder === node.id);
        if (!seg) return '';
        let html = seg.sourceContent;
        const tokenMap = seg.specialTokensMap || {};
        Object.values(tokenMap).forEach((entry) => {
          const id = entry.id;
          if (entry.type === TranslationSpecialTokenType.INLINE_FORMATTING) {
            html = html.replace(
              new RegExp(`<g[^>]*id=["']${id}["'][^>]*>.*?<\\/g>`, 'g'),
              entry.sourceContent,
            );
          } else if (entry.type === TranslationSpecialTokenType.URL) {
            const href = entry.href || '#';
            const displayText = entry.displayText || href;

            html = html.replace(
              new RegExp(`<g[^>]*id=["']${id}["'][^>]*>(.*?)<\/g>`, 'g'),
              (match, content) => `<a href="${href}">${content}</a>`,
            );

            html = html.replace(
              new RegExp(`<ph[^>]*id=["']${id}["'][^>]*>(?:</ph>)?`, 'g'),

              `<a href="${href}">${displayText?.includes('<') || displayText?.includes('/>') ? 'Link' : displayText}</a>`,
            );
          } else {
            html = html.replace(
              new RegExp(`<ph[^>]*id=["']${id}["'][^>]*>(?:</ph>)?`, 'g'),
              entry.sourceContent,
            );
          }
        });
        return html;
      }
      if (node.type === 'element') {
        const { tag, attributes, children } = node;
        const attrString = Object.entries(attributes)
          .map(([k, v]) => ` ${k}="${v}"`)
          .join('');
        const inner = children.map(buildNode).join('');
        return `<${tag}${attrString}>${inner}</${tag}>`;
      }
      return '';
    };

    let roots = originalStructure.children;
    if (roots.length === 1 && (roots[0] as ElementNodeStruct).tag === 'body') {
      roots = (roots[0] as ElementNodeStruct).children;
    }
    return roots.map(buildNode).join('');
  }
}
