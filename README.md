# Data Science Capstone
# CRISP DM - 0 Business Understanding
# Predicting Opening Moves for chess players to advise chess opening. 

# This repo contains the source used to build an XGBoost model to help players predict chess openings.  Files are collected from an online archives in pgn format, combined as the first step in data collection.  After load,clean and transform it builds an XGBOOST model that helps recommend a chess opening.  

# Technologies: Python/Sklearn data transformation and modeling, DynamoDB(in progress), flask for web Front End.
# Input: Player ratings, Player Names.

# Output: The model will provide a list of predicted openings of what the opponent (playing white) is likely to play and good responses to increase the users winning odds based on playing history or the openings with the best results.  XGBoost was chosen as model. The deployment is done in flask/bootstrap hosted in AWS and connected to a DynamoDB backend to store the dataset.

# Steps performed followed CRISM DM methodologies:

# CRISP DM-1 Data Prep:

# download chess games from online repository:http://kingbase-chess.net/download/441

# data collection:merge the data files using dataload.py data_collect to combine files into single pgn. 

# data EDA: load into pandas using final_capstone.ipynb to clean the data (4% duplicates) and prepare it for modeling.

# CRISP DM-2 Data Modeling:
# run build_fm.py to obtain pickled XGBoost model for 20 white opening moves.  build_sg.py to obtain XGboost model for supergroups (66 class targets). There should be two models generated.  One to predict whites first move and one to predict the EC supergroup which are 66 ECO codes (out of 500) that are grouped by similar structures.  If better coherence between first move and supergroup needs to be achieved then modify the supergroup build script to include the first move as a input feature. This is more a curriculum based approach where major classes are identified before subclasses.

# CRISP DM-3 Evaluation:

# note: newXGB2.py is and search_max_del.py for 5folds cv for parameter tuning of 3 parameters: max_tree_depth:5,min_child_weight:1,max_delta_step:3.   Run these on AWS preferable with more than 16 cores to improve performance.

# CRISP DM-4 Deployment:

# resulting model can be imported into chessapp.py to be used to make predictions.
