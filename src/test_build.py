import cPickle as pickle
df=pickle.load(open( "../data/df_final_master2.pkl", "rb" ) )
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier


y = df['white_first_move'].values
y2 = df['black_first_move'].values
y_eco = df['eco'].values
X = (df[['age',
         'b_eco_result_sum',
         'b_fm_result_sum',
         'bfm_result_sum',
         'bfm_success',
         'black_eco_sucess',
         'black_enc',
         'black_fm_count',
         'black_fm_success',
         'black_game_count',
         'black_opening_count',
         'blackelo',
         'eco_result_sum',
         'eco_sucess',
         'opening_count',
         'p_bfm',
         'p_bfm_given_black',
         'p_opening',
         'p_opening_given_black',
         'p_opening_given_white',
         'p_wfm',
         'bfm_count',
         'p_wfm_given_white',
         'w_eco_result_sum',
         'w_fm_result_sum',
         'wfm_count',
         'wfm_result_sum',
         'wfm_success',
         'white_enc',
         'white_eco_sucess',
         'white_fm_count',
         'white_fm_success',
         'white_game_count',
         'white_opening_count',
         'whiteelo']].values)

#trainsplit
X_train, X_test, y_train, y_test = train_test_split(X, y_eco, test_size=0.30, random_state=42)

est3 = GradientBoostingClassifier(n_estimators=2, max_depth=3, learning_rate=0.1) #learning rate went way down with , max_features=5, subsample=0.9
est3.fit(X_train, y_train)

# predict class labels
#pred = est3.predict(X_test)
from sklearn.metrics import accuracy_score,f1_score
from sklearn.metrics import log_loss
# score on test data (accuracy)
acc = est3.score(X_test, y_test)
print('ACC: %.4f' % acc)


clf_probs = est3.predict_proba(X_test)
score = log_loss(y_test, clf_probs)
print "log loss:{}".format(score)

names= (['age',
         'b_eco_result_sum',
         'b_fm_result_sum',
         'bfm_result_sum',
         'bfm_success',
         'black_eco_sucess',
         'black_enc',
         'black_fm_count',
         'black_fm_success',
         'black_game_count',
         'black_opening_count',
         'blackelo',
         'eco_result_sum',
         'eco_sucess',
         'opening_count',
         'p_bfm',
         'p_bfm_given_black',
         'p_opening',
         'p_opening_given_black',
         'p_opening_given_white',
         'p_wfm',
         'bfm_count',
         'p_wfm_given_white',
         'w_eco_result_sum',
         'w_fm_result_sum',
         'wfm_count',
         'wfm_result_sum',
         'wfm_success',
         'white_enc',
         'white_eco_sucess',
         'white_fm_count',
         'white_fm_success',
         'white_game_count',
         'white_opening_count',
         'whiteelo'])

test= sorted(zip(map(lambda x: round(x,4), clf2.feature_importances_),names),reverse=True);test
#clf2.feature_importances_

pickle.dump(df, open( "../data/full_gb_eco.pkl", "wb" ) )

# predict class probabilities
#est3.predict_proba(X_test)[0]
