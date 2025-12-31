import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../strategies/jwt.strategy';

/**
 * CurrentUser decorator to extract user from request.
 * Use in controller methods to get the authenticated user.
 *
 * @example
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * getMe(@CurrentUser() user: RequestUser) {
 *   return user;
 * }
 *
 * @example
 * // Get specific property
 * @Get('my-id')
 * @UseGuards(JwtAuthGuard)
 * getMyId(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    // If specific property requested, return only that property
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
