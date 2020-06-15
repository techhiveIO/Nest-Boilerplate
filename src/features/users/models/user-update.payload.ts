import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserUpdatePayload {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  password: string;
}
