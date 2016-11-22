from flask import Flask, request
import pandas as pd
import cPickle as pickle
import numpy as np

app = Flask(__name__)

#with open('../data/firstmodel_rfc.pkl') as f:
# with open('../data/model_log.pkl') as f:
#     model = pickle.load(f)
#     print "loading model"

# with open('../data/model_rfc.pkl') as f:
#     model_rfc = pickle.load(f)
#     print "loading rfc model"
#
# home page

#GBC
with open('../data/model_gbc.pkl') as f:
    model = pickle.load(f)
    print "loading model"

@app.route('/')
def index():
    return '''
         <!DOCTYPE html>
         <html lang="en">
         <head>
         <meta charset="utf-8">
         <meta http-equiv="X-UA-Compatible" content="IE=edge">
         <meta name="viewport" content="width=device-width, initial-scale=1">
         <meta name="author" content="Galvanize DSI">
         <title>ChessPRO: Predict and Recommend Openings</title>
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
         <!-- Optional Blog -->
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
         <!-- Custom styles for this template -->
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
         </head>

         <body>

        <!-- Fixed navbar -->
        <nav class="navbar navbar-inverse navbar-fixed-top">
          <div class="container">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="http://chesseffect.com">Blog</a>
            </div>
            <div id="navbar" class="navbar-collapse collapse">
              <ul class="nav navbar-nav">
                <li class="active"><a href="http://0.0.0.0:8080/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
                <li class="dropdown">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                  <ul class="dropdown-menu">
                    <li><a href="#">Action</a></li>
                    <li><a href="#">Another action</a></li>
                    <li><a href="#">Something else here</a></li>
                    <li role="separator" class="divider"></li>
                    <li class="dropdown-header">Nav header</li>
                    <li><a href="#">Separated link</a></li>
                    <li><a href="#">One more separated link</a></li>
                  </ul>
                </li>
              </ul>
            </div><!--/.nav-collapse -->
          </div>
        </nav>

        <div class="container theme-showcase" role="main">
        <div class="jumbotron">
            <h1>ChessPRO: Predict and Recommend Openings</h1>
            <p>Making you a better chess player thru Data Science! This app uses 1.8 million games
            to predict your opponents first chess move and opening. Then it will recommends responses
            that have the best probabilities of success</p>
            <form action="/submit"   >
                <input type="submit"  class="btn btn-lg btn-primary" value="Click Here To Start Predicting">
            </form>
        </div>

        <div class="page-header">
        <h1>Slide Presentation</h1>
      </div>
      <div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">
          <li data-target="#carousel-example-generic" data-slide-to="0" class="active"></li>
          <li data-target="#carousel-example-generic" data-slide-to="1"></li>
          <li data-target="#carousel-example-generic" data-slide-to="2"></li>
          <li data-target="#carousel-example-generic" data-slide-to="3"></li>
          <li data-target="#carousel-example-generic" data-slide-to="4"></li>
          <li data-target="#carousel-example-generic" data-slide-to="5"></li>
        </ol>
        <div class="carousel-inner" role="listbox">
          <div class="item active">
            <img data-src="holder.js/1140x500/auto/#777:#555/text:First slide" alt="First slide">
          </div>
          <div class="item">
            <img data-src="holder.js/1140x500/auto/#666:#444/text:Second slide" alt="Second slide">
          </div>
          <div class="item">
            <img data-src="holder.js/1140x500/auto/#555:#333/text:Third slide" alt="Third slide">
          </div>
        </div>
        <a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
          <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
          <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
      </div>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
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
         <title>ChessPRO: Predict and Recommend Openings</title>
         <meta name="description" content="ChessPRO: Predict and Recommend Openings">
         <meta name="author" content="Galvanize DSI">
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
         <!-- Optional Blog -->
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
         <!-- Custom styles for this template -->
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

         </head>

         <body>
        <!-- Fixed navbar -->
            <nav class="navbar navbar-inverse navbar-fixed-top">
              <div class="container">
                <div class="navbar-header">
                  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                  </button>
                  <a class="navbar-brand" href="http://chesseffect.com">Blog</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                  <ul class="nav navbar-nav">
                    <li class="active"><a href="http://0.0.0.0:8080/">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu">
                        <li><a href="#">Action</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li role="separator" class="divider"></li>
                        <li class="dropdown-header">Nav header</li>
                        <li><a href="#">Separated link</a></li>
                        <li><a href="#">One more separated link</a></li>
                      </ul>
                    </li>
                  </ul>
                </div><!--/.nav-collapse -->
              </div>
            </nav>

        <div class="container theme-showcase" role="main">
        <div class="jumbotron">
            <h1>ChessPRO: Predict and Recommend Openings</h1>
            <p>Enter inputs to the model in the text box!</p>
            <form action="/predict" method='POST' >
                Your Name:<input type="text" name="player1" /><br>
                Your Rating:<input type="text" name="player1_rating" /><br>
                Are you playing white or black:<input type="text" name="user_color" default_value="black"/><br>
                Your Opponents Name:<input type="text" name="player2" /><br>
                Your Opponents Rating:<input type="text" name="player2_rating" /><br>
                Round:<input type="text" name="game_round" /><br>
                Other(can enter input vectors):<input type="text" name="other" /><br>
                <input type="submit"  class="btn btn-lg btn-primary" />
            </form>
        </body>
        </div>
        </html>
        '''
# parse the input and determine which model to use.  Does the username exist in the dataset.  If not then use generalmodel.
@app.route('/predict', methods=['POST'] )
def predict():
    # player1 = str(request.form['player1'])
    # player1_rating = str(request.form['player1_rating'])
    # user_color = str(request.form['user_color'])
    # player2 = str(request.form['player2'])
    # player2_rating = str(request.form['player2_rating'])
    # game_round = str(request.form['round'])
    text = str(request.form['other'])  # used as a vector
    #X = vectorizer.transform([text]) #unicode(text))
    #X = unicode(text, errors ='ignore')
    #X = "2455.0 2203.0 1.0" + " 0.0"*1986
    #X = "2.37000000e+03 -1.00000000e+00 2.16300000e+03 3.47400000e+03 2.67492710e-01"
    # X = text
    # X = X.split(" ")
    # X = map(float,X)
    # X = np.array([2.37000000e+03,   2.16300000e+03,   3.47400000e+03,
    #      1.29850000e+04,   1.08010000e+04,   1.00000000e+00,
    #      0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
    #      0.00000000e+00,   1.00000000e+00,   0.00000000e+00,
    #      0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
    #      4.00000000e+00,   5.00000000e+00,   1.90000000e+01,
    #      9.20000000e+01,   4.34782609e-02,   2.65957447e-02,
    #      1.00000000e+00,   1.01063830e-01,   2.67492710e-01])
    #print X

    # p = model.predict([2.37000000e+03,   2.16300000e+03,   3.47400000e+03,
    #      1.29850000e+04,   1.08010000e+04,   1.00000000e+00,
    #      0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
    #      0.00000000e+00,   1.00000000e+00,   0.00000000e+00,
    #      0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
    #      4.00000000e+00,   5.00000000e+00,   1.90000000e+01,
    #      9.20000000e+01,   4.34782609e-02,   2.65957447e-02,
    #      1.00000000e+00,   1.01063830e-01,   2.67492710e-01])
    p = model.predict_proba([2.37000000e+03,   2.16300000e+03,   3.47400000e+03,
         1.29850000e+04,   1.08010000e+04,   1.00000000e+00,
         0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
         0.00000000e+00,   1.00000000e+00,   0.00000000e+00,
         0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
         4.00000000e+00,   5.00000000e+00,   1.90000000e+01,
         9.20000000e+01,   4.34782609e-02,   2.65957447e-02,
         1.00000000e+00,   1.01063830e-01,   2.67492710e-01])
    # only show top 3 results
    probs= sorted(zip(p[0],model.classes_),reverse=True)[:3]
    #classes
    return '''
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="utf-8">

        <title>Your Prediction</title>
        <meta name="description" content="Predictive Model Web Interface">
        <meta name="author" content="Galvanize DSI">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
        <!-- Optional Blog -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
        <!-- Custom styles for this template -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
        <script src="https://cdn.sstatic.net/js/chess.js?v=1.0"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        </head>

        <body>

        <!-- Fixed navbar -->
            <nav class="navbar navbar-inverse navbar-fixed-top">
              <div class="container">
                <div class="navbar-header">
                  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                  </button>
                  <a class="navbar-brand" href="http://chesseffect.com">Blog</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                  <ul class="nav navbar-nav">
                    <li class="active"><a href="http://0.0.0.0:8080/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu">
                        <li><a href="#">Action</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li role="separator" class="divider"></li>
                        <li class="dropdown-header">Nav header</li>
                        <li><a href="#">Separated link</a></li>
                        <li><a href="#">One more separated link</a></li>
                      </ul>
                    </li>
                  </ul>
                </div><!--/.nav-collapse -->
              </div>
            </nav>

        <div class="container theme-showcase" role="main">

        <body>
        <div class="jumbotron">
        <h1>Predictions: {0} </h1>
        <h3>Openings: {1} </h3>
        </div>

        <div class="page-header">
        <h1>User Stats table</h1>
        </div>

        <div class="col-md-6">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Opening</th>
                <th>Probability of Playing</th>
                <th>Winning Chances</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{2}</td>
                <td>{3}</td>
                <td>50%</td>
              </tr>
              <tr>
                <td>2</td>
                <td>{4}</td>
                <td>{5}</td>
                <td>35%</td>
              </tr>
              <tr>
                <td>3</td>
                <td>{6}</td>
                <td>{7}</td>
                <td>50%</td>
              </tr>
            </tbody>
          </table>
        </div>


        <div class="engine">
        <h2>Practice Against Engine Below:</h2>
        </div>

        <div id="board" style="width: 400px"></div>


        </body>
        </html>
        '''.format(probs[0][1],probs[0][0],probs[0][1],probs[0][0],probs[1][1],probs[1][0],probs[2][1],probs[2][0])

@app.route('/about')
def about():
    return '''
         <!DOCTYPE html>
         <html lang="en">
         <head>
         <meta charset="utf-8">
         <title>ChessPRO: Predict and Recommend Openings</title>
         <meta name="description" content="ChessPRO: Predict and Recommend Openings">
         <meta name="author" content="Galvanize DSI">
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
         <!-- Optional Blog -->
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
         <!-- Custom styles for this template -->
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

         </head>

         <body>
        <!-- Fixed navbar -->
            <nav class="navbar navbar-inverse navbar-fixed-top">
              <div class="container">
                <div class="navbar-header">
                  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                  </button>
                  <a class="navbar-brand" href="http://chesseffect.com">Blog</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                  <ul class="nav navbar-nav">
                    <li><a href="http://0.0.0.0:8080/">Home</a></li>
                    <li class="active"><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu">
                        <li><a href="/tree">Tree of Analysis</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li role="separator" class="divider"></li>
                        <li class="dropdown-header">Nav header</li>
                        <li><a href="#">Separated link</a></li>
                        <li><a href="#">One more separated link</a></li>
                      </ul>
                    </li>
                  </ul>
                </div><!--/.nav-collapse -->
              </div>
            </nav>
        <div class="container theme-showcase" role="main">
        <div class="jumbotron">
            <h1>ChessPRO: Predict and Recommend Openings</h1>
            <p>Enter inputs to the model in the text box!</p>
            <form action="/predict" method='POST' >
                Your Name:<input type="text" name="player1" /><br>
                Your Rating:<input type="text" name="player1_rating" /><br>
                Are you playing white or black:<input type="text" name="user_color" default_value="black"/><br>
                Your Opponents Name:<input type="text" name="player2" /><br>
                Your Opponents Rating:<input type="text" name="player2_rating" /><br>
                Round:<input type="text" name="game_round" /><br>
                Other(can enter input vectors):<input type="text" name="other" /><br>
                <input type="submit"  class="btn btn-lg btn-primary" />
            </form>
        </body>
        </div>
        </html>
        '''
@app.route('/contact')
def contact():
    return '''
         <!DOCTYPE html>
         <html lang="en">
         <head>
         <meta charset="utf-8">
         <title>ChessPRO: Predict and Recommend Openings</title>
         <meta name="description" content="ChessPRO: Predict and Recommend Openings">
         <meta name="author" content="Galvanize DSI">
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
         <!-- Optional Blog -->
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
         <!-- Custom styles for this template -->
         <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

         </head>

         <body>
        <!-- Fixed navbar -->
            <nav class="navbar navbar-inverse navbar-fixed-top">
              <div class="container">
                <div class="navbar-header">
                  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                  </button>
                  <a class="navbar-brand" href="http://chesseffect.com">Blog</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                  <ul class="nav navbar-nav">
                    <li><a href="http://0.0.0.0:8080/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li class="active"><a href="/contact">Contact</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu">
                        <li><a href="#">Action</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li role="separator" class="divider"></li>
                        <li class="dropdown-header">Nav header</li>
                        <li><a href="#">Separated link</a></li>
                        <li><a href="#">One more separated link</a></li>
                      </ul>
                    </li>
                  </ul>
                </div><!--/.nav-collapse -->
              </div>
            </nav>

        <div class="container theme-showcase" role="main">
        <div class="jumbotron">

            <h2>About this project:</h2>
            <p>My name is Eduardo Daroza.  I am a Data Scientist.  Formerly, I worked for 20 years as
            a Senior Software Engineer at Intel.</p>

            <p>This is my capstone project for the 12-Week Data Science Immersive program I attended at
            Galvanize in Seattle beginning in September of 2016.</p>

            <p>The primary goal of my project was to answer the ultimate question:
            <i>Can data science make me a better chess player?!</i>  (this while students in my cohort
            found impressive projects like classifying allergens based on chemical properties.)</p>

            <p>I had previously learned chess from my father as a young boy but at that time
            I was more interested in comic books, reading science fiction and playing with my
            awesome Commodore 64!  I re-discovered chess while at University of Washington studying Electrical
            Engineering where I played with other people on something called the World Wide Web which at the time
            had recently become a thing but soon faded out as a fad similar to bi-partisanship.
            Fueled by the intense desire to avoid my studies of Kirchhoff's Voltage Law and Fournier transforms,
            I soon grew to love the game.  I began playing tournament chess and was able to achieve an expert
            chess rating within a year winning several local tournaments.</p>

            Details about the project:

            Dataset: KingBase2016-03 pgn data files. ascii format easibly readible parsable and importable into pandas.

            Models:
            GradientBoostingClassifier
            NaiveBayes



            <p>Why this case under certain conditions NaiveBayes is a better predictor.
            Creating an ensemble method.
            Chess minimax theorem and my idea of building a probabilistic chess engine based on human results
            instead of heuristic evaluation functions to perform the calculations.
            How someone should approach chess?</p>

            <p>Well I am not sure about whether data science will one day make me a Grand Master, but I
            can say my capstone has helped as a platform to exercise many of the concepts and tools that the
            Galvanize Instructors who are all tremendous scientists, teachers and people by the way
            taught me.</p>

            <p>Technologies used in this project (put images here):
            Python Flask AWS Github DynamoDB Sklearn TensorFlow</p>

            <p>Pitfalls of chess and data science:
            The chess master Edgar Mednis once said:
            "Chess will be won by the person who makes the next to last mistake"</p>

        </body>
        </div>
        </html>
        '''

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True, threaded=True)
#Add Comment
