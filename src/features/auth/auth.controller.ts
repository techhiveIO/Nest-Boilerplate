import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post, Query, UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginPayload } from './payloads/login.payload';
import { RegisterByInvitationParamPayload, RegisterPayload } from './payloads/register.payload';
import { AuthService } from './services/auth.service';
import { EmailTokenVerificationPayload, EmailVerificationPayload } from './payloads/email-verification.payload';
import { User } from '../../shared/users/schemas/user.schema';
import { MongoErrorHandlerInterceptor } from '../../core/interceptors/mongo-error-handler.interceptor';
import { ResponseError, ResponseSuccess } from '../../core/response/response';
import { ForgotPasswordParamPayload, ForgotPasswordPayload } from './payloads/forgot-password.payload';
import { ResponseInterface } from '../../core/response/response.interface';

@Controller('auth')
@UseInterceptors(new MongoErrorHandlerInterceptor())
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  public async login(@Body() credentials: LoginPayload): Promise<ResponseInterface> {
    try {
      const response = await this.authService.login(credentials);
      return new ResponseSuccess('LOGIN.SUCCESS', response);
    } catch (e) {
      return new ResponseError('LOGIN.ERROR', e.message);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  public async register(@Body() credentials: RegisterPayload): Promise<ResponseInterface> {
    try {
      const response = await this.authService.register(credentials);
      return new ResponseSuccess('REGISTER.SUCCESS', response);
    } catch (e) {
      return new ResponseError('REGISTER.ERROR', e.message);
    }
  }

  @Post('register/:invitation_token')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  public async registerByInvitation(@Param() params: RegisterByInvitationParamPayload,
                                    @Body() credentials: RegisterPayload): Promise<ResponseInterface> {
    try {
      const response = await this.authService.registerByInvitation(params.invitation_token, credentials);
      return new ResponseSuccess('REGISTER.SUCCESS', response);
    } catch (e) {
      return new ResponseError('REGISTER.ERROR', e.message);
    }
  }

  @Get('resend-verification/:email')
  public async sendEmailVerification(@Param() params: EmailVerificationPayload): Promise<any> {
    try {
      const { email_verification_token } = await this.authService.createEmailVerificationToken(params.email);

      const emailSent = await this.authService.sendEmailVerification(params.email, email_verification_token);

      if (emailSent) {
        return new ResponseSuccess('LOGIN.EMAIL_RESENT', null);
      }
      return new ResponseError('REGISTRATION.ERROR.MAIL_NOT_SENT');
    } catch (error) {
      return new ResponseError('LOGIN.ERROR.SEND_EMAIL', error);
    }
  }

  @Get('verify')
  public async verifyEmail(@Query() params: EmailTokenVerificationPayload): Promise<any> {
    try {
      // todo: login user automatically
      return await this.authService.verifyEmail(params.token);
    } catch (e) {
      console.log(e);
    }
  }

  @Get('forgot-password/:email')
  async sendEmailForgotPassword(@Param() params: any) {
    try {
      return await this.authService.sendEmailForgotPassword(params.email);
    } catch (e) {
      console.error(e);
    }
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(@Param() params: ForgotPasswordParamPayload, @Body() forgotPassword: ForgotPasswordPayload) {
    try {
      const resetPassword = await this.authService.resetPassword(forgotPassword.email,
        params.token, forgotPassword.new_password);
      if (resetPassword) {
        return new ResponseSuccess('RESET_PASSWORD.SUCCESS');
      }
      return new ResponseError('RESET_PASSWORD.CHANGE_PASSWORD_ERROR');
    } catch (e) {
      return e;
    }
  }
}
