#build GBC for whites first move
#import cPickle as pickle
#df=pickle.load(open( "../data/df_final_master2.pkl", "rb" ) )
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier


y = df['white_first_move'].values
y2 = df['black_first_move'].values
y_eco = df['eco'].values
X = (df[['blackelo',
 'result',
 'whiteelo',
 'age',
 'estimate_white_win_by_rating',
 'diff',
 'white_enc',
 'white_level_Expert',
 'white_level_GM',
 'white_level_IM',
 'white_level_Master',
 'white_level_Super GM',
 'black_level_Expert',
 'black_level_GM',
 'black_level_IM',
 'black_level_Master',
 'black_level_Super GM',
 'black_enc',
 'white_game_count',
 'black_game_count',
 'white_opening_count',
 'black_opening_count',
 'black_fm_count',
 'white_fm_count',
 'p_opening_given_white',
 'p_opening_given_black',
 'p_wfm_given_white',
 'p_bfm_given_black',
 'opening_count',
 'p_opening',
 'w_eco_result_sum',
 'b_eco_result_sum',
 'white_eco_sucess',
 'black_eco_sucess',
 'eco_result_sum',
 'eco_sucess',
 'w_fm_result_sum',
 'b_fm_result_sum',
 'white_fm_success',
 'black_fm_success',
 'wfm_result_sum',
 'wfm_count',
 'p_wfm',
 'bfm_count',
 'p_bfm',
 'wfm_success',
 'bfm_result_sum',
 'bfm_success']].values)

#trainsplit
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=42)

est3 = GradientBoostingClassifier(n_estimators=10, max_depth=3, learning_rate=0.1,max_features=6,subsample=0.9)
#learning rate went way down with , max_features=5, subsample=0.9
est3.fit(X_train, y_train)

# predict class labels
pred = est3.predict(X_test)

# score on test data (accuracy)
acc = est3.score(X_test, y_test)
print('ACC: %.4f' % acc)

# predict class probabilities
#est3.predict_proba(X_test)[0]

#build gbc for blacks first move
