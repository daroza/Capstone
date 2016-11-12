from flask import Flask, request
import pandas as pd
import cPickle as pickle
import numpy as np

app = Flask(__name__)

with open('../data/firstmodel_rfc.pkl') as f:
    model = pickle.load(f)
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
                Are you playing white or black:<input type="text" name="user_input" default_value="black"/><br>
                Your Opponents Name:<input type="text" name="player2" /><br>
                Your Opponents Rating:<input type="text" name="player2_rating" /><br>
                Round:<input type="text" name="round" /><br>
                Other:<input type="text" name="other" /><br>
                <input type="submit" />
            </form>
        </body>
        </html>
        '''

@app.route('/predict', methods=['POST'] )
def predict():
    text = str(request.form['other'])
    #X = vectorizer.transform([text]) #unicode(text))
    #X = unicode(text, errors ='ignore')
    X = "2455.0 2203.0 1.0" + " 0.0"*1986
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
