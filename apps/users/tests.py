from django.test import TestCase, Client


class SmokeTests(TestCase):
    def test_index_returns_running_message(self):
        c = Client()
        resp = c.get('/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'ASTU Platform API is running', resp.content)
