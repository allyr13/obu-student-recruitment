import pandas as pd
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
import re
from processing.run_model import predict
import json

results_json = None
table_data_results = None

## Processing for Encoding
pre_processing_df = pd.read_csv("prepared_data.csv")
pre_processing_df = pre_processing_df.drop(columns=['ID', 'Enrolled'])
categorical_columns = ['Country', 'State', 'Gender', 'Ethnicity', 'Origin Source',
       'Student Type', 'Major', 'Athlete',
       'Sport', 'Raley College Tag Exists', 'Recruiting Territory',
       'Counselor']
numeric_columns = ['Financial Aid Offered Amount','incoming_text_count','outgoing_text_count',
                   'phone_successful_count','phone_unsuccessful_count','phone_voicemail_count',
                   'Admitted Students Day','Bison Day','Bison Day @ The Weekend','Campus Visit',
                   'Dallas Bison Exclusive','Football Visit','Golf Visit','Oklahoma City Bison Exclusive',
                   'Scholars Bison Day','Scholars Mixer and Banquet','Scholarship Interview',
                   'Scholarship Interview Registration','Softball Visit','Track Visit','Tulsa Bison Exclusive',
                   'Volleyball Visit','Events Attended Count']
final_cols = categorical_columns[:]
final_cols.extend(numeric_columns)


encoded_columns = []
df_encoded = pd.get_dummies(pre_processing_df, columns=categorical_columns, drop_first=True)
encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore", drop="first")
encoder.fit(pre_processing_df[categorical_columns])
scaler = scaler = MinMaxScaler()
numerical_columns = ['Financial Aid Offered Amount', 'incoming_text_count',
                     'outgoing_text_count', 'phone_successful_count', 'phone_unsuccessful_count',
                     'phone_voicemail_count','Events Attended Count']
scaler.fit(df_encoded[numerical_columns])

## Support Functions
def camel_to_title_case(camel_case_str):
    return re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', camel_case_str).title()

def copy_dataframe(df):
    try:
        return df.copy()
    except Exception as e:
        print(f"Error copying DataFrame: {e}")
        return None

def rename_columns(df):
    try:
        df.columns = [camel_to_title_case(col) for col in df.columns]
        return df
    except Exception as e:
        print(f"Error renaming columns: {e}")
        return None

def rename_specific_columns(df):
    try:
        df.rename(columns={
            'Counselor Incoming Text Count': 'incoming_text_count',
            'Counselor Outgoing Text Count': 'outgoing_text_count',
            'Phone Successful Count': 'phone_successful_count',
            'Phone Unsuccessful Count': 'phone_unsuccessful_count',
            'Phone Voicemail Count': 'phone_voicemail_count',
            'Bison Day At The Weekend': 'Bison Day @ The Weekend'
        }, inplace=True)
        return df
    except Exception as e:
        print(f"Error renaming specific columns: {e}")
        return None

def check_missing_columns(df, categorical_columns):
    try:
        missing_cols = [col for col in categorical_columns if col not in df.columns]
        if missing_cols:
            print(f"Warning: These columns are missing from the DataFrame: {missing_cols}")
    except Exception as e:
        print(f"Error checking missing columns: {e}")

def order_columns(df, final_cols):
    try:
        existing_categorical_columns = [col for col in final_cols if col in df.columns]
        df = df[existing_categorical_columns + [col for col in df.columns if col not in final_cols]]
        return df
    except Exception as e:
        print(f"Error ordering columns: {e}")
        return None

def convert_YN_to_binary(df):
    df = df.map(lambda x: 1 if x == 'Y' else 0 if x == 'N' else x)
    return df

def one_hot_encode(df, categorical_columns, encoder):
    try:
        df[categorical_columns] = df[categorical_columns].astype(str)
        encoded_input = encoder.transform(df[categorical_columns])
        return encoded_input
    except Exception as e:
        print(f"Error during one-hot encoding: {e}")
        return None

def create_encoded_dataframe(encoded_input, categorical_columns, encoder):
    try:
        encoded_columns = encoder.get_feature_names_out(categorical_columns)
        encoded_df = pd.DataFrame(encoded_input, columns=encoded_columns)
        encoded_df = encoded_df.fillna(0).astype(int)
        return encoded_df
    except Exception as e:
        print(f"Error creating encoded DataFrame: {e}")
        return None

def combine_columns(df, encoded_df, categorical_columns):
    try:
        encoded_df_final = pd.concat([df.drop(columns=categorical_columns, axis=1), encoded_df], axis=1)
        encoded_df_final = encoded_df_final.fillna(0)
        return encoded_df_final
    except Exception as e:
        print(f"Error combining columns: {e}")
        return None

def save_dataframe(df, filename):
    try:
        df.to_csv(filename, index=False)
    except Exception as e:
        print(f"Error saving DataFrame to CSV: {e}")

## Main Encoding Function
def one_hot_encode_df(df_input):
    df = copy_dataframe(df_input)

    if df is None: return None
    print(df.head())

    df = rename_columns(df)
    if df is None: return None

    df = rename_specific_columns(df)
    if df is None: return None

    check_missing_columns(df, categorical_columns)

    df = order_columns(df, final_cols)
    if df is None: return None

    df = convert_YN_to_binary(df)

    encoded_input = one_hot_encode(df, categorical_columns, encoder)
    if encoded_input is None: return None

    encoded_df = create_encoded_dataframe(encoded_input, categorical_columns, encoder)
    if encoded_df is None: return None

    encoded_df_final = combine_columns(df, encoded_df, categorical_columns)
    if encoded_df_final is None: return None

    save_dataframe(encoded_df_final, 'oneHotEncoded_data.csv')

    return encoded_df_final

## Main Decoding Function
def decode_df(input_df):
    encoded_df = copy_dataframe(input_df)
    if encoded_df is None: return None

    # Decode Categorical columns
    try:
        decoded_array = encoder.inverse_transform(encoded_df[encoder.get_feature_names_out()])
        decoded_categorical_df = pd.DataFrame(decoded_array, columns=encoder.feature_names_in_)
    except Exception as e:
        print(f"Error during decoding: {e}")
        return None

    # Add columns back
    decoded_df = pd.concat([encoded_df.drop(columns=list(encoder.get_feature_names_out()) + ["Prediction"]), decoded_categorical_df, encoded_df["Prediction"]], axis=1)
    if decoded_df is None: return None

    return decoded_df

def get_prediction(data):
    # This function's purpose is to centralize function calls and
    # make it clear to the server the expected return from this function. 

    df_input = pd.read_csv(data)
    studentIDs_column = df_input.pop('studentIDs')
    if "Prediction" in df_input.columns:
        df_input.pop("Prediction")
    df_output = one_hot_encode_df(df_input)
    df_output[numerical_columns] = scaler.transform(df_output[numerical_columns])
    global results_json
    results_json = df_output.to_json()
    df_output = predict(df_output)
    df_output = decode_df(df_output)
    df_output.insert(4, 'Student IDs', studentIDs_column)
    global table_data_results
    table_data_results = df_output.to_json()
    print("results: ")
    print(df_output.head())
    return df_output

def get_results_json():
    return results_json

def get_table_data_results():
    return table_data_results
