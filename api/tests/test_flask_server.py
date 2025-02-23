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

    def test_csv_upload_success(self):
        self.assertFalse(hasattr(self, 'skip_tests'))

        # Hard code csv data to avoid file path errors
        csv_data = "first,last,sex,age\njohn,doe,male,36\njane,smith,female,32\nmark,jackson,male,20\nclark,kent,male,50"

        header = {'Content-type': 'text/csv', 'Accept': 'text/plain'}
        r = requests.post(f"http://{HOST}:{PORT}/api/upload_csv", headers=header, data=csv_data)
        data = r.json() 
        self.assertTrue(data["status"] == 200)

    def test_csv_upload_no_payload(self):
        self.assertFalse(hasattr(self, 'skip_tests'))

        header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post(f"http://{HOST}:{PORT}/api/upload_csv", headers=header, data=None)
        data = r.json() 
        self.assertTrue(data["status"] == 400)

if __name__ == '__main__':
    unittest.main()
