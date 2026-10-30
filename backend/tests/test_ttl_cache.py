import time
import threading
from util.ttl_cache import TTLCache


class TestTTLCache:
    """Unit tests for the thread-safe in-memory TTLCache."""

    def test_invalid_parameters_raise(self):
        import pytest
        with pytest.raises(ValueError):
            TTLCache(maxsize=0)
        with pytest.raises(ValueError):
            TTLCache(maxsize=10, ttl=0)

    def test_basic_set_and_get(self):
        cache = TTLCache(maxsize=10, ttl=60)
        cache.set("key1", "value1")
        assert cache.get("key1") == "value1"
        assert "key1" in cache
        assert len(cache) == 1

    def test_get_nonexistent_key_returns_default(self):
        cache = TTLCache(maxsize=10, ttl=60)
        assert cache.get("nonexistent") is None
        assert cache.get("nonexistent", default="fallback") == "fallback"
        assert "nonexistent" not in cache

    def test_key_override_updates_value_and_resets_ttl(self, monkeypatch):
        current_time = 1000.0
        monkeypatch.setattr(time, "monotonic", lambda: current_time)

        cache = TTLCache(maxsize=10, ttl=10)
        cache.set("k1", "v1")
        assert cache.get("k1") == "v1"

        # Advance time by 8s (still valid)
        current_time = 1008.0
        assert cache.get("k1") == "v1"

        # Update k1, which resets TTL
        cache.set("k1", "v2")
        current_time = 1015.0
        # Reset at 1008 with ttl=10 means valid until 1018.
        # At 1015, it is still alive.
        assert cache.get("k1") == "v2"

    def test_ttl_expiration(self, monkeypatch):
        current_time = 100.0
        monkeypatch.setattr(time, "monotonic", lambda: current_time)

        cache = TTLCache(maxsize=10, ttl=5)
        cache.set("temp", "data")
        assert cache.get("temp") == "data"
        assert "temp" in cache

        # Advance time past TTL
        current_time = 106.0
        assert cache.get("temp") is None
        assert "temp" not in cache
        assert len(cache) == 0

    def test_custom_item_level_ttl(self, monkeypatch):
        current_time = 100.0
        monkeypatch.setattr(time, "monotonic", lambda: current_time)

        cache = TTLCache(maxsize=10, ttl=60)
        cache.set("short_lived", "val", ttl=5)
        cache.set("normal", "val")

        current_time = 106.0
        assert cache.get("short_lived") is None
        assert cache.get("normal") == "val"

    def test_capacity_lru_eviction(self):
        cache = TTLCache(maxsize=3, ttl=60)
        cache.set("a", 1)
        cache.set("b", 2)
        cache.set("c", 3)

        assert len(cache) == 3

        # Access "a" so it is not the least recently used
        assert cache.get("a") == 1

        # Add "d", which should evict "b" (oldest unaccessed)
        cache.set("d", 4)
        assert len(cache) == 3
        assert cache.get("b") is None
        assert cache.get("a") == 1
        assert cache.get("c") == 3
        assert cache.get("d") == 4

    def test_delete_and_pop(self, monkeypatch):
        current_time = 100.0
        monkeypatch.setattr(time, "monotonic", lambda: current_time)

        cache = TTLCache(maxsize=10, ttl=10)
        cache.set("del_key", 42)

        # pop existing
        val = cache.pop("del_key")
        assert val == 42
        assert cache.get("del_key") is None

        # pop nonexistent
        assert cache.pop("del_key", default=-1) == -1

        # pop expired
        cache.set("exp_key", 999)
        current_time = 120.0
        assert cache.pop("exp_key", default=0) == 0

        # delete
        cache.set("del2", 99)
        cache.delete("del2")
        assert cache.get("del2") is None

        # delete non-existent should not raise
        cache.delete("unknown")

        # __contains__ expired key removes it
        cache.set("exp2", 50)
        current_time = 140.0
        assert ("exp2" in cache) is False

        # __len__ cleans expired keys
        cache.set("exp3", 10)
        current_time = 160.0
        assert len(cache) == 0

    def test_clear(self):
        cache = TTLCache(maxsize=10, ttl=60)
        cache.set("k1", 1)
        cache.set("k2", 2)
        assert len(cache) == 2

        cache.clear()
        assert len(cache) == 0
        assert cache.get("k1") is None
        assert cache.get("k2") is None

    def test_stats_tracking(self):
        cache = TTLCache(maxsize=2, ttl=60)
        cache.set("a", 1)
        cache.set("b", 2)

        # Hits & misses
        assert cache.get("a") == 1  # hit
        assert cache.get("c") is None  # miss
        assert cache.get("a") == 1  # hit

        # Eviction
        cache.set("c", 3)  # evicts "b"

        stats = cache.stats()
        assert stats["hits"] == 2
        assert stats["misses"] == 1
        assert stats["evictions"] == 1
        assert stats["size"] == 2
        assert stats["maxsize"] == 2

    def test_thread_safety_concurrent_access(self):
        cache = TTLCache(maxsize=100, ttl=10)
        errors = []

        def worker(thread_id):
            try:
                for i in range(100):
                    cache.set(f"key_{thread_id}_{i}", i)
                    val = cache.get(f"key_{thread_id}_{i}")
                    if val != i and val is not None:
                        errors.append(f"Mismatch: expected {i}, got {val}")
            except Exception as e:
                errors.append(str(e))

        threads = [
            threading.Thread(target=worker, args=(t,))
            for t in range(5)
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(errors) == 0, f"Errors encountered: {errors}"
