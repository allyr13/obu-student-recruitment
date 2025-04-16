import pickle
import pandas as pd
import numpy as np
import posixpath
from pathlib import Path
from json_loader import get_config

chosen_model = get_config("predict_model")

def get_model_path(model_name: str) -> Path:

    # Check local path: models/<model_name>
    local_model_path_str = posixpath.join("models", model_name)
    local_model_path = Path(local_model_path_str)
    if local_model_path.exists():
        return local_model_path.resolve()

    # Docker fallback: <this_file>/../models/<model_name>
    script_dir = Path(__file__).resolve().parent
    docker_model_path_str = posixpath.join("models", model_name)
    docker_model_path = script_dir.parent / Path(docker_model_path_str)
    return docker_model_path

match chosen_model:
    case "AdaBoost":
        model_path = get_model_path("adaboost_model.pkl")
    case "Decision_Tree":
        model_path = get_model_path("dtree_model.pkl")
    case "Logarithmic_Regression":
        model_path = get_model_path("logreg_model.pkl")
    case "XGBoost":
        model_path = get_model_path("xgb_model.pkl")
    case _:
        raise ValueError(f"Model {chosen_model} not found. Please check the model name.")


with open(model_path, "rb") as f:
    model = pickle.load(f)
print(f"{type(model)}")
print(f"Model loaded from {model_path}")

## Input: A one-hot encoded Pandas dataframe
def predict(ohe_df):
    numpy_version = ohe_df.to_numpy()
    predictions = []
    for row in numpy_version:
        prediction = model.predict(row.reshape(1, -1))
        predictions.append(prediction.tolist())
    results = np.array(predictions)
    results = pd.DataFrame(results, columns=["Prediction"])
    results = pd.concat([ohe_df, results], axis=1)
    return results
    
    