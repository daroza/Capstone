#build RFC for whites first move
import cPickle as pickle
df=pickle.load(open( "../data/df_final_master2.pkl", "rb" ) )
import pandas as pd
import numpy as np
from sklearn.cross_validation import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import log_loss, f1_score,accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB,MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import VotingClassifier

#y = df['white_first_move'].values
#y2 = df['black_first_move'].values
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
X_train, X_test, y_train, y_test = train_test_split(X, y_eco, test_size=0.30, random_state=42)

#est3 = LogisticRegression(random_state=123, multi_class='ovr')
est3 = RandomForestClassifier(random_state=123,n_estimators=40, n_jobs=-1)
#clf3 = GaussianNB()
#clf4 = MultinomialNB()
#clf5 = tree.DecisionTreeClassifier()

pickle.dump(est3, open( "rfc_big_realeco_names_40_2.pkl", "wb" ))
y_pred = est3.fit(X_train, y_train).predict(X_test)
#y_pred = clf1_nouser.fit(X_train_nouser, y_train_nouser).predict(X_test_nouser)
#y_pred = clf2.fit(X_train, y_train).predict(X_test)

# predict class labels
pred = est3.predict(X_test)

# score on test data (accuracy)
acc = est3.score(X_test, y_test)
y_pred = est3.fit(X_train, y_train).predict(X_test)
clf_probs = est3.predict_proba(X_test)
score = log_loss(y_test, clf_probs)
print(est3)
print('ACC: %.4f' % acc)
print('logloss: : %.4f' % score)
names = (['blackelo',
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
 'bfm_success'])
feature_imp = sorted(zip(map(lambda x: round(x,4), est3.feature_importances_),names),reverse=True)
print feature_imp
#clf2.feature_importances_
# predict class probabilities
#est3.predict_proba(X_test)[0]
#pickle.dump(est3, open( "rfc_big_realeco_names_40.pkl", "wb" ))
#build gbc for blacks first move
