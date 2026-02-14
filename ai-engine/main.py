"""
Minimal production-ready Flask application entrypoint.

Features:
- App factory pattern
- Structured logging to stdout (12-factor friendly)
- /ping health endpoint returning plain text
- Config via environment variables (FLASK_ENV, LOG_LEVEL, APP_HOST, APP_PORT)
- Ready for `flask run` or gunicorn: `gunicorn main:app --bind 0.0.0.0:8000`
"""

import os
import logging
from logging import Formatter, StreamHandler
from flask import Flask, Response

DEFAULT_LOG_LEVEL = "INFO"


def configure_logging(level: str) -> None:
    logger = logging.getLogger()
    if logger.handlers:
        # Avoid adding duplicate handlers on reload
        return
    logger.setLevel(level.upper())
    handler = StreamHandler()
    handler.setFormatter(
        Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            "%Y-%m-%d %H:%M:%S",
        )
    )
    logger.addHandler(handler)


def create_app() -> Flask:
    log_level = os.getenv("LOG_LEVEL", DEFAULT_LOG_LEVEL)
    configure_logging(log_level)

    app = Flask(__name__)

    @app.route("/ping", methods=["GET"])
    def ping() -> Response:
        # Plain text response; fast and load‑balancer friendly
        return Response("AI Engine Running", mimetype="text/plain")

    # Optional root redirect / info (can be customized later)
    @app.route("/", methods=["GET"])
    def root() -> Response:
        return Response("OK", mimetype="text/plain")

    app.logger.info("Flask app initialized (log level=%s)", log_level.upper())
    return app


# WSGI entrypoint
app = create_app()


if __name__ == "__main__":
    # Local dev run (do not use in production; use gunicorn/uwsgi instead)
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "8000"))
    debug = os.getenv("FLASK_ENV") == "development"
    app.logger.info("Starting development server on %s:%s (debug=%s)", host, port, debug)
    app.run(host=host, port=port, debug=debug)
