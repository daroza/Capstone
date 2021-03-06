#build a dframe mainly on player and player characteristic
import cPickle as pickle
import xgboost as xgb
from sklearn.model_selection import GridSearchCV

from xgboost.sklearn import XGBClassifier
from sklearn.model_selection import train_test_split


newdf = pickle.load(open( "../data/df_final_master3.pkl", "rb" ) )


X = newdf[['blackelo','whiteelo','age','diff','white_enc','white_level_Expert','white_level_GM','white_level_IM','white_level_Master','white_level_Super GM','black_level_Expert','black_level_GM','black_level_IM', 'black_level_Master','black_level_Super GM','black_enc','p_opening_given_white','p_opening_given_black','p_wfm_given_white']].values
#y = newdf['white_first_move_enc']
#y = newdf['eco']
y = newdf['supergroups']

#trainsplit
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=42)

#use kfold cv to get best params
cv_params = {'max_delta_step': [1,3,5]}
ind_params = {'learning_rate': 1, 'n_estimators': 100, 'seed':0, 'subsample': 0.8, 'colsample_bytree': 0.8,'max_depth':5,'min_child_weight':1, 'objective': 'multi:softprob'}
optimized_GBM = GridSearchCV(xgb.XGBClassifier(**ind_params), 
                            cv_params, 
                             scoring = 'neg_log_loss', cv = 5, n_jobs = -1) 

                             #scoring = 'accuracy', cv = 5, n_jobs = -1) 
optimized_GBM.fit(X_train, y_train)

print optimized_GBM
import cPickle as pickle
#favorite_color = { "lion": "yellow", "kitty": "red" }
pickle.dump(optimized_GBM, open( "finalXGB_test_mds.pkl", "wb" ) )

print optimized_GBM.grid_scores_
#print optimized_GMB.feature_importances_


