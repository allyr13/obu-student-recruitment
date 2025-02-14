import unittest
import requests

class TestDemo(unittest.TestCase):
    global HOST
    global PORT
    HOST = "127.0.0.1"
    PORT = "5555"
    
    @classmethod
    def setUpClass(cls):
        """Test if we can establish a connection to the server."""
        try:
            r = requests.get(f"http://{HOST}:{PORT}/")
            r.raise_for_status()
            print("Connection to the server established successfully.")
        except requests.exceptions.RequestException as e:
            print("Failed to connect to the server:", e)
            cls.skip_tests = True  # Set a flag to skip tests
            print("Skipping tests due to failed connection.")
            raise unittest.SkipTest("Skipping tests due to failed connection.")
    
    def test_home(self):
        self.assertFalse(hasattr(self, 'skip_tests'))
        r = requests.get(f"http://{HOST}:{PORT}/")
        self.assertEqual(r.text, "Hello, Flask!")

    def test_successful_get(self):
        self.assertFalse(hasattr(self, 'skip_tests'))
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.get(f"http://{HOST}:{PORT}/get_example", headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 200)

    def test_successful_post(self):
        self.assertFalse(hasattr(self, 'skip_tests'))
        payload = { "message": "Hello from testing"}
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post(f"http://{HOST}:{PORT}/post_example", json=payload, headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 200)

    def test_incorrect_body_post(self):
        self.assertFalse(hasattr(self, 'skip_tests'))
        payload = { "incorrect_key": "This should result in an error"}
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post(f"http://{HOST}:{PORT}/post_example", json=payload, headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 400)

    def test_empty_body_post(self):
        self.assertFalse(hasattr(self, 'skip_tests'))
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post(f"http://{HOST}:{PORT}/post_example", json={}, headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 400)

    def test_delete(self):
        self.assertFalse(hasattr(self, 'skip_tests'))
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.delete(f"http://{HOST}:{PORT}/delete_example", headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 200)
        self.assertEqual(data['data'], {})

    def test_csv_upload_success(self):
        self.assertFalse(hasattr(self, 'skip_tests'))

        with open('tests/test.csv', 'r') as f:
            csv_data = f.read()

        header = {'Content-type': 'text/csv', 'Accept': 'text/plain'}
        r = requests.post(f"http://{HOST}:{PORT}/upload_csv", headers=header, data=csv_data)
        data = r.json() 
        self.assertTrue(data["status"] == 200)

    def test_csv_upload_no_payload(self):
        self.assertFalse(hasattr(self, 'skip_tests'))

        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post(f"http://{HOST}:{PORT}/upload_csv", headers=header, data=None)
        data = r.json() 
        self.assertTrue(data["status"] == 400)

if __name__ == '__main__':
    unittest.main()
