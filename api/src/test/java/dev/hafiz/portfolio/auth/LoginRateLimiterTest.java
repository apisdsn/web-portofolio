package dev.hafiz.portfolio.auth;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class LoginRateLimiterTest {

    /** Clock that tests can move forward. */
    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T00:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    @Test
    void blocksAfterMaxFailuresWithinWindow() {
        LoginRateLimiter limiter = new LoginRateLimiter(3, Duration.ofMinutes(15), new MutableClock());

        limiter.recordFailure("1.2.3.4");
        limiter.recordFailure("1.2.3.4");
        assertThat(limiter.isBlocked("1.2.3.4")).isFalse();

        limiter.recordFailure("1.2.3.4");
        assertThat(limiter.isBlocked("1.2.3.4")).isTrue();
        assertThat(limiter.isBlocked("5.6.7.8")).isFalse();
    }

    @Test
    void unblocksAfterWindowPasses() {
        MutableClock clock = new MutableClock();
        LoginRateLimiter limiter = new LoginRateLimiter(2, Duration.ofMinutes(15), clock);
        limiter.recordFailure("ip");
        limiter.recordFailure("ip");
        assertThat(limiter.isBlocked("ip")).isTrue();

        clock.advance(Duration.ofMinutes(16));

        assertThat(limiter.isBlocked("ip")).isFalse();
    }

    @Test
    void resetClearsFailures() {
        LoginRateLimiter limiter = new LoginRateLimiter(1, Duration.ofMinutes(15), new MutableClock());
        limiter.recordFailure("ip");

        limiter.reset("ip");

        assertThat(limiter.isBlocked("ip")).isFalse();
    }
}
