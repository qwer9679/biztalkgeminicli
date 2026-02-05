import unittest
import json
import sys
import os

# 상위 디렉토리의 app.py를 import하기 위해 경로 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app

class BizToneTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_health_check(self):
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['status'], 'healthy')

    def test_convert_no_text(self):
        response = self.app.post('/api/convert', 
                                 data=json.dumps({'target': 'boss'}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('변환할 텍스트를 입력해주세요', response.json['error'])

    def test_convert_invalid_target(self):
        response = self.app.post('/api/convert', 
                                 data=json.dumps({'text': '테스트', 'target': 'invalid_target'}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('유효하지 않은 대상입니다', response.json['error'])

    def test_feedback_endpoint(self):
        response = self.app.post('/api/feedback', 
                                 data=json.dumps({'type': 'like', 'original': 'a', 'converted': 'b'}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['status'], 'success')

if __name__ == '__main__':
    unittest.main()
