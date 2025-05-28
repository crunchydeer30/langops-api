import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SegmentDto } from './html-parsing.service';
import { ContentSegmentType } from '@prisma/client';
import { PlainTextFormatMetadata } from 'src/internal/translation-task-processing/domain/interfaces/format-metadata.interface';

export interface TextParsingResult {
  segments: SegmentDto[];
  wordCount: number;
  originalStructure: { paragraphs: string[] };
}

@Injectable()
export class TextParsingService {
  reconstructPlainTextContent(segments: SegmentDto[]): string {
    const sorted = segments
      .slice()
      .sort((a, b) => a.segmentOrder - b.segmentOrder);
    return sorted
      .map((seg) => seg.targetContent ?? seg.sourceContent)
      .join('\n\n');
  }

  parse(text: string): TextParsingResult {
    const paragraphs = text
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const segments: SegmentDto[] = paragraphs.map((p, idx) => ({
      id: uuidv4(),
      segmentOrder: idx + 1,
      segmentType: ContentSegmentType.TEXT,
      sourceContent: p,
      formatMetadata: { paragraph: idx + 1 } as PlainTextFormatMetadata,
    }));

    const wordCount = paragraphs.reduce(
      (sum, p) => sum + p.split(/\s+/).filter((w) => w).length,
      0,
    );

    return { segments, wordCount, originalStructure: { paragraphs } };
  }
}
