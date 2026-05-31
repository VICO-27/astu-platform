web: gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
worker: celery -A core worker -l info --concurrency 2
