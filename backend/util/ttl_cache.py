"""
Thread-safe, Zero-Dependency In-Memory TTLCache

Implements LRU capacity eviction and time-to-live (TTL) expiration using
standard library OrderedDict, time.monotonic, and threading.RLock.
"""

import time
import threading
from collections import OrderedDict
from typing import Any, Dict, Optional, Tuple


class TTLCache:
    """
    Thread-safe in-memory cache with capacity limits and time-to-live eviction.

    Attributes:
        maxsize: Maximum number of elements allowed before LRU eviction.
        ttl: Default expiration in seconds.
    """

    def __init__(self, maxsize: int = 128, ttl: float = 3600.0):
        if maxsize <= 0:
            raise ValueError("maxsize must be greater than 0")
        if ttl <= 0:
            raise ValueError("ttl must be greater than 0")

        self.maxsize = maxsize
        self.ttl = float(ttl)

        # Store maps: key -> (value, expires_at)
        self._store: OrderedDict[Any, Tuple[Any, float]] = OrderedDict()
        self._lock = threading.RLock()

        self._hits: int = 0
        self._misses: int = 0
        self._evictions: int = 0

    def _is_expired(self, expires_at: float) -> bool:
        return time.monotonic() > expires_at

    def get(self, key: Any, default: Any = None) -> Any:
        """Retrieves a cached value if unexpired, updating its LRU position."""
        with self._lock:
            if key not in self._store:
                self._misses += 1
                return default

            value, expires_at = self._store[key]
            if self._is_expired(expires_at):
                del self._store[key]
                self._misses += 1
                return default

            # Move to end for LRU order
            self._store.move_to_end(key)
            self._hits += 1
            return value

    def set(self, key: Any, value: Any, ttl: Optional[float] = None) -> None:
        """Stores a value in the cache with optional custom TTL."""
        active_ttl = float(ttl) if ttl is not None else self.ttl
        expires_at = time.monotonic() + active_ttl

        with self._lock:
            if key in self._store:
                del self._store[key]

            # Evict LRU entries if full
            while len(self._store) >= self.maxsize:
                self._store.popitem(last=False)
                self._evictions += 1

            self._store[key] = (value, expires_at)

    def delete(self, key: Any) -> None:
        """Removes a key from the cache if present."""
        with self._lock:
            if key in self._store:
                del self._store[key]

    def pop(self, key: Any, default: Any = None) -> Any:
        """Removes and returns a value from the cache if unexpired."""
        with self._lock:
            if key not in self._store:
                return default
            value, expires_at = self._store.pop(key)
            if self._is_expired(expires_at):
                return default
            return value

    def clear(self) -> None:
        """Removes all keys and values from the cache."""
        with self._lock:
            self._store.clear()

    def __contains__(self, key: Any) -> bool:
        with self._lock:
            if key not in self._store:
                return False
            _, expires_at = self._store[key]
            if self._is_expired(expires_at):
                del self._store[key]
                return False
            return True

    def __len__(self) -> int:
        with self._lock:
            now = time.monotonic()
            # Clean expired items on length query
            expired_keys = [
                k for k, (_, exp) in self._store.items() if now > exp
            ]
            for k in expired_keys:
                del self._store[k]
            return len(self._store)

    def stats(self) -> Dict[str, Any]:
        """Returns cache telemetry: hits, misses, evictions, and size."""
        with self._lock:
            return {
                "hits": self._hits,
                "misses": self._misses,
                "evictions": self._evictions,
                "size": len(self),
                "maxsize": self.maxsize,
                "ttl": self.ttl,
            }
