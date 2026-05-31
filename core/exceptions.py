"""
ASTU Platform — Custom Exception Handler
Wraps DRF's default handler with consistent error shapes.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            'error':   True,
            'status':  response.status_code,
            'detail':  response.data,
        }

    return response
