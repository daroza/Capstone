# Capstone

# Recommendation system for chess players to advise chess opening. 

# This program takes in games in large database in pgn format and uses to build a model that helps recommend a chess opening.  
# the web front end built in flask.
# Input: is a Color to play(White/Black), White Rating and Black Rating (optional), Player Names, Desired Result.

# Output: If the user inputs they will play black the model will provide a list of predicted openings of what the opponent (playing white) is likely to play and good responses to increase the users winning odds based on playing history or the openings with the best results.  If a player inputs they will play White, the model will provide a list of predicted openings the opponent (playing black) is likely to play and good responses to increase the users winning odds based on playing history or the openings with the best results.
