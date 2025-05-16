import { Body, Controller, Post } from '@nestjs/common';
import { ParseEmailDto } from '../application/dtos/parse-email.dto';
import { EmailParsingService } from '../application/services/email-parsing.service';

@Controller('email-parse')
export class EmailParsingController {
  constructor(private readonly emailParsingService: EmailParsingService) {}

  @Post()
  parseEmail(@Body() dto: ParseEmailDto) {
    const result = this.emailParsingService.parseEmail(dto.emailContent);
    return result;
  }
}
