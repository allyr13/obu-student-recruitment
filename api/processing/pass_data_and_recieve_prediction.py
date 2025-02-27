from processing.one_hot_encode_df import one_hot_encode_df

def pass_data_and_recieve_prediction(df):
    studentIDs_column = df.pop('studentIDs')
    prediction_df = one_hot_encode_df(df)
    prediction_df.insert(4, 'Student IDs', studentIDs_column)
    return prediction_df