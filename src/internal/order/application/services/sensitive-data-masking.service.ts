import { Injectable, Logger } from '@nestjs/common';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { SensitiveDataMappingRepository } from '../../infrastructure/repositories/sensitive-data-mapping.repository';
import { SensitiveDataMapping } from '../../domain/entities/sensitive-data-mapping.entity';
import {
  ISensitiveDataType,
  ISensitiveDataTokenMap,
} from '../../domain/types/sensitive-data.types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SensitiveDataMaskingService {
  private readonly logger = new Logger(SensitiveDataMaskingService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly mappingRepository: SensitiveDataMappingRepository,
  ) {}

  private generateToken(type: ISensitiveDataType, id: string): string {
    return `{{${type}:${id}}}`;
  }

  async maskText(
    orderId: string,
    text?: string,
  ): Promise<{ maskedText: string; tokenMap: ISensitiveDataTokenMap }> {
    this.logger.log(
      `[Masking] Starting sensitive data masking for order: ${orderId}`,
    );
    let originalText = text;

    if (!originalText) {
      const order = await this.orderRepository.findById(orderId);
      if (!order || !order.originalText) {
        this.logger.error(
          `[Masking] Order not found or original text missing for order: ${orderId}`,
        );
        throw new Error(`Order not found or original text missing: ${orderId}`);
      }
      originalText = order.originalText;
      this.logger.log(`[Masking] Fetched original text from order: ${orderId}`);
    }

    const tokenMap: ISensitiveDataTokenMap = {};
    const patterns: Record<ISensitiveDataType, RegExp> = {
      [ISensitiveDataType.EMAIL]: /[\w.-]+@[\w.-]+\.\w+/gi,
      [ISensitiveDataType.PHONE]:
        /(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/g,
      [ISensitiveDataType.URL]:
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi,
      [ISensitiveDataType.PASSWORD]: /password[:=]\s*['"]?[^'"\s]+['"]?/gi,
      [ISensitiveDataType.CODE]: /\b\d{6}\b/g,
      [ISensitiveDataType.CREDIT_CARD]: /\b(?:\d[ -]*?){13,16}\b/g,
    };

    let maskedText = originalText;
    const foundMatches: Array<{
      start: number;
      end: number;
      value: string;
      type: ISensitiveDataType;
      token: string;
    }> = [];

    for (const [type, regex] of Object.entries(patterns) as [
      ISensitiveDataType,
      RegExp,
    ][]) {
      let match: RegExpExecArray | null;
      regex.lastIndex = 0;
      while ((match = regex.exec(originalText))) {
        if (match[0].length === 0) continue;
        const value = match[0];
        const uniqueId = uuidv4().substring(0, 8);
        const token = this.generateToken(type, uniqueId);

        foundMatches.push({
          start: match.index,
          end: match.index + value.length,
          value,
          type,
          token,
        });
      }
    }

    foundMatches.sort((a, b) => {
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return b.end - b.start - (a.end - a.start);
    });

    let lastReplacedEnd = 0;
    const replacements: Array<{ start: number; end: number; token: string }> =
      [];

    for (const match of foundMatches) {
      if (match.start >= lastReplacedEnd) {
        tokenMap[match.token] = { type: match.type, original: match.value };
        replacements.push({
          start: match.start,
          end: match.end,
          token: match.token,
        });
        lastReplacedEnd = match.end;
      }
    }

    for (let i = replacements.length - 1; i >= 0; i--) {
      const r = replacements[i];
      maskedText =
        maskedText.substring(0, r.start) +
        r.token +
        maskedText.substring(r.end);
    }

    this.logger.log(
      `[Masking] Completed masking for order: ${orderId}. ${Object.keys(tokenMap).length} tokens generated.`,
    );

    if (Object.keys(tokenMap).length > 0) {
      const mappingEntity = SensitiveDataMapping.create({ orderId, tokenMap });
      await this.mappingRepository.save(mappingEntity);
      this.logger.log(
        `[Masking] Saved sensitive data mapping for order: ${orderId}`,
      );
    } else {
      this.logger.log(
        `[Masking] No sensitive data found to mask for order: ${orderId}`,
      );
    }

    return { maskedText, tokenMap };
  }

  unmaskText(maskedText: string, tokenMap: ISensitiveDataTokenMap): string {
    this.logger.log(`[Unmasking] Starting to unmask text.`);
    let unmaskedText = maskedText;
    for (const [token, tokenInfo] of Object.entries(tokenMap)) {
      const regex = new RegExp(
        token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'g',
      );
      unmaskedText = unmaskedText.replace(regex, tokenInfo.original);
    }
    this.logger.log(`[Unmasking] Completed unmasking text.`);
    return unmaskedText;
  }

  async getOriginalTextForOrder(
    orderId: string,
    maskedContent: string,
  ): Promise<string | null> {
    this.logger.log(
      `[Unmasking] Retrieving original text for order: ${orderId}`,
    );
    const mapping = await this.mappingRepository.findByOrderId(orderId);
    if (!mapping || !mapping.tokenMap) {
      this.logger.warn(
        `[Unmasking] No sensitive data mapping found for order: ${orderId}. Returning masked content.`,
      );
      return maskedContent;
    }
    return this.unmaskText(maskedContent, mapping.tokenMap);
  }
}
