from flask import Flask, request
import pandas as pd
import cPickle as pickle
import numpy as np

app = Flask(__name__)

#with open('../data/firstmodel_rfc.pkl') as f:
with open('../data/model_log.pkl') as f:
    model = pickle.load(f)
    print "loading model"

with open('../data/model_log.pkl') as f:
    model_name = pickle.load(f)
    print "loading model"

# home page
@app.route('/')
def index():
    return '''
         <!DOCTYPE html>
         <html lang="en">
         <head>
         <meta charset="utf-8">

         <title>Chess Opening Predictive Model Web Interface</title>
         <meta name="description" content="Predictive Model Web Interface">
         <meta name="author" content="Galvanize DSI">

         </head>

         <body>

            <h1>Chess Opening Predictive Model Web Interface</h1>
            <p>This app will make prediction your opponents chess opening for you!  Then it will make a recommendation based on the history and provide a list of chess openings that have the best chances of being successful</p>
            <form action="/submit" >
                <input type="submit" value="Click Here To Start Predicting">
            </form>
        </body>
        </html>
    '''
@app.route('/submit')
def submit():
    return '''
         <!DOCTYPE html>
         <html lang="en">
         <head>
         <meta charset="utf-8">

         <title>Chess Opening Predictive Model Web Interface</title>
         <meta name="description" content="Chess Opening Predictive Model Web Interface">
         <meta name="author" content="Galvanize DSI">

         </head>

         <body>

            <h1>Chess Opening Predictive Model Web Interface</h1>
            <p>Enter inputs to the model in the text box!</p>
            <form action="/predict" method='POST' >
                Your Name:<input type="text" name="player1" /><br>
                Your Rating:<input type="text" name="player1_rating" /><br>
                Are you playing white or black:<input type="text" name="user_color" default_value="black"/><br>
                Your Opponents Name:<input type="text" name="player2" /><br>
                Your Opponents Rating:<input type="text" name="player2_rating" /><br>
                Round:<input type="text" name="game_round" /><br>
                Other(can enter input vectors):<input type="text" name="other" /><br>
                <input type="submit" />
            </form>
        </body>
        </html>
        '''
# parse the input and determine which model to use.  Does the username exist in the dataset.  If not then use generalmodel.
@app.route('/predict', methods=['POST'] )
def predict():
    player1 = str(request.form['player1'])
    player1_rating = str(request.form['player1_rating'])
    user_color = str(request.form['user_color'])
    player2 = str(request.form['player2'])
    player2_rating = str(request.form['player2_rating'])
    game_round = str(request.form['round'])
    text = str(request.form['other'])  # used as a vector
    #X = vectorizer.transform([text]) #unicode(text))
    #X = unicode(text, errors ='ignore')
    #X = "2455.0 2203.0 1.0" + " 0.0"*1986
    #X = "2.37000000e+03 -1.00000000e+00 2.16300000e+03 3.47400000e+03 2.67492710e-01"
    X = text
    X = X.split(" ")
    X = map(float,X)
    X = np.array(X)
    print X
    p = model.predict(X)
    return '''
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="utf-8">

        <title>Your Prediction</title>
        <meta name="description" content="Chess Opening Predictive Model Web Interface">
        <meta name="author" content="Galvanize DSI">

        </head>

        <body>Prediction: {0}</body>
        </html>
        '''.format(p[0])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
#Add Comment
