import pickle
import pandas as pd
import numpy as np
from json_loader import get_config

chosen_model = get_config("predict_model")
models_path = "../models/"

match chosen_model:
    case "AdaBoost":
        model_path = f"{models_path}adaboost_model.pkl"
    case "Decision_Tree":
        model_path = f"{models_path}dtree_model.pkl"
    case "Logarithmic_Regression":
        model_path = f"{models_path}logreg_model.pkl"
    case "XGBoost":
        model_path = f"{models_path}xgb_model.pkl"


f = open(model_path, "rb")
model = pickle.load(f)

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
    
    