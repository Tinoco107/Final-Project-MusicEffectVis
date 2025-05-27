import os
import glob
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# ---------------------------------
# Step 1: Load CSV Files in the Correct Directory
# ---------------------------------
# Update the path to reflect the correct folder name ("Behavioral_data")
data_folder = "Behavioral_data"  # Use the exact folder name
file_pattern = os.path.join(data_folder, "*.csv")
files = glob.glob(file_pattern)

# Check if any files were found
if not files:
    raise ValueError(f"No CSV files found in directory: {data_folder}")

dfs = []
for file in files:
    basename = os.path.basename(file)
    # Assuming the file names are encoded with commas, e.g., "Calming,01.csv"
    filename_wo_ext = basename.replace(".csv", "")
    # Split using a comma (',') as a delimiter. You can change this separator if needed.
    parts = [p.strip() for p in filename_wo_ext.split(',')]
    if len(parts) >= 2:
        session, subject = parts[0], parts[1]
    else:
        session = parts[0]
        subject = "Unknown"
    
    df = pd.read_csv(file)
    df['Session'] = session
    df['Subject'] = subject
    dfs.append(df)

# Concatenate all individual DataFrames into one master DataFrame
data = pd.concat(dfs, ignore_index=True)

# ---------------------------------
# Step 2: Preprocess the Data
# ---------------------------------
# Create a new column that marks the trial as correct if the participant's Response matches the Correct_Response.
# (We assume that a NaN response is counted as incorrect.)
data['Correct'] = np.where(pd.isna(data['Response']), False, data['Response'] == data['Correct_Response'])

# Clean the data by removing trials with non-positive Response_Time (if they represent missing or anticipatory responses).
data = data[data['Response_Time'] > 0]

# Convert TrialNumber to numeric (in case it is not already) to facilitate proper grouping.
data['TrialNumber'] = pd.to_numeric(data['TrialNumber'], errors='coerce')

# ---------------------------------
# Visualization 1: Response Time Distribution by Session
# ---------------------------------

plt.figure(figsize=(12, 6))
sns.histplot(data=data, x="Response_Time", hue="Session", bins=30, kde=True)
plt.title("Response Time Distribution by Session")
plt.xlabel("Response Time (ms)")
plt.ylabel("Count")
plt.show()

# ---------------------------------
# Visualization 3: Average Response Time Trend Over Trials
# ---------------------------------
# Group the data by Session and TrialNumber, then compute the average response time.
trial_trend = data.groupby(['Session', 'TrialNumber'])['Response_Time'].mean().reset_index()

plt.figure(figsize=(12, 6))
sns.lineplot(data=trial_trend, x="TrialNumber", y="Response_Time", hue="Session", marker="o")
plt.title("Average Response Time Over Trials by Session")
plt.xlabel("Trial Number")
plt.ylabel("Average Response Time (ms)")
plt.show()

# ---------------------------------
# Additional Visualization: Target vs. Non-Target Trials
# ---------------------------------
# In a one-back task, a 'target' trial occurs when the current Stimulus_Letter matches the previous trial's letter.
# Sort the data to ensure proper ordering of trials for each subject/session.
data.sort_values(by=["Subject", "Session", "TrialNumber"], inplace=True)
data['Is_Target'] = data.groupby(['Subject', 'Session'])['Stimulus_Letter'].shift(1) == data['Stimulus_Letter']

plt.figure(figsize=(12, 6))
sns.boxplot(data=data, x="Session", y="Response_Time", hue="Is_Target")
plt.title("Response Time Comparison: Target vs. Non-Target Trials")
plt.xlabel("Session")
plt.ylabel("Response Time (ms)")
plt.show()
