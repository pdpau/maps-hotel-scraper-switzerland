# --- Executable script for data preparation ---

# 0. --- Import libraries ---
import sys
import pandas as pd

# 1. --- Import data and create a dataframe ---
city = sys.argv[1]
csv_path = f"../data/raw/{city}/hotels in {city.lower()} with emails.csv"
input_csv = pd.read_csv(csv_path, sep=",")


# 2. --- Clean the data ---
main_df = input_csv.copy()
main_df = main_df.reset_index(drop=True)
main_df.index += 1

# 2.1 Change data types
main_df = main_df.astype(str)
main_df["n_reviews"] = main_df["n_reviews"].astype(int)
main_df["price"] = main_df["price"].str.replace("€", "").str.replace("nan", "0").astype(int)

# 2.2 Drop hotels with no email
no_emails_out = main_df[~main_df["email"].apply(lambda x: x in ["NO_EMAIL", "nan"])]

# 2.3 Drop duplicate hotels
no_duplicates = no_emails_out.drop_duplicates()

# 2.4 Reorder columns
df_ordered = no_duplicates.iloc[:,[0,1,6,3,8,4,5,7,2]]


# 3. --- Save into csv and json files ---
df = df_ordered.copy()

filename = "hotels_" + city.lower()
# 3.1 Save into csv
output_path_csv = "../data/processed/" + city + "/" + filename + ".csv"
df.to_csv(output_path_csv, index=False)
# 3.2 Save into json
output_path_json = "../data/processed/" + city + "/" + filename + ".json"
df.to_json(output_path_json, orient="records")
