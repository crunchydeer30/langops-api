/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { v4 as uuidv4 } from 'uuid';
import { SegmentDto } from './html-parsing.service';
import { ContentSegmentType } from '@prisma/client';
import { XliffDocumentMetadata } from 'src/internal/translation-task-processing/domain/interfaces/xliff-structure.interface';
import { FormatMetadata } from 'src/internal/translation-task-processing/domain/interfaces/format-metadata.interface';

export interface XliffParsingResult {
  segments: SegmentDto[];
  metadata: XliffDocumentMetadata;
}

@Injectable()
export class XliffParsingService {
  private readonly logger = new Logger(XliffParsingService.name);

  parse(xmlContent: string): XliffParsingResult {
    if (!xmlContent || xmlContent.trim() === '') {
      this.logger.error('Empty XLIFF content provided');
      throw new Error('Empty XLIFF content provided');
    }
    this.logger.debug(`Parsing XLIFF content of length ${xmlContent.length}`);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const json = parser.parse(xmlContent) as any;
    const xliff = json.xliff as any;

    if (!xliff) {
      this.logger.error(
        `Failed to parse XLIFF content: ${JSON.stringify(json).substring(0, 200)}`,
      );
      throw new Error('Invalid XLIFF format: root xliff element not found');
    }

    const version = xliff['@_version'] as string;
    const xmlns = xliff['@_xmlns'] as string | undefined;
    const files = Array.isArray(xliff.file) ? xliff.file : [xliff.file];

    const segments: SegmentDto[] = [];
    let segmentOrder = 0;
    files.forEach((file) => {
      const fileId = file['@_id'];
      let units: any[] = [];
      if (file.unit) {
        units = units.concat(
          Array.isArray(file.unit) ? file.unit : [file.unit],
        );
      }
      if (file.group) {
        const groups = Array.isArray(file.group) ? file.group : [file.group];
        groups.forEach((g) => {
          const groupId = g['@_id'];
          if (g.unit) {
            const us = Array.isArray(g.unit) ? g.unit : [g.unit];
            units = units.concat(us.map((u) => ({ ...u, groupId })));
          }
        });
      }
      units.forEach((u) => {
        segmentOrder++;
        const unitId = u['@_id'];

        // Debug the complete unit object to see its structure
        this.logger.debug(`Unit ${unitId} raw structure: ${JSON.stringify(u)}`);

        // Handle different possible source formats in XLIFF
        let sourceContent = 'Placeholder text';

        // Try different ways to extract the source content based on XLIFF version/format
        // First check XLIFF 2.0 format (unit → segment → source)
        if (u.segment && typeof u.segment === 'object') {
          this.logger.debug('Found XLIFF 2.0 structure with segment container');

          if (typeof u.segment.source === 'string') {
            sourceContent = u.segment.source;
            this.logger.debug('XLIFF 2.0: Source found as string in segment');
          } else if (u.segment.source && typeof u.segment.source === 'object') {
            // Try different object structures for the source
            if (u.segment.source['#text'] !== undefined) {
              sourceContent = u.segment.source['#text'];
            } else if (u.segment.source._ !== undefined) {
              sourceContent = u.segment.source._;
            } else {
              sourceContent = JSON.stringify(u.segment.source);
            }
            this.logger.debug(
              `XLIFF 2.0: Source found as object in segment: ${sourceContent}`,
            );
          }
        }
        // Then check XLIFF 1.x format (direct source element)
        else if (u.source !== undefined) {
          if (typeof u.source === 'string') {
            sourceContent = u.source;
            this.logger.debug('XLIFF 1.x: Source found as string');
          } else if (u.source && typeof u.source === 'object') {
            // Try different object structures
            if (u.source['#text'] !== undefined) {
              sourceContent = u.source['#text'];
              this.logger.debug('XLIFF 1.x: Source found as object with #text');
            } else if (u.source._ !== undefined) {
              sourceContent = u.source._;
              this.logger.debug('XLIFF 1.x: Source found as object with _');
            } else if (u.source.text !== undefined) {
              sourceContent = u.source.text;
              this.logger.debug('XLIFF 1.x: Source found as object with text');
            } else {
              // Last resort - stringify the object to not lose data
              sourceContent = `Unparsed source: ${JSON.stringify(u.source)}`;
              this.logger.debug(
                'XLIFF 1.x: Source found as complex object, using stringified version',
              );
            }
          }
        }
        // Then check other variations
        else if (u.seg !== undefined) {
          // Some XLIFF formats use seg instead of source
          sourceContent =
            typeof u.seg === 'string'
              ? u.seg
              : `Unparsed seg: ${JSON.stringify(u.seg)}`;
          this.logger.debug('Source found as seg element');
        } else if (u.target !== undefined) {
          // Sometimes we need to fall back to target
          sourceContent =
            typeof u.target === 'string'
              ? u.target
              : `Unparsed target: ${JSON.stringify(u.target)}`;
          this.logger.debug('Falling back to target element');
        } else {
          // If we couldn't find content anywhere else, use the whole unit
          sourceContent = `No source found. Unit data: ${JSON.stringify(u).substring(0, 100)}`;
          this.logger.warn(`No source content found in unit ${unitId}`);
        }

        this.logger.debug(
          `Final extracted source content for unit ${unitId}: "${sourceContent}"`,
        );

        const metadata: FormatMetadata = {
          fileId,
          unitId,
          groupId: u.groupId,
        };

        segments.push({
          id: uuidv4(),
          segmentOrder,
          segmentType: ContentSegmentType.XLIFF_UNIT,
          sourceContent,
          formatMetadata: metadata,
        });
      });
    });

    const firstFile = files[0];
    const metadata: XliffDocumentMetadata = {
      version,
      xmlns,
      sourceLanguage: firstFile['@_source-language'],
      targetLanguage: firstFile['@_target-language'],
      originalFile: firstFile['@_original'] ?? firstFile['@_original-file'],
      datatype: firstFile['@_datatype'],
      toolId: firstFile['@_tool-id'],
      toolName: firstFile['@_tool-name'],
      toolVersion: firstFile['@_tool-version'],
    };

    return { segments, metadata };
  }
}
