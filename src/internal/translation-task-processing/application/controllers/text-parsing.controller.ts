import { Controller, Post, Body } from '@nestjs/common';
import {
  TextParsingService,
  TextParsingResult,
} from '../services/text-parsing.service';

@Controller('parsing/text')
export class TextParsingController {
  constructor(private readonly textParsingService: TextParsingService) {}

  @Post()
  parseText(@Body('text') text: string): TextParsingResult {
    return this.textParsingService.parse(text);
  }
}
