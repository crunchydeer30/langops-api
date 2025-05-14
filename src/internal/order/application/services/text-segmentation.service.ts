import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TranslationSegment } from '../../domain/entities/translation-segment.entity';
import { TranslationSegmentRepository } from '../../infrastructure/repositories/translation-segment.repository';

@Injectable()
export class TextSegmentationService {
  private readonly logger = new Logger(TextSegmentationService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly segmentRepository: TranslationSegmentRepository,
  ) {}

  async segmentOrderText(
    orderId: string,
    text: string,
  ): Promise<TranslationSegment[]> {
    this.logger.log(`Segmenting text for order: ${orderId}`);

    const segments = this.splitTextIntoSegments(text);

    const segmentEntities = segments.map((segmentText, index) => {
      return TranslationSegment.create({
        orderId,
        sequenceNumber: index + 1,
        originalText: segmentText,
      });
    });

    await this.segmentRepository.saveMany(segmentEntities);

    this.logger.log(
      `Created ${segmentEntities.length} segments for order: ${orderId}`,
    );

    return segmentEntities;
  }

  private splitTextIntoSegments(text: string): string[] {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);

    if (paragraphs.length > 1) {
      return paragraphs;
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 0) {
      const sentences = trimmedText
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 0);

      if (sentences.length > 1) {
        return sentences;
      }

      return [trimmedText];
    }

    return [];
  }

  async getSegmentsByOrderId(orderId: string): Promise<TranslationSegment[]> {
    return this.segmentRepository.findByOrderId(orderId);
  }
}
