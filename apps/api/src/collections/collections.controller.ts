import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.collectionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.collectionsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() body: { name: string; description?: string }) {
    return this.collectionsService.create(req.user.id, body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() body: { name?: string; description?: string }) {
    return this.collectionsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.collectionsService.remove(id, req.user.id);
  }

  @Post(':id/sources')
  addSource(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() body: { sourceId: number }) {
    return this.collectionsService.addSource(id, body.sourceId, req.user.id);
  }

  @Delete(':id/sources/:sourceId')
  removeSource(
    @Param('id', ParseIntPipe) id: number,
    @Param('sourceId', ParseIntPipe) sourceId: number,
    @Req() req: any,
  ) {
    return this.collectionsService.removeSource(id, sourceId, req.user.id);
  }
}
