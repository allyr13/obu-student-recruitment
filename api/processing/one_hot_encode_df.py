import pandas as pd
import re

def one_hot_encode_df(df_input):
    df = df_input.copy()

    # Convert Y/N -> 1/0
    yn_columns = df.columns[df.isin(['Y', 'N']).any()]
    df[yn_columns] = df[yn_columns].map(lambda x: 1 if x.strip() == 'Y' else (0 if x.strip() == 'N' else x))

    # This changes general column names to fit the structure the model needs (must be before one hot encoding)
    df.columns = [camel_to_title_case(col) for col in df.columns]

    # One-hot encode categorical data
    categorical_columns = df.select_dtypes(include=['object']).columns.difference(yn_columns)
    df = pd.get_dummies(df, columns=categorical_columns, drop_first=False)

    # This changes specific column names to fit the structure the model needs
    df.rename(columns={'Counselor Incoming Text Count': 'incoming_text_count'}, inplace=True)
    df.rename(columns={'Counselor Outgoing Text Count': 'outgoing_text_count'}, inplace=True)
    df.rename(columns={'Phone Successful Count': 'phone_successful_count'}, inplace=True)
    df.rename(columns={'Phone Unsuccessful Count': 'phone_unsuccessful_count'}, inplace=True)
    df.rename(columns={'Phone Voicemail Count': 'phone_voicemail_count'}, inplace=True)

    print(df)    
    df.to_csv('oneHotEncoded_data.csv', index=False)

    df_output = df_input
    return df_output

def one_hot_encode_csv(csv_input):
    csv_output = csv_input
    return csv_output

def camel_to_title_case(camel_case_str):
    return re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', camel_case_str).title()
