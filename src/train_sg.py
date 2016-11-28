#! /usr/bin/python
import numpy as np
import cPickle as pickle
import xgboost as xgb
from sklearn.model_selection import GridSearchCV
from sklearn.model_selection import train_test_split

#favorite_color = { "lion": "yellow", "kitty": "red" }
newdf = pickle.load(open( "../data/newdf2.pkl", "rb" ) )
#newdf = pickle.load(open( "../data/df_final_master2.pkl", "rb" ) )

print "this model with age feature , eco groups"
X = newdf[['white_enc', 'black_enc', 'white_level_enc', 'black_level_enc', 'whiteelo' ,'blackelo' ,'result','age']].values
#X = newdf[['white_enc', 'black_enc', 'white_level', 'black_level', 'whiteelo' ,'blackelo' ,'result','age']].values
y = newdf['white_first_move_enc']
#y = newdf['white_first_move']
#y = newdf['eco']
#y = newdf['supergroups_enc']

#trainsplit
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=42)

xg_train = xgb.DMatrix( X_train, label=y_train)
xg_test = xgb.DMatrix(X_test, label=y_test)
# setup parameters for xgboost
param = {}
# use softmax multi-class classification
param['objective'] = 'multi:softmax'
# scale weight of positive examples
param['eta'] = 0.1
param['max_depth'] = 6
param['silent'] = 1
#param['nthread'] = 4
#param['num_class'] = 20
#param['num_class'] = 500 
param['num_class'] = 66 
#default to merror accuracy
param['eval_metric'] = 'mlogloss' 
#param['eval_metric'] = 'auc' 

watchlist = [ (xg_train,'train'), (xg_test, 'test') ]
num_round = 300 
#pining a model requires a parameter list and data set.
bst = xgb.train(param, xg_train, num_round, watchlist );


# get prediction

#pining a model requires a parameter list and data set.

#After training, the model can be saved.

#pickle.dump(bst, open("../data/newxgb_fm.pkl", "wb" ) )
pickle.dump(bst, open("../data/newxgb_eco.pkl", "wb" ) )
#bst.save_model('0001.model')
#The model and its feature map can also be dumped to a text file.

# dump model
#bst.dump_model('dump.raw.txt')
# dump model with feature map
#bst.dump_model('dump.raw.txt','featmap.txt')

#print bst.feature_importances_
#pred = bst.predict( xg_test );
#print ('predicting, classification error=%f' % (sum( int(pred[i]) != y_test[i] for i in range(len(y_test))) / float(len(y_test)) ))

# do the same thing again, but output probabilities
param['objective'] = 'multi:softprob'
bst = xgb.train(param, xg_train, num_round, watchlist );
# Note: this convention has been changed since xgboost-unity
# get prediction, this is in 1D array, need reshape to (ndata, nclass)
#yprob = bst.predict( xg_test ).reshape(y_test.shape[0], 6 )
#ylabel = np.argmax(yprob, axis=1)

#pickle.dump(bst, open("../data/newxgb_fm_proba.pkl", "wb" ) )
pickle.dump(bst, open("../data/newxgb_eco_proba.pkl", "wb" ) )
#bst.save_model('0001p.model')
#The model and its feature map can also be dumped to a text file.

# dump model
#bst.dump_model('dump_p.raw.txt')
# dump model with feature map
#bst.dump_model('dumpi_p.raw.txt','featmap_p.txt')
#print ('predicting, classification error=%f' % (sum( int(ylabel[i]) != y_test[i] for i in range(len(y_test))) / float(len(y_test)) ))

#print bst.feature_importances_
print "done"
