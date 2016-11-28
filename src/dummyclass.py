#build a dframe mainly on player and player characteristic
import cPickle as pickle
import xgboost as xgb
from sklearn.model_selection import GridSearchCV
from sklearn.dummy import DummyClassifier
import numpy as np
from sklearn.metrics import log_loss, f1_score,accuracy_score
from xgboost.sklearn import XGBClassifier
from sklearn.model_selection import train_test_split


#favorite_color = { "lion": "yellow", "kitty": "red" }
newdf = pickle.load(open( "../data/newdf.pkl", "rb" ) )

print "eco"
X = newdf[['white_enc', 'black_enc', 'white_level', 'black_level', 'whiteelo' ,'blackelo' ,'result']].values
#y = newdf['supergroups']
y = newdf['eco']
#y = newdf['supergroups']

#trainsplit
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=42)

#train a dummy classifier to make predictions based on the most_frequent class value
dummy_classifier = DummyClassifier(strategy="most_frequent")
dummy_classifier.fit( X_train,y_train )

#this produces 100 predictions that say "1"
#for i in two_dimensional_values:
#    print( dummy_classifier.predict( [i]) )

# predict class labels
pred = dummy_classifier.predict(X_test)

# score on test data (accuracy)
acc = dummy_classifier.score(X_test, y_test)
print('most freq ACC: %.4f' % acc)

clf_probs = dummy_classifier.predict_proba(X_test)
score = log_loss(y_test, clf_probs)
print accuracy_score(y_test, pred)
print score
#train a dummy classifier to make predictions based on the class values
new_dummy_classifier = DummyClassifier(strategy="stratified")
new_dummy_classifier.fit( X_train,y_train )

#this produces roughly 90 guesses that say "1" and roughly 10 guesses that say "0"
#for i in two_dimensional_values:


# predict class labels
pred = new_dummy_classifier.predict(X_test)

# score on test data (accuracy)
acc = new_dummy_classifier.score(X_test, y_test)
print('strat  ACC: %.4f' % acc)
#    print( new_dummy_classifier.predict( [i]) )

clf_probs = new_dummy_classifier.predict_proba(X_test)
score = log_loss(y_test, clf_probs)
print accuracy_score(y_test, pred)
print score
