import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { TranslationTaskRepository } from '../../../translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegmentRepository } from '../../infrastructure/repositories/translation-task-segment.repository';
import { ContentSegmentType } from '@prisma/client';
import { TranslationTaskSegment } from '../../domain/entities/translation-task-segment.entity';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import {
  TranslationSpecialTokenType,
  TranslationSpecialTokenMap,
} from '../../domain/interfaces/translation-segment-token-map.interface';
import { HtmlFormatMetadata } from '../../domain/interfaces/format-metadata.interface';
import { OriginalStructure } from '../../domain/interfaces/original-structure.interface';

// Type for node structure with children array
interface NodeStructure {
  children: any[];
  [key: string]: unknown;
}
import type { Element, Node, Text as TextNode } from 'domhandler';
import { ElementType } from 'domelementtype';

@Injectable()
export class EmailProcessingService {
  private readonly logger = new Logger(EmailProcessingService.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly segmentRepository: TranslationTaskSegmentRepository,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Parses an email translation task and creates segments
   * @param taskId ID of the translation task to parse
   * @returns Object containing segments, word count, and original structure
   */
  async parseEmailTask(taskId: string): Promise<{
    segments: TranslationTaskSegment[];
    wordCount: number;
    originalStructure: OriginalStructure;
  }> {
    this.logger.debug(`Parsing email task ${taskId}`);

    const task = await this.translationTaskRepository.findById(taskId);
    if (!task) {
      this.logger.error(`Task ${taskId} not found for parsing`);
      throw new Error(`Task ${taskId} not found for parsing`);
    }

    // Get the content from the task
    const htmlContent = task.originalContent;
    this.logger.debug(
      `Parsing content for task ${taskId} (length: ${htmlContent.length})`,
    );

    // Parse the content
    const { originalStructure, segments } = this.parseEmailContent(
      taskId,
      htmlContent,
    );

    // Calculate metrics
    const wordCount = this.countWords(segments);

    // Log results for debugging
    console.log('======= EMAIL PARSING RESULTS =======');
    console.log(`Task ID: ${taskId}`);
    console.log(`Original Content Length: ${htmlContent.length} chars`);
    console.log(`Segments Created: ${segments.length}`);
    console.log(`Word Count: ${wordCount}`);
    console.log('\nOriginal Structure:');
    console.log(JSON.stringify(originalStructure, null, 2));
    console.log('\nSegments:');
    segments.forEach((segment, index) => {
      console.log(`\nSegment #${index + 1}:`);
      console.log(`  ID: ${segment.id}`);
      console.log(`  Order: ${segment.segmentOrder}`);
      console.log(`  Type: ${segment.segmentType}`);
      console.log(`  Source Content: ${segment.sourceContent}`);
      console.log(
        `  Special Tokens: ${Object.keys(segment.specialTokensMap || {}).length}`,
      );
      console.log(
        `  Format Metadata: ${JSON.stringify(segment.formatMetadata)}`,
      );
    });
    console.log('======= END OF RESULTS =======');

    // Reconstruct original email HTML for debugging
    const reconstructed = this.reconstructEmailContent(
      originalStructure,
      segments,
    );
    console.log('======= EMAIL RECONSTRUCTION =======');
    console.log(reconstructed);
    console.log('======= END OF RECONSTRUCTION =======');

    return {
      segments,
      wordCount,
      originalStructure,
    };
  }

  /**
   * Parses HTML content and extracts segments with special tokens
   */
  private parseEmailContent(
    taskId: string,
    htmlContent: string,
  ): {
    originalStructure: OriginalStructure & NodeStructure;
    segments: TranslationTaskSegment[];
  } {
    // Initialize the structure with a children array
    const originalStructure: OriginalStructure & NodeStructure = {
      children: [],
    };
    const segments: TranslationTaskSegment[] = [];

    // Load HTML with Cheerio
    const $ = cheerio.load(htmlContent);

    // Process the HTML content
    const bodyElement = $('body')[0];

    if (bodyElement) {
      this.processNode(bodyElement, $, originalStructure, segments, taskId);
    } else {
      this.logger.warn(
        `No body element found in email content for task ${taskId}`,
      );
    }

    return {
      originalStructure,
      segments,
    };
  }

  /**
   * Recursively processes HTML nodes and builds the structure
   */
  private processNode(
    node: Node,
    $: cheerio.CheerioAPI,
    parentStructure: NodeStructure,
    segments: TranslationTaskSegment[],
    taskId: string,
  ) {
    // Skip if no node
    if (!node) return;

    // Handle node based on its type
    if (node.type === ElementType.Tag) {
      const element = node as Element;

      // Skip non-visible elements
      if (
        element.name === 'style' ||
        element.name === 'script' ||
        element.name === 'meta'
      ) {
        return;
      }

      this.processElementNode(element, $, parentStructure, segments, taskId);
    } else if (node.type === ElementType.Text) {
      const textNode = node as TextNode;
      // Skip empty text nodes
      if (!textNode.data || textNode.data.trim() === '') {
        return;
      }

      // Add text node to parent structure if it has content
      if (parentStructure.children) {
        parentStructure.children.push({
          type: 'text',
          data: textNode.data,
        });
      }
    }
    // Ignore other node types (comments, etc.)
  }

  /**
   * Process an element node (tag)
   */
  private processElementNode(
    element: Element,
    $: cheerio.CheerioAPI,
    parentStructure: NodeStructure,
    segments: TranslationTaskSegment[],
    taskId: string,
  ) {
    // Create structure entry for this element
    const nodeStructure: any = {
      tag: element.name,
      attributes: element.attribs || {},
      children: [],
    };

    // Add to parent
    if (parentStructure.children) {
      parentStructure.children.push(nodeStructure);
    }

    // Check if this is a leaf block element that should be a segment
    if (this.isBlockElement(element) && !this.hasBlockChildren(element, $)) {
      // This is a translatable segment, create a placeholder in structure
      const segmentId = segments.length + 1;
      nodeStructure.children.push({
        type: 'segment',
        id: segmentId,
      });

      // Process the content of this block for translation
      const segment = this.processBlockForTranslation(
        element,
        $,
        segmentId,
        taskId,
      );
      segments.push(segment);
    } else {
      // Process children recursively
      $(element)
        .children()
        .each((_, child) => {
          this.processNode(child, $, nodeStructure, segments, taskId);
        });
    }
  }

  /**
   * Processes a block element into a translatable segment
   */
  private processBlockForTranslation(
    node: Element,
    $: cheerio.CheerioAPI,
    segmentOrder: number,
    taskId: string,
  ): TranslationTaskSegment {
    // Clone the node to avoid modifying original
    const $clone = $(node).clone();

    // Initialize a map to track special tokens
    const specialTokensMap: TranslationSpecialTokenMap = {};

    // Track token IDs
    let tokenCounter = 1;

    // Process inline formatting elements - transform to <g> tags
    $clone.find('b, strong, i, em, u, span, font, sup, sub').each((_, elem) => {
      const $elem = $(elem);
      const tokenId = String(tokenCounter++);

      // Store original HTML before replacing
      const originalHtml = $.html($elem);
      const tagName = ($elem.prop('tagName') ?? '').toLowerCase();
      const attrs = $elem.attr() || {};
      const innerHtml = $elem.html() ?? '';

      // Format type based on tag
      let formatType = '';
      if (['b', 'strong'].includes(tagName)) formatType = 'bold';
      else if (['i', 'em'].includes(tagName)) formatType = 'italic';
      else if (tagName === 'u') formatType = 'underline';
      else formatType = tagName;

      // Create token entry
      const token = `<INLINE_${tokenId}>`;
      specialTokensMap[token] = {
        id: tokenId,
        type: TranslationSpecialTokenType.INLINE_FORMATTING,
        sourceContent: originalHtml,
        attrs,
        innerHtml,
      };

      // Replace with <g> tag with text preserved inside
      const text = $elem.text();
      $elem.replaceWith(`<g id="${tokenId}" type="${formatType}">${text}</g>`);
    });

    // Process URLs - transform to <ph> tags
    $clone.find('a').each((_, elem) => {
      const $elem = $(elem);
      const tokenId = String(tokenCounter++);
      const tagName = ($elem.prop('tagName') ?? '').toLowerCase();

      // Store original HTML
      const originalHtml = $.html($elem);
      const attrs = $elem.attr() || {};

      // Create token entry for URL
      const token = `<URL_${tokenId}>`;
      specialTokensMap[token] = {
        id: tokenId,
        type: TranslationSpecialTokenType.URL,
        sourceContent: originalHtml,
        attrs,
        innerHtml: $elem.html()?.toString() ?? '',
        href: $elem.attr('href') ?? '',
        displayText: $elem.text() ?? '',
      };

      // Replace with <ph> tag - no text inside
      $elem.replaceWith(`<ph id="${tokenId}" type="${tagName}"/>`);
    });

    // Process other self-closed elements - transform to <ph> tags
    $clone.find('img, br, hr').each((_, elem) => {
      const $elem = $(elem);
      const tokenId = String(tokenCounter++);
      const tagName = ($elem.prop('tagName') ?? '').toLowerCase();

      // Store original HTML
      const originalHtml = $.html($elem);
      const attrs = $elem.attr() || {};

      // Create token entry based on type
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

      // Replace with <ph> tag - no text inside
      $elem.replaceWith(`<ph id="${tokenId}" type="${tagName}"/>`);
    });

    // Extract the HTML content with our <g> and <ph> tags preserved
    const htmlWithTokens = $clone.html() ?? '';

    // Create segment object
    const segment = TranslationTaskSegment.create({
      id: uuidv4(),
      translationTaskId: taskId,
      segmentOrder,
      segmentType: ContentSegmentType.HTML_BLOCK,
      sourceContent: htmlWithTokens,
      specialTokensMap,
      formatMetadata: this.extractFormatMetadata(node, $),
    });

    return segment;
  }

  /**
   * Extracts format metadata from a node
   */
  private extractFormatMetadata(
    node: Element,
    $: cheerio.CheerioAPI,
  ): HtmlFormatMetadata {
    // Initialize metadata
    const metadata: HtmlFormatMetadata = {
      container: node.name?.toLowerCase() || 'div',
      row: 0,
      col: 0,
    };

    // If inside a table, add row/col info
    if ($(node).closest('td,th').length > 0) {
      const cell = $(node).closest('td,th')[0];
      const row = $(cell).parent('tr')[0];
      const table = $(row).closest('table')[0];

      // Calculate row index
      const rowIndex = $(table).find('tr').index(row) + 1;

      // Calculate col index
      const colIndex = $(row).find('td,th').index(cell) + 1;

      metadata.row = rowIndex;
      metadata.col = colIndex;
    }

    return metadata;
  }

  /**
   * Checks if a node is a block element
   */
  private isBlockElement(node: Element): boolean {
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

  /**
   * Checks if a node has block element children
   */
  private hasBlockChildren(node: Element, $: cheerio.CheerioAPI): boolean {
    let hasBlocks = false;
    $(node)
      .children()
      .each((_, child) => {
        if (this.isBlockElement(child)) {
          hasBlocks = true;
          return false; // break the each loop
        }
      });
    return hasBlocks;
  }

  /**
   * Counts words in all segments
   */
  private countWords(segments: TranslationTaskSegment[]): number {
    return segments.reduce((total, segment) => {
      // Count words in content
      const words = segment.sourceContent.split(/\s+/).filter(Boolean).length;
      return total + words;
    }, 0);
  }

  /**
   * Reconstructs the email HTML from segments and original structure
   */
  private reconstructEmailContent(
    originalStructure: OriginalStructure & NodeStructure,
    segments: TranslationTaskSegment[],
  ): string {
    const buildNode = (node: any): string => {
      if (node.type === 'text' && typeof node.data === 'string') {
        return node.data;
      }
      if (node.type === 'segment' && typeof node.id === 'number') {
        const seg = segments.find((s) => s.segmentOrder === node.id);
        if (!seg) return '';
        let html = seg.sourceContent;
        const tokenMap = seg.specialTokensMap || {};
        Object.values(tokenMap).forEach((entry) => {
          const id = entry.id;
          if (entry.type === TranslationSpecialTokenType.INLINE_FORMATTING) {
            html = html.replace(
              new RegExp(`<g[^>]*id=["']${id}["'][^>]*>.*?<\/g>`, 'g'),
              entry.sourceContent,
            );
          } else {
            html = html.replace(
              new RegExp(`<ph[^>]*id=["']${id}["'][^>]*>(?:<\/ph>)?`, 'g'),
              entry.sourceContent,
            );
          }
        });
        return html;
      }
      if (node.tag) {
        const attrs = node.attributes || {};
        const attrString = Object.entries(attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        const openTag = attrString
          ? `<${node.tag} ${attrString}>`
          : `<${node.tag}>`;
        const inner = (node.children || []).map(buildNode).join('');
        return `${openTag}${inner}</${node.tag}>`;
      }
      return '';
    };

    let roots = originalStructure.children as any[];
    if (roots.length === 1 && (roots[0] as any).tag === 'body') {
      roots = (roots[0] as any).children;
    }
    return roots.map(buildNode).join('');
  }
}
