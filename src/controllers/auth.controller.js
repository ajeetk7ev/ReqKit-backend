import { AuthService } from '../services/auth.service.js';
import { AuthValidation } from '../validations/auth.validation.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Cookie options for secure token storage
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

const accessTokenOptions = {
  ...cookieOptions,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

const refreshTokenOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  /**
   * Register User with Email and Password
   */
  static register = asyncHandler(async (req, res) => {
    const validatedData = AuthValidation.validateRegister(req.body);
    const { accessToken, refreshToken, user } = await AuthService.registerUser(validatedData);

    return res
      .status(201)
      .cookie('accessToken', accessToken, accessTokenOptions)
      .cookie('refreshToken', refreshToken, refreshTokenOptions)
      .json(
        new ApiResponse(
          201,
          { user, accessToken, refreshToken },
          'User registered successfully'
        )
      );
  });

  /**
   * Login User with Email and Password
   */
  static login = asyncHandler(async (req, res) => {
    const validatedData = AuthValidation.validateLogin(req.body);
    const { accessToken, refreshToken, user } = await AuthService.loginUser(validatedData);

    return res
      .status(200)
      .cookie('accessToken', accessToken, accessTokenOptions)
      .cookie('refreshToken', refreshToken, refreshTokenOptions)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, refreshToken },
          'User logged in successfully'
        )
      );
  });

  /**
   * Refresh Access & Refresh Tokens
   */
  static refresh = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken, refreshToken, user } = await AuthService.refreshTokens(incomingRefreshToken);

    return res
      .status(200)
      .cookie('accessToken', accessToken, accessTokenOptions)
      .cookie('refreshToken', refreshToken, refreshTokenOptions)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, refreshToken },
          'Tokens refreshed successfully'
        )
      );
  });

  /**
   * Google OAuth Callback
   */
  static googleCallback = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, user } = await AuthService.handleGoogleAuth(req.user);

    // If frontend redirect URL is provided in env, redirect with tokens or set cookies
    const redirectUrl = process.env.CLIENT_REDIRECT_URL || 'http://localhost:5173/auth/success';

    return res
      .status(200)
      .cookie('accessToken', accessToken, accessTokenOptions)
      .cookie('refreshToken', refreshToken, refreshTokenOptions)
      .redirect(redirectUrl);
  });

  /**
   * Logout User and clear HTTP-only Cookies
   */
  static logout = asyncHandler(async (req, res) => {
    await AuthService.logoutUser(req.user?._id);

    return res
      .status(200)
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions)
      .json(new ApiResponse(200, null, 'User logged out successfully'));
  });

  /**
   * Get Current Authenticated User Profile
   */
  static getMe = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(new ApiResponse(200, { user: req.user }, 'Current user profile fetched successfully'));
  });
}
