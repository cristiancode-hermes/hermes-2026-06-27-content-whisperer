import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Req() req: any) {
    return this.dashboardService.getStats(req.user.id);
  }

  @Get('recent')
  getRecent(@Req() req: any) {
    return this.dashboardService.getRecent(req.user.id);
  }

  @Get('top-words')
  getTopWords(@Req() req: any) {
    return this.dashboardService.getTopWords(req.user.id);
  }
}
