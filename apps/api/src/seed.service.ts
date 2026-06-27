import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { Source } from './entities/source.entity';
import { Summary } from './entities/summary.entity';
import { KeyPoint } from './entities/keypoint.entity';
import { Quote } from './entities/quote.entity';
import { Stat } from './entities/stat.entity';
import { Collection } from './entities/collection.entity';
import { CollectionSource } from './entities/collection-source.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Source) private readonly sourceRepo: Repository<Source>,
    @InjectRepository(Summary) private readonly summaryRepo: Repository<Summary>,
    @InjectRepository(KeyPoint) private readonly kpRepo: Repository<KeyPoint>,
    @InjectRepository(Quote) private readonly quoteRepo: Repository<Quote>,
    @InjectRepository(Stat) private readonly statRepo: Repository<Stat>,
    @InjectRepository(Collection) private readonly colRepo: Repository<Collection>,
    @InjectRepository(CollectionSource) private readonly csRepo: Repository<CollectionSource>,
  ) {}

  async onModuleInit() {
    if (process.env['SEED_DB'] === 'true') {
      await this.seed();
    }
  }

  async seed() {
    const count = await this.userRepo.count();
    if (count > 0) {
      console.log('Database already seeded, skipping.');
      return;
    }

    const hash = crypto.createHash('sha256').update('password123').digest('hex');

    // Create demo user
    const user = await this.userRepo.save({
      email: 'demo@whisperer.app',
      name: 'Ana Demo',
      password: hash,
    } as any);
    console.log(`Created user: ${user.email}`);

    // --- Seed sources with full analysis ---
    const articles = [
      {
        title: 'Cómo funciona la atención plena',
        sourceType: 'url',
        originalUrl: 'https://ejemplo.com/atencion-plena',
        rawContent: 'La atención plena o mindfulness es una práctica de meditación que ha ganado popularidad en las últimas décadas. Numerosos estudios científicos han demostrado que la práctica regular de mindfulness reduce el estrés en un 30% y mejora la concentración. Según un estudio de Harvard Health de 2024, el 70% de los participantes reportó mejoras significativas después de 8 semanas de práctica constante. La práctica diaria de 10 minutos es más efectiva que sesiones largas semanales. Los beneficios se observan desde la primera semana. "La meditación no es escapar del mundo, sino aprender a estar presente en él", afirma Jon Kabat-Zinn, pionero en mindfulness. Además, se ha observado un aumento del 25% en productividad post-sesión según un estudio con 340 participantes. La práctica regular también fortalece el sistema inmunológico y mejora la calidad del sueño.',
        mode: 'general',
        summary: 'La atención plena (mindfulness) es una práctica respaldada por la ciencia que reduce el estrés en un 30% y mejora la concentración. Estudios de Harvard Health muestran un 70% de efectividad después de 8 semanas de práctica constante. La práctica diaria de 10 minutos es más efectiva que sesiones largas esporádicas. Los beneficios incluyen mejora en productividad (+25%), fortalecimiento del sistema inmunológico y mejor calidad del sueño.',
        keyPoints: [
          'La atención plena reduce el estrés en un 30% según múltiples estudios',
          'El 70% de los participantes reportó mejoras en 8 semanas de práctica constante',
          'La práctica diaria de 10 minutos es más efectiva que sesiones largas semanales',
          'Los beneficios se observan desde la primera semana de práctica continua',
          'Mindfulness fortalece el sistema inmunológico y mejora la calidad del sueño',
        ],
        quotes: [
          { text: 'La meditación no es escapar del mundo, sino aprender a estar presente en él', attribution: 'Jon Kabat-Zinn' },
        ],
        stats: [
          { label: 'Reducción de estrés', value: '30%', context: 'n=1,200' },
          { label: 'Efectividad en participantes activos', value: '70%', context: '8 semanas' },
          { label: 'Aumento de productividad', value: '+25%', context: 'n=340, post-sesión' },
          { label: 'Práctica recomendada', value: '10 min', context: 'diaria' },
        ],
      },
      {
        title: 'TypeScript 6.0: Novedades y migración',
        sourceType: 'url',
        originalUrl: 'https://ejemplo.com/typescript-6',
        rawContent: 'TypeScript 6.0 introduce mejoras significativas en el sistema de tipos. La nueva versión incluye tipos negados, mejor inferencia en genéricos y un nuevo compilador que es 2x más rápido. "TypeScript 6.0 representa el mayor avance en la experiencia del desarrollador desde la versión 4.0", según Anders Hejlsberg. El 85% de los proyectos que migraron reportaron menos errores en producción. La nueva funcionalidad de tipos negados permite expresar "cualquier tipo excepto X". El equipo de TypeScript afirma que el 90% del código TypeScript existente es compatible con 6.0 sin cambios. La migración desde 5.x es mayoritariamente automatizada con el nuevo comando "npx ts-migrate".',
        mode: 'technical',
        summary: 'TypeScript 6.0 introduce mejoras significativas: tipos negados, mejor inferencia en genéricos y un compilador 2x más rápido. Anders Hejlsberg lo describe como el mayor avance desde la versión 4.0. El 85% de los proyectos migrados reportaron menos errores en producción. El 90% del código TypeScript existente es compatible sin cambios.',
        keyPoints: [
          'TypeScript 6.0 introduce tipos negados para excluir tipos específicos',
          'El nuevo compilador es 2x más rápido que la versión anterior',
          '85% de los proyectos migrados reportaron menos errores en producción',
          'El 90% del código TypeScript 5.x existente es compatible sin cambios',
          'Migración mayoritariamente automatizada con npx ts-migrate',
        ],
        quotes: [
          { text: 'TypeScript 6.0 representa el mayor avance en la experiencia del desarrollador desde la versión 4.0', attribution: 'Anders Hejlsberg' },
        ],
        stats: [
          { label: 'Compatibilidad con código existente', value: '90%', context: 'sin cambios' },
          { label: 'Proyectos con menos errores', value: '85%', context: 'después de migrar' },
          { label: 'Rendimiento del compilador', value: '2x', context: 'más rápido' },
        ],
      },
      {
        title: 'Rust vs Go en 2026',
        sourceType: 'text',
        rawContent: 'La comparación entre Rust y Go sigue siendo uno de los debates más activos en el desarrollo de software. Rust ofrece seguridad de memoria garantizada en tiempo de compilación sin garbage collector, ideal para sistemas de alto rendimiento. Go prioriza la simplicidad y la productividad del desarrollador con un ecosistema robusto para microservicios. Según la encuesta Stack Overflow 2025, Rust es el lenguaje más amado por 8vo año consecutivo con un 87% de aprobación. Go tiene una adopción del 42% en equipos de backend. "Rust es para sistemas donde el rendimiento importa, Go para equipos que necesitan moverte rápido", afirma un análisis de Microsoft Research. Ambas herramientas tienen su lugar en el stack moderno de ingeniería.',
        mode: 'technical',
        summary: 'Rust y Go son dos lenguajes con enfoques diferentes: Rust prioriza seguridad de memoria y rendimiento máximo; Go prioriza simplicidad y productividad para equipos. Rust es el lenguaje más amado por 8vo año (87% aprobación Stack Overflow 2025). Go tiene 42% de adopción en equipos de backend. Ambos tienen su lugar en el stack moderno.',
        keyPoints: [
          'Rust ofrece seguridad de memoria garantizada sin garbage collector',
          'Go prioriza simplicidad y productividad del desarrollador',
          'Rust lidera Stack Overflow como lenguaje más amado por 8vo año',
          'Go tiene 42% de adopción en equipos de backend para microservicios',
          'Rust es ideal para sistemas de alto rendimiento, Go para equipos ágiles',
        ],
        quotes: [
          { text: 'Rust es para sistemas donde el rendimiento importa, Go para equipos que necesitan moverse rápido', attribution: 'Microsoft Research' },
        ],
        stats: [
          { label: 'Aprobación Rust (Stack Overflow 2025)', value: '87%' },
          { label: 'Adopción Go en backend', value: '42%' },
          { label: 'Años consecutivos Rust #1', value: '8' },
        ],
      },
    ];

    for (const article of articles) {
      const source = await this.sourceRepo.save({
        userId: user.id,
        title: article.title,
        sourceType: article.sourceType,
        originalUrl: article.originalUrl || null,
        rawContent: article.rawContent,
        mode: article.mode,
        analysisLength: 'normal',
      } as any);

      const summary = await this.summaryRepo.save({
        sourceId: source.id,
        executiveSummary: article.summary,
        tone: article.mode === 'technical' ? 'technical' : 'general',
        sentiment: article.mode === 'technical' ? 'neutral' : 'positive',
      } as any);

      for (let i = 0; i < (article as any).keyPoints.length; i++) {
        await this.kpRepo.save({
          sourceId: source.id,
          text: article.keyPoints[i],
          relevanceScore: Math.max(1, 10 - i),
          sortOrder: i,
        } as any);
      }

      for (let i = 0; i < article.quotes.length; i++) {
        await this.quoteRepo.save({
          sourceId: source.id,
          text: article.quotes[i].text,
          attribution: article.quotes[i].attribution || null,
          sortOrder: i,
        } as any);
      }

      for (let i = 0; i < article.stats.length; i++) {
        const s: any = article.stats[i];
        await this.statRepo.save({
          sourceId: source.id,
          label: s.label,
          value: s.value,
          context: s.context || null,
          sortOrder: i,
        } as any);
      }
    }

    // Create collections
    const collections = await this.colRepo.save([
      { userId: user.id, name: 'Salud y Bienestar', description: 'Artículos sobre salud mental y bienestar físico' } as any,
      { userId: user.id, name: 'Desarrollo de Software', description: 'Tecnología, lenguajes y mejores prácticas' } as any,
      { userId: user.id, name: 'Ciencia y Tecnología', description: 'Avances científicos y tecnológicos' } as any,
    ]);

    // Link sources to collections
    const allSources = await this.sourceRepo.find({ where: { userId: user.id } });
    if (allSources.length >= 2) {
      await this.csRepo.save({ collectionId: collections[0].id, sourceId: allSources[0].id } as any);
      await this.csRepo.save({ collectionId: collections[1].id, sourceId: allSources[1].id } as any);
      await this.csRepo.save({ collectionId: collections[1].id, sourceId: allSources[2].id } as any);
    }

    console.log(`Seeded ${articles.length} sources with full analysis`);
    console.log(`Seeded ${collections.length} collections`);
    console.log('Seed complete!');
  }
}
