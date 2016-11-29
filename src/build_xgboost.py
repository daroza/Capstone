import numpy
import xgboost as xgb
from sklearn import model_selection
from sklearn.metrics import log_loss, f1_score,accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.grid_search import GridSearchCV
from sklearn.preprocessing import LabelEncoder

#build GBC for whites first move
import cPickle as pickle
df=pickle.load(open( "../data/df_final_master3.pkl", "rb" ) )

y = df['white_first_move'].values
y2 = df['black_first_move'].values
y_eco = df['supergroups'].values
X = (df[['blackelo',
# 'result',
 'whiteelo',
 'age',
# 'estimate_white_win_by_rating',
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
# 'white_game_count',
# 'black_game_count',
# 'white_opening_count',
# 'black_opening_count',
# 'black_fm_count',
 'white_fm_count',
# 'p_opening_given_white',
# 'p_opening_given_black',
 'p_wfm_given_white',
# 'p_bfm_given_black',
# 'opening_count',
# 'p_opening',
# 'w_eco_result_sum',
# 'b_eco_result_sum',
# 'white_eco_sucess',
# 'black_eco_sucess',
# 'eco_result_sum',
# 'eco_sucess',
# 'w_fm_result_sum',
# 'b_fm_result_sum',
# 'white_fm_success',
# 'black_fm_success',
# 'wfm_result_sum',
# 'wfm_count',
# 'p_wfm',
# 'bfm_count',
# 'p_bfm',
# 'wfm_success',
# 'bfm_result_sum',
# 'bfm_success']].values)
]].values)
#trainsplit

label_encoded_y = LabelEncoder().fit_transform(y)
X_train, X_test, y_train, y_test = train_test_split(X, label_encoded_y, test_size=0.30, random_state=42)
#X_train, X_test, y_train, y_test = train_test_split(X, y_eco, test_size=0.30, random_state=42)

eval_set = [(X_test, y_test)]
# fit model no training data
xgbm = xgb.XGBClassifier(n_estimators=10,nthread=-1,objective='multi:softprob',max_delta_step=1)
xgbm.fit(X_train, y_train,eval_metric='mlogloss',eval_set=eval_set,verbose=True)
print xgb 
# make predictions for test data
pickle.dump(xgbm, open( "xgboost_fm_names_final.pkl", "wb" ))
y_pred = xgbm.predict(X_test)
#predictions = [round(value) for value in y_pred]

# evaluate predictions
#accuracy = accuracy_score(y_test, predictions)
accuracy = accuracy_score(y_test, y_pred)
print("Accuracy: %.2f%%" % (accuracy * 100.0))
clf_probs = xgbm.predict_proba(X_test)
score = log_loss(y_test, clf_probs)
print("score:{}" % score)


#print xgbm.feature_importances_
pred = xgbm.predict( X_test );
print 'predicting, classification error=%f' % (sum( int(pred[i]) != y_test[i] for i in range(len(y_test))) / float(len(y_test)) )

feat_names= (['blackelo',
# 'result',
 'whiteelo',
 'age',
# 'estimate_white_win_by_rating',
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
 'black_enc'
 'white_fm_count',
# 'p_opening_given_white',
# 'p_opening_given_black',
 'p_wfm_given_white'])

def get_xgb_imp(xgb, feat_names):
    from numpy import array
    imp_vals = xgb.booster().get_fscore()
    imp_dict = {feat_names[i]:float(imp_vals.get('f'+str(i),0.)) for i in range(len(feat_names))}
    total = array(imp_dict.values()).sum()
    return {k:v/total for k,v in imp_dict.items()}

print get_xgb_imp(xgbm,feat_names)

#print xgbm.feature_importances_

#xg_train = xgb.DMatrix(X_train, label=y_train)
#xg_test = xgb.DMatrix(X_test, label=y_test)
# setup parameters for xgboost
#param = {}
# use softmax multi-class classification
#param['objective'] = 'multi:softprob'
# scale weight of positive examples
#param['eta'] = 0.1
#param['max_depth'] = 6
#param['silent'] = 1
#param['nthread'] = 4
#param['num_class'] = 200 

#watchlist = [ (xg_train,'train'), (xg_test, 'test') ]
#num_round = 5
#bst = xgb.train(param, xg_train, num_round, watchlist );
#pickle.dump(bst, open( "xgboost_big_eco_names_mult.pkl", "wb" ))

# get prediction
#pred = bst.predict( xg_test );

#print ('predicting, classification error=%f' % (sum( int(pred[i]) != test_Y[i] for i in range(len(test_Y))) / float(len(test_Y)) ))

# do the same thing again, but output probabilities
#param['objective'] = 'multi:softprob'
#bst = xgb.train(param, xg_train, num_round, watchlist );
# Note: this convention has been changed since xgboost-unity
# get prediction, this is in 1D array, need reshape to (ndata, nclass)
#yprob = bst.predict( xg_test ).reshape( test_Y.shape[0], 6 )
#ylabel = np.argmax(yprob, axis=1)

#print ('predicting, classification error=%f' % (sum( int(ylabel[i]) != test_Y[i] for i in range(len(test_Y))) / float(len(test_Y)) ))
