import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto: RegisterDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    const hashedPassword = crypto.createHash('sha256').update(dto.password).digest('hex');

    const createdUser = {
      id: 1,
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should register a new user and return token with user (excluding password)', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(createdUser);
      mockUserRepo.save.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(dto);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      });
      expect(mockUserRepo.save).toHaveBeenCalledWith(createdUser);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
      });
      expect(result.token).toBe('jwt-token');
      expect(result.user).toEqual({
        id: 1,
        email: dto.email,
        name: dto.name,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw ConflictException when email is already registered', async () => {
      mockUserRepo.findOne.mockResolvedValue(createdUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const hashedPassword = crypto.createHash('sha256').update(dto.password).digest('hex');

    const foundUser = {
      id: 1,
      email: dto.email,
      name: 'Test User',
      password: hashedPassword,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should return token and user (excluding password) for valid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(foundUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(dto);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: foundUser.id,
        email: foundUser.email,
      });
      expect(result.token).toBe('jwt-token');
      expect(result.user).toEqual({
        id: 1,
        email: dto.email,
        name: 'Test User',
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt,
      });
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const wrongPasswordUser = { ...foundUser, password: 'wrong-hash' };
      mockUserRepo.findOne.mockResolvedValue(wrongPasswordUser);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const foundUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockUserRepo.findOne.mockResolvedValue(foundUser);

      const result = await service.getProfile(1);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt,
      });
      expect((result as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
