import unittest
import requests

class TestDemo(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """Test if we can establish a connection to the server."""
        try:
            r = requests.get("http://0.0.0.0:6000/")
            r.raise_for_status()  # Raises an HTTPError if the HTTP request returned an unsuccessful status code
            print("Connection to the server established successfully.")
        except requests.exceptions.RequestException as e:
            print("Failed to connect to the server:", e)
            cls.skip_tests = True  # Set a flag to skip tests
            print("Skipping tests due to failed connection.")  # Print a notification
            raise unittest.SkipTest("Skipping tests due to failed connection.")
    
    def test_home(self):
        self.assertFalse(hasattr(self, 'skip_tests'))  # Ensure skip_tests flag is not set
        r = requests.get("http://0.0.0.0:6000/")
        self.assertEqual(r.text, "Hello, Flask!")

    def test_successful_get(self):
        self.assertFalse(hasattr(self, 'skip_tests'))  # Ensure skip_tests flag is not set
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.get("http://0.0.0.0:6000/get_example", headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 200)

    def test_successful_post(self):
        self.assertFalse(hasattr(self, 'skip_tests'))  # Ensure skip_tests flag is not set
        payload = { "message": "Hello from testing"}
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post("http://0.0.0.0:6000/post_example", json=payload, headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 200)

    def test_incorrect_body_post(self):
        self.assertFalse(hasattr(self, 'skip_tests'))  # Ensure skip_tests flag is not set
        payload = { "incorrect_key": "This should result in an error"}
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post("http://0.0.0.0:6000/post_example", json=payload, headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 400)

    def test_empty_body_post(self):
        self.assertFalse(hasattr(self, 'skip_tests'))  # Ensure skip_tests flag is not set
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post("http://0.0.0.0:6000/post_example", json={}, headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 400)

    def test_delete(self):
        self.assertFalse(hasattr(self, 'skip_tests'))  # Ensure skip_tests flag is not set
        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.delete("http://0.0.0.0:6000/delete_example", headers=header)
        data = r.json() 
        self.assertTrue(data["status"] == 200)
        self.assertEqual(data['data'], {})

if __name__ == '__main__':
    unittest.main()
