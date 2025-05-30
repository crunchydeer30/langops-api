import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SegmentDto } from './html-parsing.service';
import { ContentSegmentType } from '@prisma/client';
import { PlainTextFormatMetadata } from 'src/internal/translation-task-processing/domain/interfaces/format-metadata.interface';

export interface TextParsingResult {
  segments: SegmentDto[];
  originalStructure: {
    paragraphs: string[];
    newlinePatterns?: string[];
  };
}

@Injectable()
export class TextParsingService {
  reconstructPlainTextContent(segments: SegmentDto[]): string {
    const sorted = segments
      .slice()
      .sort((a, b) => a.segmentOrder - b.segmentOrder);

    // Use the text segments with appropriate newline spacing
    let result = '';

    sorted.forEach((segment, index) => {
      const content = segment.targetContent ?? segment.sourceContent;

      // Check if we need to add newlines before the content
      if (index > 0) {
        // Get the number of newlines to add from metadata
        const metadata = segment.formatMetadata as PlainTextFormatMetadata;
        const newlineCount = metadata?.precedingNewlines || 2; // Default to 2 if not specified

        // Add the appropriate number of newlines
        result += '\n'.repeat(newlineCount);
      }

      // Add the segment content
      result += content;
    });

    return result;
  }

  parse(text: string): TextParsingResult {
    // Preserve original text for structure analysis
    const originalText = text;

    // Find newline patterns and their positions
    const newlinePatterns: { pattern: string; position: number }[] = [];
    const regex = /\r?\n(\s*\r?\n)+/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(originalText)) !== null) {
      newlinePatterns.push({
        pattern: match[0],
        position: match.index,
      });
    }

    // Split text and preserve paragraph metadata
    const paragraphs = text
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Create segments with enhanced metadata
    const segments: SegmentDto[] = paragraphs.map((p, idx) => {
      // Calculate number of newlines before this paragraph
      const precedingNewlines = 
        idx === 0
          ? 0
          : (newlinePatterns[idx - 1]?.pattern.match(/\n/g) || []).length;

      return {
        id: uuidv4(),
        segmentOrder: idx + 1,
        segmentType: ContentSegmentType.TEXT,
        sourceContent: p,
        formatMetadata: {
          paragraph: idx + 1,
          precedingNewlines,
        } as PlainTextFormatMetadata,
      };
    });

    // Save both paragraphs and newline patterns in the original structure
    return {
      segments,
      originalStructure: {
        paragraphs,
        newlinePatterns: newlinePatterns.map((np) => np.pattern),
      },
    };
  }
}
