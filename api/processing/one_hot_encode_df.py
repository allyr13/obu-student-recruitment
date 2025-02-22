import pandas as pd
from sklearn.preprocessing import OneHotEncoder
import re

## Processing for Encoding
df = pd.read_csv("prepared_data.csv")
df = df.drop(columns=['ID', 'Enrolled'])
categorical_columns = ['Country', 'State', 'Gender', 'Ethnicity', 'Origin Source',
       'Student Type', 'Major', 'Athlete',
       'Sport', 'Raley College Tag Exists', 'Recruiting Territory',
       'Counselor']

final_cols = categorical_columns[:]
final_cols.extend(['Financial Aid Offered Amount','incoming_text_count','outgoing_text_count','phone_successful_count','phone_unsuccessful_count','phone_voicemail_count','Admitted Students Day','Bison Day','Bison Day @ The Weekend','Campus Visit','Dallas Bison Exclusive','Football Visit','Golf Visit','Oklahoma City Bison Exclusive','Scholars Bison Day','Scholars Mixer and Banquet','Scholarship Interview','Scholarship Interview Registration','Softball Visit','Track Visit','Tulsa Bison Exclusive','Volleyball Visit','Events Attended Count'])


encoded_columns = []
df_encoded = pd.get_dummies(df, columns=categorical_columns, drop_first=True)
encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore", drop="first")
encoder.fit(df[categorical_columns])

def camel_to_title_case(camel_case_str):
    return re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', camel_case_str).title()

def one_hot_encode_df(df_input):
    input = df_input.copy()
    # input = pd.read_csv("default.csv")
    
    # Rename columns
    input.columns = [camel_to_title_case(col) for col in input.columns]
    
    # TODO: Counselor needs to be added to the form 
    input['Counselor'] = 'C2'

    input.rename(columns={'Counselor Incoming Text Count': 'incoming_text_count'}, inplace=True)
    input.rename(columns={'Counselor Outgoing Text Count': 'outgoing_text_count'}, inplace=True)
    input.rename(columns={'Phone Successful Count': 'phone_successful_count'}, inplace=True)
    input.rename(columns={'Phone Unsuccessful Count': 'phone_unsuccessful_count'}, inplace=True)
    input.rename(columns={'Phone Voicemail Count': 'phone_voicemail_count'}, inplace=True)
    input.rename(columns={'Bison Day At The Weekend': 'Bison Day @ The Weekend'}, inplace=True)
    
    missing_cols = [col for col in categorical_columns if col not in input.columns]
    if missing_cols:
        print(f"Warning: These columns are missing from the DataFrame: {missing_cols}")
    
    # Order cols to match categorical_columns order
    existing_categorical_columns = [col for col in final_cols if col in input.columns]
    input = input[existing_categorical_columns + [col for col in input.columns if col not in final_cols]]
    

    # Part 2: One-hot encode the categorical columns
    encoded_input = encoder.transform(input[categorical_columns])
    
    # Convert to DataFrame with the new columns
    encoded_columns = encoder.get_feature_names_out(categorical_columns)
    encoded_df = pd.DataFrame(encoded_input, columns=encoded_columns)
    
    # Fill missing values with 0 and convert to integers
    encoded_df = encoded_df.fillna(0).astype(int)
    
    # Concatenate the non-categorical columns with the encoded columns
    encoded_df_final = pd.concat([input.drop(columns=categorical_columns, axis=1), encoded_df], axis=1)
    encoded_df_final = encoded_df_final.fillna(0)
    encoded_df_final = encoded_df_final.replace({'N': 0, 'Y': 1})
    
    # Save the final encoded DataFrame
    encoded_df_final.to_csv('oneHotEncoded_data.csv', index=False)
    
    return encoded_df_final

