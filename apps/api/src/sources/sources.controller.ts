import { Controller, Get, Patch, Delete, Param, Query, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SourcesService } from './sources.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'q', required: false })
  findAll(@Req() req: any, @Query() query: any) {
    return this.sourcesService.findAll(req.user.id, query);
  }

  @Get('search')
  search(@Req() req: any, @Query('q') q: string) {
    return this.sourcesService.search(req.user.id, q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.sourcesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() body: { title?: string; notes?: string }) {
    return this.sourcesService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.sourcesService.remove(id, req.user.id);
  }
}
