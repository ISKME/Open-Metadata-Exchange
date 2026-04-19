"""NNTP connection pool for the OME server.

Provides a small ``pond``-backed pool of ``pynntp.NNTPClient`` instances
and a context manager (``ClientContextManager``) that borrows / returns
them.

Security notes
--------------
Credentials are **never** hardcoded. ``INN_USERNAME`` and
``INN_PASSWORD`` must be present in the environment (see
``.env.example`` for local development, and the ``docker-compose.yml``
service definition for the ``inn`` container defaults). Missing or
empty values raise :class:`MissingNNTPCredentialsError` at connection
time — we fail fast rather than silently substitute a default.

Reliability notes
-----------------
If any exception is raised inside ``with ClientContextManager() as c:``,
the pooled connection is *destroyed* (via ``factory.destroy``) rather
than ``recycle``d back into the pool. The connection's state after an
error is unknown, and returning it to the pool would let the next
caller inherit a broken socket.
"""

from __future__ import annotations

import os
from types import TracebackType

from nntp import NNTPClient, NNTPError
from pond import Pond, PooledObject, PooledObjectFactory


class MissingNNTPCredentialsError(RuntimeError):
    """Raised when required NNTP credential env vars are missing or empty.

    This is fatal and intentional: we refuse to fall back to a hardcoded
    default, because that is exactly the bug issue #2 exists to fix.
    """


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        msg = (
            f"Required environment variable {name!r} is not set. "
            "NNTP credentials must be provided via INN_USERNAME and "
            "INN_PASSWORD — there is no hardcoded fallback. "
            "See .env.example."
        )
        raise MissingNNTPCredentialsError(msg)
    return value


class ClientFactory(PooledObjectFactory):
    """Creates ``pynntp.NNTPClient`` instances for the pool.

    Reads connection parameters from the environment on *each* call to
    ``createInstance`` so tests and long-running processes pick up
    rotated credentials without a restart:

    * ``INN_SERVER_NAME`` — hostname of the INN server (default
      ``localhost``).
    * ``INN_PORT`` — optional override, defaults to 119.
    * ``INN_USERNAME`` / ``INN_PASSWORD`` — required, no default.
    """

    def createInstance(self) -> PooledObject:  # noqa: N802 — pond API
        inn_server_name = os.getenv("INN_SERVER_NAME", "localhost")
        port = int(os.getenv("INN_PORT", "119"))
        username = _require_env("INN_USERNAME")
        password = _require_env("INN_PASSWORD")
        client = NNTPClient(
            inn_server_name,
            port=port,
            username=username,
            password=password,
        )
        return PooledObject(client)

    def destroy(self, pooled_object: PooledObject) -> None:
        """Release the client's socket as the pool drops the object."""
        try:
            client = pooled_object.keeped_object
            quit_ = getattr(client, "quit", None)
            if callable(quit_):
                quit_()
        except (NNTPError, OSError):
            # Best-effort close; if the connection is already dead, so
            # be it — we're about to discard the object anyway.
            pass
        del pooled_object

    def reset(self, pooled_object: PooledObject) -> PooledObject:
        # Whatever per-use reset is needed would live here. NNTP is
        # mostly stateless per command so there's nothing to undo.
        return pooled_object

    def validate(self, pooled_object: PooledObject) -> bool:
        """Return True if the underlying connection still responds.

        Pond calls this before handing a pooled object to a borrower; a
        False return causes pond to discard the object.
        """
        con = pooled_object.keeped_object
        try:
            con.date()
        except NNTPError:
            return False
        return True


pond = Pond(
    borrowed_timeout=2,
    time_between_eviction_runs=-1,
    thread_daemon=True,
    eviction_weight=0.8,
)

factory = ClientFactory(pooled_maxsize=10, least_one=True)
pond.register(factory)


class ClientContextManager:
    """Borrow an NNTP client for the duration of a ``with`` block.

    On clean exit the client is recycled back into the pool. If any
    exception escapes the block, the client is **destroyed** instead —
    see module docstring for the rationale.
    """

    def __enter__(self) -> NNTPClient:
        self.pooled = pond.borrow(factory)
        return self.pooled.use()

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> bool:
        if exc_type is None:
            pond.recycle(self.pooled, factory)
        else:
            # Connection state is unknown after any exception. Do NOT
            # return it to the pool; destroy it so the next borrower
            # gets a fresh client.
            factory.destroy(self.pooled)
        return False  # never suppress exceptions
