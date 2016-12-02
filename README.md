# Data Science Capstone
# CRISP DM - 0 Business Understanding
# Predicting Opening Moves for chess players to advise chess opening. 

# This program takes in games in large database in pgn format and uses to build a model that helps recommend a chess opening.  
# Technologies: Python/Sklearn data transformation and modeling, DynamoDB, flask for web Front End.
# Input: Player ratings, Player Names.

# Output: The model will provide a list of predicted openings of what the opponent (playing white) is likely to play and good responses to increase the users winning odds based on playing history or the openings with the best results.  XGBoost was chosen as model.

# Steps performed followed CRISM DM methodologies:

# CRISP DM-1 Data Prep:

# download chess games from online repository:http://kingbase-chess.net/download/441

# data collection:merge the data files using dataload.py data_collect to combine files into single pgn. 

# data EDA: load into pandas using final_capstone.ipynb to clean the data (4% duplicates) and prepare it for modeling.

# CRISP DM-2 Data Modeling:
# run build_fm.py to obtain pickled XGBoost model for 20 white opening moves.  build_sg.py to obtain XGboost model for supergroups (66 class targets). 

# CRISP DM-3 Evaluation:

# note: newXGB.py is for 5folds cv for parameter tuning.   Run these on AWS preferable with more than 16 cores to improve performance.

# CRISP DM-4 Deployment:

# resulting model can be imported into chessapp.py to be used to make predictions.
