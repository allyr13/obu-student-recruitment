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

if __name__ == '__main__':
    unittest.main()
