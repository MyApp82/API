import { IsString, IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    @MinLength(5)
    password!: string;

    @IsNotEmpty()
    status!: boolean;
}

export class LoginUserDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    password!: string;
}

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;
    
    @IsNotEmpty()
    status!: string;
}

export class ForgotPasswordUserDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    @MinLength(5)
    newPassword!: string;
}

export class DisplayUserDto {
    id!: number;
    
    name!: string;

    email!: string;

    password!: string;

    status!: boolean;
}