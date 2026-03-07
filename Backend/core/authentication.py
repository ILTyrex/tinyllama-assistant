from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """JWT authentication that also supports reading the token from a cookie.

    This allows browser requests (e.g. navigation) to be authenticated if the
    frontend stores the access token in an HttpOnly cookie.
    """

    COOKIE_NAME = "accessToken"

    def get_raw_token(self, header):
        raw_token = super().get_raw_token(header)
        if raw_token is not None:
            return raw_token

        # Fallback to cookie if no Authorization header was provided.
        request = self.context.get("request")
        if request is not None:
            return request.COOKIES.get(self.COOKIE_NAME)
        return None
