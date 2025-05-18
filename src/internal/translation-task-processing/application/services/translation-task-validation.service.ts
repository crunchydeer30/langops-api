import { Injectable, Logger } from '@nestjs/common';
import { TranslationTaskType } from '@prisma/client';
import { JSDOM } from 'jsdom';
import { DomainException } from '@common/exceptions';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { TranslationTask } from 'src/internal/translation-task/domain';

@Injectable()
export class TranslationTaskValidationService {
  private readonly logger = new Logger(TranslationTaskValidationService.name);

  constructor(private readonly prismaService: PrismaService) {}

  validateTask(task: TranslationTask): void {
    switch (task.type) {
      case TranslationTaskType.EMAIL:
        this.validateEmailTask(task);
        break;
      default:
        this.logger.error(`Unsupported task type: ${task.type}`);
        throw new DomainException(ERRORS.TRANSLATION_TASK.UNSUPPORTED_TYPE);
    }
  }

  private validateEmailTask(task: { id: string; sourceContent: string }): void {
    const content = task.sourceContent;

    try {
      const isFullEmail = this.isFullEmailFormat(content);

      const htmlContent = isFullEmail
        ? this.extractHtmlFromFullEmail(content)
        : content;

      if (!this.isValidHtml(htmlContent)) {
        throw new DomainException(
          ERRORS.TRANSLATION_TASK.INVALID_HTML_STRUCTURE,
        );
      }

      if (!this.hasTranslatableContent(htmlContent)) {
        throw new DomainException(
          ERRORS.TRANSLATION_TASK.NO_TRANSLATABLE_CONTENT,
        );
      }

      if (htmlContent.length > 10 * 1024 * 1024) {
        throw new DomainException(
          ERRORS.TRANSLATION_TASK.CONTENT_SIZE_EXCEEDED,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Email validation failed for task ${task.id}: ${errorMessage}`,
      );
      throw new DomainException(
        ERRORS.TRANSLATION_TASK.EMAIL_VALIDATION_FAILED,
      );
    }
  }

  private isFullEmailFormat(content: string): boolean {
    const headerPatterns = [
      /^From:/im,
      /^To:/im,
      /^Subject:/im,
      /^Date:/im,
      /^MIME-Version:/im,
      /^Content-Type: multipart/im,
    ];

    const matchCount = headerPatterns.filter((pattern) =>
      pattern.test(content),
    ).length;
    return matchCount >= 3;
  }

  private extractHtmlFromFullEmail(fullEmail: string): string {
    const htmlPartMatch = fullEmail.match(
      /Content-Type: text\/html;[\s\S]*?(?=--[^\r\n]*(?:\r?\n|$)--)/i,
    );

    if (htmlPartMatch) {
      const htmlPart = htmlPartMatch[0];
      const bodyStartIndex = htmlPart.search(/\r?\n\r?\n/);

      if (bodyStartIndex !== -1) {
        return htmlPart.substring(bodyStartIndex).trim();
      }
    }

    const htmlTagMatch = fullEmail.match(/<html[\s\S]*?<\/html>/i);
    if (htmlTagMatch) {
      return htmlTagMatch[0];
    }

    throw new DomainException(ERRORS.TRANSLATION_TASK.HTML_EXTRACTION_FAILED);
  }

  private isValidHtml(content: string): boolean {
    try {
      const dom = new JSDOM(content);
      return dom.window.document.body !== null;
    } catch (error) {
      this.logger.error(
        `HTML parsing failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  private hasTranslatableContent(content: string): boolean {
    try {
      const dom = new JSDOM(content);
      const textContent = dom.window.document.body.textContent || '';

      const trimmedText = textContent.trim();
      return trimmedText.length > 0;
    } catch (error) {
      this.logger.error(
        `Translatable content check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
