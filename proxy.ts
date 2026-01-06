import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

type ParsedCookie = ReturnType<typeof parse>;
type SameSite = 'lax' | 'strict' | 'none';
function buildCookieOptions(parsed: ParsedCookie) {
  const options: {
    path?: string;
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: SameSite;
  } = {};

  if (parsed.Path) options.path = parsed.Path;

  if (parsed['Max-Age'] !== undefined) {
    const maxAge = Number(parsed['Max-Age']);
    if (!Number.isNaN(maxAge)) {
      options.maxAge = maxAge;
    }
  }

  if (parsed.Expires !== undefined) {
    const expires = new Date(parsed.Expires);
    if (!Number.isNaN(expires.getTime())) {
      options.expires = expires;
    }
  }

  if (parsed.HttpOnly) options.httpOnly = true;
  if (parsed.Secure) options.secure = true;
  if (parsed.SameSite) {
    options.sameSite = parsed.SameSite.toLowerCase() as SameSite;
  }

  return options;
}


export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

  if (!accessToken) {
    if (refreshToken) {
      try {
        const data = await checkServerSession();
        const setCookie = data.headers?.['set-cookie'];

        if (!setCookie) {
          throw new Error('No set-cookie returned');
        }

        const cookieArray = Array.isArray(setCookie)
          ? setCookie
          : [setCookie];

        let newAccessToken: string | null = null;

        for (const cookieStr of cookieArray) {
          const parsed = parse(cookieStr);
          const options = buildCookieOptions(parsed);

          if (parsed.accessToken) {
            newAccessToken = parsed.accessToken;
            cookieStore.set('accessToken', parsed.accessToken, options);
          }

          if (parsed.refreshToken) {
            cookieStore.set('refreshToken', parsed.refreshToken, options);
          }
        }

        if (!newAccessToken) {
          throw new Error('Refresh did not return accessToken');
        }

        if (isPublicRoute) {
          return NextResponse.redirect(new URL('/', request.url), {
            headers: {
              Cookie: cookieStore.toString(),
            },
          });
        }

        if (isPrivateRoute) {
          return NextResponse.next({
            headers: {
              Cookie: cookieStore.toString(),
            },
          });
        }
      
      return NextResponse.redirect(new URL('/', request.url));

      } catch {
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');

        if (isPrivateRoute) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        if (isPublicRoute) {
          return NextResponse.next();
        }

        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (isPrivateRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  if (isPrivateRoute) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/', request.url));

}

export const config = {
  matcher: ['/profile/:path*', '/sign-in', '/sign-up', '/notes/:path*'],
};
