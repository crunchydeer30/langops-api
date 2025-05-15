import { Injectable, Logger } from '@nestjs/common';
import { TranslationSegment } from '../../domain/entities/translation-segment.entity';
import { TranslationSegmentRepository } from '../../infrastructure/repositories/translation-segment.repository';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { SensitiveDataMappingRepository } from '../../infrastructure/repositories/sensitive-data-mapping.repository';

@Injectable()
export class TextSegmentationService {
  private readonly logger = new Logger(TextSegmentationService.name);

  constructor(
    private readonly segmentRepository: TranslationSegmentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly sensitiveDataMappingRepository: SensitiveDataMappingRepository,
  ) {}

  async segmentOrderText(orderId: string): Promise<TranslationSegment[]> {
    this.logger.log(`Segmenting text for order: ${orderId}`);

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.error(`Order not found for segmentation: ${orderId}`);
      throw new Error(`Order not found: ${orderId}`);
    }

    const textToSegment = order.maskedText;
    if (!textToSegment) {
      throw new Error(`No text to segment for order: ${orderId}`);
    }

    const mapping =
      await this.sensitiveDataMappingRepository.findByOrderId(orderId);
    const segments = this.splitTextIntoSegments(textToSegment);

    const segmentEntities = segments.map((segmentText, index) => {
      const containedTokens = mapping
        ? Object.keys(mapping.tokenMap).filter((token) =>
            segmentText.includes(token),
          )
        : [];

      return TranslationSegment.create({
        orderId,
        sequenceNumber: index + 1,
        originalText: segmentText,
        containsSensitiveData: containedTokens.length > 0,
        sensitiveDataTokens: containedTokens,
      });
    });

    await this.segmentRepository.saveMany(segmentEntities);

    this.logger.log(
      `Created ${segmentEntities.length} segments for order: ${orderId} (using masked text)`,
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
