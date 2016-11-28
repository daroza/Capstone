#build a dframe mainly on player and player characteristic
import cPickle as pickle
import xgboost as xgb
from sklearn.model_selection import GridSearchCV

from xgboost.sklearn import XGBClassifier
from sklearn.model_selection import train_test_split


#favorite_color = { "lion": "yellow", "kitty": "red" }
newdf = pickle.load(open( "../data/newdf2.pkl", "rb" ) )


X = newdf[['white_enc', 'black_enc', 'white_level_enc', 'black_level_enc', 'whiteelo' ,'blackelo' ,'result','age']].values
#y = newdf['white_first_move_enc']
#y = newdf['eco']
y = newdf['supergroups']

#trainsplit
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=42)

#use kfold cv to get best params
cv_params = {'max_depth': [3,5,7], 'min_child_weight': [1,3,5]}
ind_params = {'learning_rate': 0.1, 'n_estimators': 100, 'seed':0, 'subsample': 0.8, 'colsample_bytree': 0.8, 
             'objective': 'multi:softprob'}
optimized_GBM = GridSearchCV(xgb.XGBClassifier(**ind_params), 
                            cv_params, 
                             scoring = 'roc_auc', cv = 5, n_jobs = -1) 

                             #scoring = 'accuracy', cv = 5, n_jobs = -1) 
optimized_GBM.fit(X_train, y_train)


import cPickle as pickle
#favorite_color = { "lion": "yellow", "kitty": "red" }
pickle.dump(optimized_GBM, open( "finalXGB.pkl", "wb" ) )

print optimized_GBM.grid_scores_
print optimized_GMB.feature_importances_


