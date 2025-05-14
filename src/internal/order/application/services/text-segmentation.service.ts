import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { TranslationSegment } from '../../domain/entities/translation-segment.entity';
import { TranslationSegmentRepository } from '../../infrastructure/repositories/translation-segment.repository';

/**
 * Service responsible for segmenting order text into translation units
 * and managing their persistence.
 */
@Injectable()
export class TextSegmentationService {
  private readonly logger = new Logger(TextSegmentationService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly segmentRepository: TranslationSegmentRepository,
  ) {}

  /**
   * Segments an order's text into translation units.
   * This is the main entry point for creating segments from original text.
   *
   * @param orderId The ID of the order to segment
   * @param text The original text to segment
   * @returns Array of created TranslationSegment entities
   */
  async segmentOrderText(
    orderId: string,
    text: string,
  ): Promise<TranslationSegment[]> {
    this.logger.log(`Segmenting text for order: ${orderId}`);

    // Break the text into segments using simple paragraph rules
    const segments = this.splitTextIntoSegments(text);

    // Create TranslationSegment entities
    const segmentEntities = segments.map((segmentText, index) => {
      return TranslationSegment.create({
        orderId,
        sequenceNumber: index + 1,
        originalText: segmentText,
      });
    });

    // Save all segments
    await this.segmentRepository.saveMany(segmentEntities);

    this.logger.log(
      `Created ${segmentEntities.length} segments for order: ${orderId}`,
    );

    return segmentEntities;
  }

  /**
   * Splits text into logical segments using simple rules.
   * This implementation uses paragraphs (double line breaks) as segment boundaries.
   * More sophisticated segmentation rules can be added later.
   *
   * @param text The text to segment
   * @returns Array of segment texts
   */
  private splitTextIntoSegments(text: string): string[] {
    // Simple segmentation by paragraphs (double line breaks)
    // This can be expanded with more sophisticated rules later
    const segments = text
      .split(/\n\s*\n/) // Split on paragraph breaks
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0); // Remove empty segments

    // Edge case: If text doesn't have paragraph breaks or is empty,
    // return the whole text as a single segment
    if (segments.length === 0 && text.trim().length > 0) {
      return [text.trim()];
    }

    return segments;
  }

  /**
   * Gets all segments for a specific order, ordered by sequence number.
   *
   * @param orderId The ID of the order
   * @returns Array of TranslationSegment entities
   */
  async getSegmentsByOrderId(orderId: string): Promise<TranslationSegment[]> {
    return this.segmentRepository.findByOrderId(orderId);
  }
}
