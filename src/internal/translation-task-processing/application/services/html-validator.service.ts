import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';
import { Injectable, Logger } from '@nestjs/common';
import { JSDOM } from 'jsdom';

@Injectable()
export class HTMLValidatorService {
  private readonly logger = new Logger(HTMLValidatorService.name);

  public validate(content: string): void {
    try {
      const htmlContent = this.isEmail(content)
        ? this.extractHtmlFromEmail(content)
        : content;

      if (!this.isValidHtml(htmlContent)) {
        throw new Error(`Translation task contains invalid HTML`);
      }

      if (!this.hasTranslatableContent(htmlContent)) {
        throw new Error(`Translation task has no translatable content`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`HTML validation failed for task: ${errorMessage}`);
      throw error;
    }
  }

  private isEmail(content: string): boolean {
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

  private extractHtmlFromEmail(fullHTML: string): string {
    const htmlPartMatch = fullHTML.match(
      /Content-Type: text\/html;[\s\S]*?(?=--[^\r\n]*(?:\r?\n|$)--)/i,
    );

    if (htmlPartMatch) {
      const htmlPart = htmlPartMatch[0];
      const bodyStartIndex = htmlPart.search(/\r?\n\r?\n/);

      if (bodyStartIndex !== -1) {
        return htmlPart.substring(bodyStartIndex).trim();
      }
    }

    const htmlTagMatch = fullHTML.match(/<html[\s\S]*?<\/html>/i);
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
