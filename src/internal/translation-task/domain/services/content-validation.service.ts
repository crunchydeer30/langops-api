import { Injectable, Logger } from '@nestjs/common';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface ParsedAttribute {
  id: string;
  type?: string;
  [key: string]: string | undefined;
}

@Injectable()
export class ContentValidationService {
  private readonly logger = new Logger(ContentValidationService.name);

  validateEditedContent(
    originalContent: string,
    editedContent: string,
  ): ValidationResult {
    if (!originalContent || !editedContent) {
      return { valid: false, error: 'Missing original or edited content' };
    }

    const originalPlaceholders = this.extractPlaceholders(originalContent);
    const editedPlaceholders = this.extractPlaceholders(editedContent);

    const placeholderResult = this.validatePlaceholders(
      originalPlaceholders,
      editedPlaceholders,
    );
    if (!placeholderResult.valid) {
      return placeholderResult;
    }

    const originalFormatTags = this.extractFormatTags(originalContent);
    const editedFormatTags = this.extractFormatTags(editedContent);

    const formatTagResult = this.validateFormatTags(
      originalFormatTags,
      editedFormatTags,
    );
    if (!formatTagResult.valid) {
      return formatTagResult;
    }

    const anonymizedEntitiesResult = this.validateAnonymizedEntities(
      originalContent,
      editedContent,
    );
    if (!anonymizedEntitiesResult.valid) {
      return anonymizedEntitiesResult;
    }

    return { valid: true };
  }

  private extractPlaceholders(content: string): Array<ParsedAttribute> {
    try {
      const regex = /<ph\s+([^>]*)\/>/g;
      const matches = Array.from(content.matchAll(regex));

      return matches.map((match) => {
        const attributesStr = match[1];
        return this.parseAttributes(attributesStr);
      });
    } catch (e) {
      this.logger.error(
        `Error parsing placeholders: ${e instanceof Error ? e.message : String(e)}`,
      );
      return [];
    }
  }

  private extractFormatTags(content: string): Array<ParsedAttribute> {
    try {
      const regex = /<g\s+([^>]*)>.*?<\/g>/g;
      const matches = Array.from(content.matchAll(regex));

      return matches.map((match) => {
        const attributesStr = match[1];
        return this.parseAttributes(attributesStr);
      });
    } catch (e) {
      this.logger.error(
        `Error parsing format tags: ${e instanceof Error ? e.message : String(e)}`,
      );
      return [];
    }
  }

  private parseAttributes(attributesStr: string): ParsedAttribute {
    const result: ParsedAttribute = { id: '' };
    const attrRegex = /(\w+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(attributesStr)) !== null) {
      const name = match[1];
      const value = match[2];
      if (name && value !== undefined) {
        result[name] = value;
      }
    }

    return result;
  }

  private validatePlaceholders(
    originalPlaceholders: Array<ParsedAttribute>,
    editedPlaceholders: Array<ParsedAttribute>,
  ): ValidationResult {
    if (originalPlaceholders.length !== editedPlaceholders.length) {
      return {
        valid: false,
        error: `Placeholder count mismatch: expected ${originalPlaceholders.length}, got ${editedPlaceholders.length}`,
      };
    }

    const originalMap = new Map(originalPlaceholders.map((p) => [p.id, p]));
    const editedMap = new Map(editedPlaceholders.map((p) => [p.id, p]));

    const missingPlaceholders = originalPlaceholders.filter(
      (p) => !editedMap.has(p.id),
    );
    if (missingPlaceholders.length > 0) {
      return {
        valid: false,
        error: `Missing placeholders: ${missingPlaceholders.map((p) => p.id).join(', ')}`,
      };
    }

    const extraPlaceholders = editedPlaceholders.filter(
      (p) => !originalMap.has(p.id),
    );
    if (extraPlaceholders.length > 0) {
      return {
        valid: false,
        error: `Unexpected placeholders: ${extraPlaceholders.map((p) => p.id).join(', ')}`,
      };
    }

    for (const placeholder of originalPlaceholders) {
      const editedPlaceholder = editedMap.get(placeholder.id);

      if (
        placeholder.type &&
        editedPlaceholder &&
        placeholder.type !== editedPlaceholder.type
      ) {
        return {
          valid: false,
          error: `Placeholder ${placeholder.id} type changed: expected "${placeholder.type}", got "${editedPlaceholder?.type || 'undefined'}"`,
        };
      }
    }

    return { valid: true };
  }

  private validateFormatTags(
    originalTags: Array<ParsedAttribute>,
    editedTags: Array<ParsedAttribute>,
  ): ValidationResult {
    if (originalTags.length !== editedTags.length) {
      return {
        valid: false,
        error: `Format tag count mismatch: expected ${originalTags.length}, got ${editedTags.length}`,
      };
    }

    const originalMap = new Map(originalTags.map((t) => [t.id, t]));
    const editedMap = new Map(editedTags.map((t) => [t.id, t]));

    const missingTags = originalTags.filter((t) => !editedMap.has(t.id));
    if (missingTags.length > 0) {
      return {
        valid: false,
        error: `Missing format tags: ${missingTags.map((t) => t.id).join(', ')}`,
      };
    }

    const extraTags = editedTags.filter((t) => !originalMap.has(t.id));
    if (extraTags.length > 0) {
      return {
        valid: false,
        error: `Unexpected format tags: ${extraTags.map((t) => t.id).join(', ')}`,
      };
    }

    for (const tag of originalTags) {
      const editedTag = editedMap.get(tag.id);

      if (tag.type && editedTag && tag.type !== editedTag.type) {
        return {
          valid: false,
          error: `Format tag ${tag.id} type changed: expected "${tag.type}", got "${editedTag?.type || 'undefined'}"`,
        };
      }
    }

    return { valid: true };
  }

  private validateAnonymizedEntities(
    originalContent: string,
    editedContent: string,
  ): ValidationResult {
    const entityRegex = /<([A-Z_]+_\d+)>/g;

    const originalEntities = Array.from(
      originalContent.matchAll(entityRegex),
    ).map((match) => match[0]);

    const editedEntities = Array.from(editedContent.matchAll(entityRegex)).map(
      (match) => match[0],
    );

    const originalEntityCount = new Map<string, number>();
    for (const entity of originalEntities) {
      const count = originalEntityCount.get(entity) || 0;
      originalEntityCount.set(entity, count + 1);
    }

    const editedEntityCount = new Map<string, number>();
    for (const entity of editedEntities) {
      const count = editedEntityCount.get(entity) || 0;
      editedEntityCount.set(entity, count + 1);
    }

    for (const [entity, count] of originalEntityCount.entries()) {
      const editedCount = editedEntityCount.get(entity) || 0;
      if (editedCount < count) {
        return {
          valid: false,
          error: `Missing anonymized entity: ${entity} (found ${editedCount}, expected ${count})`,
        };
      }
    }

    for (const [entity, count] of editedEntityCount.entries()) {
      const originalCount = originalEntityCount.get(entity) || 0;
      if (count > originalCount) {
        return {
          valid: false,
          error: `Unexpected anonymized entity: ${entity} (found ${count}, expected ${originalCount})`,
        };
      }
    }

    return { valid: true };
  }
}
