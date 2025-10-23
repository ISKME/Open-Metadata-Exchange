from pond import Pond, PooledObjectFactory, PooledObject
import os
from nntp import NNTPClient, NNTPError

class ClientFactory(PooledObjectFactory):
    def createInstance(self) -> PooledObject:
        # Environment variable INN_SERVER_NAME is defined in the docker-compose.yml file.
        inn_server_name = os.getenv("INN_SERVER_NAME", "localhost")
        port = 119
        client = NNTPClient(inn_server_name, port=port, username="node", password="node")
        return PooledObject(client)

    def destroy(self, pooled_object: PooledObject):
        del pooled_object

    def reset(self, pooled_object: PooledObject) -> PooledObject:
        # do whatever we need to do for resetting a connection.
        # e.g. commit or abort a transaction, in the case of an RDBMS.
        return pooled_object

    def validate(self, pooled_object: PooledObject) -> bool:
        # test the connection and validate it's working
        con = pooled_object.keeped_object
        try:
            # TODO: is there a way to check the con.socket.fd to see
            # if the connection is closed? This is good for now but
            # would be nice if we didn't have to issue a command to
            # the NNTP server to check if the connection is still
            # active.
            _dd = con.date()
        except NNTPError as err:
            # Connections isn't usable anymore.
            return False
        return True


pond = Pond(borrowed_timeout=2,
            time_between_eviction_runs=-1,
            thread_daemon=True,
            eviction_weight=0.8)

factory = ClientFactory(pooled_maxsize=10, least_one=True)
pond.register(factory)


class ClientContextManager:
    def __enter__(self):
        self.pooled = pond.borrow(factory)
        con = self.pooled.use()
        return con

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            # Exception occured. Check to see if it's a connection
            # related exception. Then delete the connection.
            pass
        pond.recycle(self.pooled, factory)
