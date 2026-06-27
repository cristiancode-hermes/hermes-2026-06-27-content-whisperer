import { IsString, IsOptional, IsIn, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeUrlDto {
  @ApiProperty({ example: 'https://ejemplo.com/articulo-interesante' })
  @IsUrl()
  url: string;

  @ApiProperty({ enum: ['general', 'technical', 'academic', 'news'], required: false })
  @IsOptional()
  @IsIn(['general', 'technical', 'academic', 'news'])
  mode?: string;

  @ApiProperty({ enum: ['brief', 'normal', 'detailed'], required: false })
  @IsOptional()
  @IsIn(['brief', 'normal', 'detailed'])
  length?: string;
}
