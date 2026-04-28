import torch
import sys

def probe(path):
    try:
        obj = torch.load(path, map_location='cpu')
        print(f"Type: {type(obj)}")
        if isinstance(obj, dict):
            print("Keys:", obj.keys())
            # Check if it's a state_dict or a wrapped object
            first_key = list(obj.keys())[0]
            if isinstance(obj[first_key], torch.Tensor):
                print("Likely a state_dict.")
            else:
                print(f"First value type: {type(obj[first_key])}")
        else:
            print("Likely a full model object.")
            if hasattr(obj, 'state_dict'):
                print("Has state_dict method.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    probe(sys.argv[1])
