import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Param,
  Delete,
  Patch,
  Query,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from "@nestjs/swagger";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import type { OAuthProfile } from "@node-stack/types";
import { PaginationDto } from "@node-stack/validators";
import type { Request, Response } from "express";

import { AuthService } from "@/auth/auth.service.js";
import { CurrentUser } from "@/auth/decorators/index.js";
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  Verify2faDto,
  Login2faDto,
  RecoveryDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  UpdateProfileDto,
} from "@/auth/dto/index.js";
import { JwtAuthGuard } from "@/auth/guards/index.js";
import { TwoFactorService } from "@/auth/two-factor/two-factor.service.js";
import { Public } from "@/common/decorators/public.decorator.js";
import type { UserPayload } from "@/common/types/index.js";
import { AccountService } from "@/users/account.service.js";


function extractClientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return (forwarded.split(",")[0] ?? "").trim() || undefined;
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return req.ip;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) { }

  @Throttle({ short: { ttl: 3600000, limit: 10 } })
  @Public()
  @Post("register")
  @ApiOperation({
    summary: "Register a new user",
    description: "Creates a new user account with email and password. Password must be at least 8 characters.",
  })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 400, description: "Email already in use or validation failed" })
  async register(@Body() dto: RegisterDto, @Req() req: Request): Promise<unknown> {
    const userAgent = req.headers["user-agent"];
    const ipAddress = extractClientIp(req);
    return this.authService.register(dto, userAgent, ipAddress);
  }

  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("local"))
  @ApiOperation({
    summary: "Login with email and password",
    description: "Authenticates a user and returns a JWT access token and refresh token. Handles 2FA challenge if enabled.",
  })
  @ApiResponse({
    status: 200,
    description: "Login successful. May return a tempToken if 2FA is required.",
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<unknown> {
    const userAgent = req.headers["user-agent"];
    const ipAddress = extractClientIp(req);
    return this.authService.login(dto, userAgent, ipAddress);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh access token",
    description: "Exchange a valid refresh token for a new access token and a rotated refresh token.",
  })
  @ApiResponse({ status: 200, description: "Tokens rotated successfully" })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  async refresh(@Body() dto: RefreshDto): Promise<unknown> {
    return this.authService.refresh(dto);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Logout current session",
    description: "Invalidates the current session and its refresh token.",
  })
  @ApiResponse({ status: 200, description: "Logged out successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(@CurrentUser("sessionId") sessionId: string): Promise<{ message: string }> {
    await this.authService.logout(sessionId);
    return { message: "Logged out successfully" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Returns the detailed profile of the currently authenticated user.",
  })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async me(@CurrentUser("id") userId: string): Promise<unknown> {
    return this.authService.getUserById(userId);
  }

  @Delete("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Close current user account",
    description:
      "Soft-deletes the current user. Re-authentication via password is required. Sessions are revoked immediately. After 30 days the cron anonymizes PII.",
  })
  @ApiResponse({ status: 204, description: "Account closed" })
  @ApiResponse({ status: 401, description: "Wrong password or no token" })
  async closeAccount(
    @CurrentUser("id") userId: string,
    @Body() dto: { password: string; reason?: string },
    @Req() req: Request,
  ): Promise<void> {
    await this.accountService.closeAccount(userId, dto.password, dto.reason ?? null, {
      ipAddress: extractClientIp(req) ?? null,
      userAgent: req.headers["user-agent"] ?? null,
    });
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Update current user profile",
    description: "Updates the profile information for the currently authenticated user.",
  })
  @ApiResponse({ status: 200, description: "User profile updated" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateProfile(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<unknown> {
    return this.authService.updateProfile(userId, dto);
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "List active sessions",
    description: "Returns a paginated list of all active sessions (devices/browsers) for the current user.",
  })
  @ApiResponse({ status: 200, description: "Paginated list of sessions" })
  async getSessions(
    @CurrentUser() user: UserPayload,
    @Query() page: PaginationDto,
  ): Promise<unknown> {
    return this.authService.getActiveSessions(
      user.id,
      user.sessionId,
      { cursor: page.cursor, limit: page.limit },
    );
  }

  @Delete("sessions/:id")
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Revoke a specific session",
    description: "Invalidates a specific session by ID. If the current session is revoked, the user will be logged out.",
  })
  @ApiResponse({ status: 204, description: "Session revoked" })
  async revokeSession(
    @Param("id") sessionId: string,
    @CurrentUser() user: UserPayload,
    @Req() req: Request,
  ): Promise<void> {
    await this.authService.revokeSession(sessionId, user.id, user.sessionId, {
      ipAddress: extractClientIp(req),
      userAgent: req.headers["user-agent"],
    });
  }

  @Delete("sessions")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Revoke all other sessions",
    description: "Invalidates all active sessions for the current user except the one making the request.",
  })
  @ApiResponse({ status: 200, description: "All other sessions revoked" })
  async revokeAllSessions(
    @CurrentUser() user: UserPayload,
    @Req() req: Request,
  ): Promise<{ count: number }> {
    return this.authService.revokeAllOtherSessions(user.id, user.sessionId, {
      ipAddress: extractClientIp(req),
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("2fa/enable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Enable 2FA (Phase 1)",
    description: "Generates a TOTP secret and a QR code URL for the user to scan with their authenticator app.",
  })
  @ApiResponse({ status: 200, description: "2FA secret and QR code generated" })
  async enable2fa(@CurrentUser("id") userId: string): Promise<unknown> {
    return this.twoFactorService.generateSecret(userId);
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Post("2fa/verify")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Verify and Activate 2FA",
    description: "Verifies the TOTP code from the app and permanently enables 2FA for the account.",
  })
  @ApiResponse({ status: 200, description: "2FA successfully enabled" })
  @ApiResponse({ status: 400, description: "Invalid TOTP code" })
  async verify2fa(@CurrentUser("id") userId: string, @Body() dto: Verify2faDto, @Req() req: Request): Promise<{ enabled: boolean }> {
    await this.twoFactorService.enableTwoFactor(userId, dto.token, {
      ipAddress: extractClientIp(req),
      userAgent: req.headers["user-agent"],
    });
    return { enabled: true };
  }

  @Post("2fa/disable")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Disable 2FA",
    description: "Removes two-factor authentication from the user's account.",
  })
  @ApiResponse({ status: 200, description: "2FA successfully disabled" })
  async disable2fa(@CurrentUser("id") userId: string, @Req() req: Request): Promise<{ disabled: boolean }> {
    await this.twoFactorService.disableTwoFactor(userId, {
      ipAddress: extractClientIp(req),
      userAgent: req.headers["user-agent"],
    });
    return { disabled: true };
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Public()
  @Post("login/2fa")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Complete Login with 2FA",
    description: "Finalizes the login process by verifying the TOTP code using the temporary token provided during the login step.",
  })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid or expired temp token / TOTP code" })
  async login2fa(@Body() dto: Login2faDto, @Req() req: Request): Promise<unknown> {
    const userId = this.twoFactorService.verifyTempToken(dto.tempToken);
    const userAgent = req.headers["user-agent"];
    const ipAddress = extractClientIp(req);
    return this.twoFactorService.verifyLoginToken(
      userId,
      dto.token,
      dto.rememberMe,
      userAgent,
      ipAddress,
    );
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Request password reset",
    description: "Sends a password reset email if the user exists.",
  })
  @ApiResponse({ status: 200, description: "If the email was found, a recovery link was sent." })
  async forgotPassword(@Body() dto: RecoveryDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.email);
    return { message: "If the email was found, a recovery link was sent." };
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Reset password",
    description: "Sets a new password using a valid reset token.",
  })
  @ApiResponse({ status: 200, description: "Password reset successfully." })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.token, dto.newPassword, {
      ipAddress: extractClientIp(req),
      userAgent: req.headers["user-agent"],
    });
    return { message: "Password reset successfully." };
  }

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Change password",
    description: "Updates the current user's password. Requires the current password for verification.",
  })
  @ApiResponse({ status: 200, description: "Password changed successfully." })
  @ApiResponse({ status: 401, description: "Unauthorized or invalid current password" })
  async changePassword(
    @CurrentUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(userId, dto, {
      ipAddress: extractClientIp(req),
      userAgent: req.headers["user-agent"],
    });
    return { message: "Password changed successfully." };
  }

  @Post("email/verification-link")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Send verification email",
    description: "Generates and sends an email verification link to the logged-in user.",
  })
  @ApiResponse({ status: 200, description: "Verification email sent if not already verified." })
  async sendVerificationEmail(@CurrentUser("id") userId: string): Promise<{ message: string }> {
    await this.authService.sendVerificationEmail(userId);
    return { message: "Verification email sent if not already verified." };
  }

  @Public()
  @Post("email/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify email address",
    description: "Confirms a user's email address using a valid verification token.",
  })
  @ApiResponse({ status: 200, description: "Email verified successfully." })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request): Promise<{ message: string } | unknown> {
    // OTP code-based verification: returns tokens so the client can log in immediately
    if (dto.email && dto.code) {
      const userAgent = req.headers["user-agent"];
      const ipAddress = extractClientIp(req);
      return this.authService.verifyEmailWithCode(dto.email, dto.code, userAgent, ipAddress);
    }
    // Token link-based verification (legacy)
    await this.authService.verifyEmail(dto.token, dto.email, dto.code);
    return { message: "Email verified successfully." };
  }

  @Get("audit-logs")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get security audit logs",
    description: "Returns recent security-related actions for the current user, cursor-paginated.",
  })
  @ApiResponse({ status: 200, description: "Paginated list of audit logs." })
  async getAuditLogs(
    @CurrentUser("id") userId: string,
    @Query() page: PaginationDto,
  ): Promise<unknown> {
    return this.authService.getAuditLogs(userId, {
      cursor: page.cursor,
      limit: page.limit,
    });
  }

  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  @SkipThrottle()
  @ApiOperation({
    summary: "Initiate Google OAuth",
    description: "Redirects the user to Google to start the OAuth2 flow. Links to existing accounts if emails match.",
  })
  async googleAuth(): Promise<void> { }

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @SkipThrottle()
  @ApiExcludeEndpoint()
  async googleCallback(
    @CurrentUser() profile: OAuthProfile,
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.handleOAuthLogin(profile);
    const base = this.configService.getOrThrow<string>("FRONTEND_URL");
    const url = new URL("/auth/callback", base);
    url.searchParams.set("token", tokens.accessToken);
    if (tokens.refreshToken) {
      url.searchParams.set("refreshToken", tokens.refreshToken);
    }
    res.redirect(url.toString());
  }

  @Public()
  @Get("github")
  @UseGuards(AuthGuard("github"))
  @SkipThrottle()
  @ApiOperation({
    summary: "Initiate GitHub OAuth",
    description: "Redirects the user to GitHub to start the OAuth2 flow. Links to existing accounts if emails match.",
  })
  async githubAuth(): Promise<void> { }

  @Public()
  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  @SkipThrottle()
  @ApiExcludeEndpoint()
  async githubCallback(
    @CurrentUser() profile: OAuthProfile,
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.handleOAuthLogin(profile);
    const base = this.configService.getOrThrow<string>("FRONTEND_URL");
    const url = new URL("/auth/callback", base);
    url.searchParams.set("token", tokens.accessToken);
    res.redirect(url.toString());
  }
}
