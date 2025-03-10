import pickle
import pandas as pd
import numpy as np

f = open("../models/xgb_model.pkl", "rb") #TODO: load different models as needed/specified
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
    
    