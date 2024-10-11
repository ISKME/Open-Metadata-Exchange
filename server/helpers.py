from starlette.types import Scope
from starlette.responses import Response

# import importlib.util
import os
import stat
# import typing
# from email.utils import parsedate

import anyio
import anyio.to_thread

# from starlette._utils import get_route_path
from starlette.datastructures import URL  # , Headers
from starlette.exceptions import HTTPException
from starlette.responses import FileResponse, RedirectResponse  # , Response
# from starlette.types import Receive, Scope, Send

from fastapi.staticfiles import StaticFiles


class MocAPI(StaticFiles):
    """
    This is a temporary Middleware class to Moc the API until the
    API is filled out over time. The idea is to save static server
    responses in the 'static/api/imls' directory as json files. When
    the frontend makes API requests, the backend server will respond
    with the stored responses.

    Then, one-by-one, we will re-implement the API endpoint to respond
    in the same way but by making the appropriate queries to the INN
    server or the ElasticSearch server as appropriate.

    Once all the API endpoints are replicated, we can get rid of this class.

    IMPORTANT: the '/api/imls' URL prefix is routed to this
    class. But, we can add specific routes for, say,
    '/api/imls/search' to a specific handler without having to make
    any changes here. That way, this handler will remain as a fallback
    handler for any URL that doesn't already have an actual
    implemented handler.
    """

    async def get_response(self, path: str, scope: Scope) -> Response:
        """
        Returns an HTTP response, given the incoming path, method and request headers.
        """

        if scope["method"] not in ("GET", "HEAD"):
            raise HTTPException(status_code=405)

        try:
            full_path, stat_result = await anyio.to_thread.run_sync(
                self.lookup_path, path
            )
        except PermissionError:
            raise HTTPException(status_code=401)
        except OSError:
            raise

        if stat_result and stat.S_ISREG(stat_result.st_mode):
            # We have a static file to serve.
            return self.file_response(full_path, stat_result, scope)

        elif stat_result and stat.S_ISDIR(stat_result.st_mode) and self.html:
            # We're in HTML mode, and have got a directory URL.
            # Check if we have 'index.json' file to serve.
            index_path = os.path.join(path, "index.json")
            full_path, stat_result = await anyio.to_thread.run_sync(
                self.lookup_path, index_path
            )
            if stat_result is not None and stat.S_ISREG(stat_result.st_mode):
                if not scope["path"].endswith("/"):
                    # Directory URLs should redirect to always end in "/".
                    url = URL(scope=scope)
                    url = url.replace(path=url.path + "/")
                    return RedirectResponse(url=url)
                return self.file_response(full_path, stat_result, scope)

        if self.html:
            # Check for '404.html' if we're in HTML mode.
            full_path, stat_result = await anyio.to_thread.run_sync(
                self.lookup_path, "404.html"
            )
            if stat_result and stat.S_ISREG(stat_result.st_mode):
                return FileResponse(full_path, stat_result=stat_result, status_code=404)
        raise HTTPException(status_code=404)
