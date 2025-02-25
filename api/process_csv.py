import pandas as pd
import re

pd.reset_option('display.max_rows')
pd.reset_option('display.max_columns')
pd.reset_option('display.width')
pd.reset_option('display.max_colwidth')

def convertCSVToDataFrame(csv):
    cleaned_csv = re.sub(r'\s*,\s*', ',', csv)
    
    from io import StringIO
    df = pd.read_csv(StringIO(cleaned_csv))
    
    return df
