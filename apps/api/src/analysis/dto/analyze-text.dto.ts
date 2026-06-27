import { IsString, IsOptional, IsIn, MinLength, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeTextDto {
  @ApiProperty({ example: 'Texto largo para analizar...' })
  @IsString()
  @MinLength(100)
  @MaxLength(50000)
  content: string;

  @ApiProperty({ enum: ['general', 'technical', 'academic', 'news'], required: false })
  @IsOptional()
  @IsIn(['general', 'technical', 'academic', 'news'])
  mode?: string;

  @ApiProperty({ enum: ['brief', 'normal', 'detailed'], required: false })
  @IsOptional()
  @IsIn(['brief', 'normal', 'detailed'])
  length?: string;
}

export class AnalyzeUrlDto {
  @ApiProperty({ example: 'https://ejemplo.com/articulo' })
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
