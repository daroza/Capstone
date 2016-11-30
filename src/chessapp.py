from flask import Flask,render_template, request
import pandas as pd
import cPickle as pickle
import numpy as np
from sklearn import preprocessing
le = preprocessing.LabelEncoder()
app = Flask(__name__)


#with open('../data/firstmodel_rfc.pkl') as f:
# with open('../data/model_log.pkl') as f:
#     model = pickle.load(f)
#     print "loading model"

#with open('../data/df_final_master3.pkl') as f:
#     df = pickle.load(f)
#     print "loading df"
#
# home page
#XGB FM xgboost_fm_names_final_1000.pkl
#with open('../data/xgboost_fm_names_final_1000.pkl') as f:
with open('../data/xgboost_fm.pkl') as f:
    model_x_fm = pickle.load(f)
    print "loading xgboost model"

#XGB FM xgboost_eco_names_final_tst.pkl
#with open('../data/xgboost_eco_names_final_tst.pkl') as f:
with open('../data/xgboost_sg_names_final.pkl') as f:
    model_x_eco = pickle.load(f)
    print "loading xgboost model"

#GBC
with open('../data/model_gbc.pkl') as f:
    model = pickle.load(f)
    print "loading model"

with open('../data/xgboost_big_eco_names.pkl') as f:
    model_eco = pickle.load(f)
    print "loading eco model"

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
         <title>ChessPrO: Predict and recommend Openings</title>
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
                <li class="active"><a href="http://chesspro.tech/capstone/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
                <li class="dropdown">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                  <ul class="dropdown-menu">
                    <li><a href="/tree.html">tree</a></li>
                    <li><a href="#">Another contact</a></li>
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
            <h1>ChessPrO: Predict and recommend Openings</h1>
            <p>Making you a better chess player through Data Science! This app uses 1.9 million games
            to predict White's first chess move and opening.
	<form action="/submit" >
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
            <img data-src="holder.js/1140x500/auto/#777:#555/text:First slide" alt="Intro slide">
          </div>
          <div class="item">
            <img data-src="holder.js/1140x500/auto/#666:#444/text:Second slide" alt="Capstone slide">
          </div>
          <div class="item">
            <img data-src="holder.js/1140x500/auto/#555:#333/text:Third slide" alt="Pipelinee slide">
          </div>
          <div class="item active">
            <img data-src="holder.js/1140x500/auto/#777:#555/text:First slide" alt="Methods slide">
          </div>
          <div class="item active">
            <img data-src="holder.js/1140x500/auto/#777:#555/text:First slide" alt="Result slide">
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
	 <style type="text/css">
         img {
         width:100px;
         margin:auto;
         }   
         </style> 
	 <script type="text/javascript"> 
	 $(document).ready(function(){
	 var pictureList = [
    	 "/static/kosteniuk.jpeg",
    	 "/static/carlsen.jpeg",
    	 "/static/nakamura.jpeg",
    	 "/static/karjakin.jpeg",];

	 $('#picDD').change(function(){
    	     var val = parseInt($('#picDD').val());
	     $('img').attr("src",pictureList[val]);});
         });
	 </script>
         <meta charset="utf-8">
         <title>ChessPrO: Predict and recommend Openings</title>
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
                    <li class="active"><a href="http://chesspro.tech/capstone/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu">
                        <li><a href="/tree.html">tree</a></li>
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
            <h1>ChessPrO: Predict and recommend Openings</h1>
            <p>Select players names from the drop down below!</p>
        <form action="/predict" method='POST'>
	<table style="width:100%">
	<tr> 
	<th BGCOLOR="#FFFFFF"><b>White:</b><select name="player1" style="width: 180px">
                <option value="754">Carlsen, Magnus</option>
                <option value="263">Nakamura, Hikaru</option>
                <option value="2784" selected>Kosteniuk, Alexandra</option>
                <option value="28533">Karjakin, Sergei</option>
        </select></td></th>
	<th BGCOLOR="#000000"><font color="white">Black:</font><select name="player2" style="width: 180px">
	<option value="40024">Karjakin, Sergei</option>
                <option value="323">Nakamura, Hikaru</option>
                <option value="739" selected>Carlsen, Magnus</option>
                <option value="0" >Kosteniuk, Alexandra</option>
        </select></th>
	

        </tr>
	<tr>
	<td align="center"><img src = "/static/kosteniuk.jpeg" name="image-swap"></td>
    	<td align="center"><img src = "/static/carlsen2.jpeg" align="center"></td>
	</tr>
	<tr>	
	<td>Player 1 Rating:<input type="text" name="player1_rating" /><br></td>
	<td>Player 2 Rating:<input type="text" name="player2_rating" /><br></td>
	</tr>	
	</table>
	<input type="submit"  class="btn btn-lg btn-primary" />
	Other(can enter input vectors):<input type="text" name="other" /><br>
	</form> 
	</body>
        </div>
        </html>
        '''
# parse the input and determine which model to use.  Does the username exist in the dataset.  If not then use generalmodel.
@app.route('/predict', methods=['POST'] )
def predict():
	
    player1 = int(request.form['player1'])
    #calculate the player1 rating here
    player1_rating = 2600 #default
    #player1_rating = str(request.form['player1_rating'])
    #user_color = str(request.form['user_color'])
    player2 = int(request.form['player2'])
    #calculate the player2 rating here to 
    player2_rating = 2600 # default
    #player2_rating = str(request.form['player2_rating'])
    #game_round = str(request.form['game_round'])
    text = str(request.form['other'])  # used as a vector
    age = 100
    p_wfm_given_white = 0.9
    p_opening_given_white = 0.9
    white_level_Expert = 0
    white_level_GM = 0
    white_level_IM = 0
    white_level_Master = 0
    white_level_Super = 1
    black_level_Expert = 0
    black_level_GM = 0
    black_level_IM = 0
    black_level_Master = 0
    black_level_Super = 0
    white_enc = player1
    black_enc = player2
    def get_rating_w(player):
	if player=='754':
	    return str(2882)
	elif player=='263':
            return str(2779)
	elif player=='2784':
            return str(2555)
	elif player=='28533':
            return str(2772)
	else:
	    return player1_rating

    def get_rating_b(player):
        if player=='40024':
	    return str(2772)
        elif player=='323':
            return str(2779)
        elif player=='739':
            return str(2882)
        elif player=='0':
            return str(2555)
        else:
            return player2_rating

    whiteelo = get_rating_w(player1)
    blackelo = get_rating_b(player2)

    diff = (int(whiteelo) - int(blackelo))
    #X = vectorizer.transform([text]) #unicode(text))
    #X = unicode(text, errors ='ignore')
    #X = "2455.0 2203.0 1.0" + " 0.0"*1986
    #X = "2.37000000e+03 -1.00000000e+00 2.16300000e+03 3.47400000e+03 2.67492710e-01"
    #
    #if text != "":
    X = "2.37000000e+03, 2.16300000e+03,   3.47400000e+03,          1.29850000e+04,   1.08010000e+04,   1.00000000e+00,          0.00000000e+00,   0.00000000e+00,   0.00000000e+00,          0.00000000e+00,   1.00000000e+00,   0.00000000e+00,          0.00000000e+00,   0.00000000e+00,   0.00000000e+00,          4.00000000e+00,   5.00000000e+00,   1.90000000e+01,          9.20000000e+01,   4.34782609e-02,   2.65957447e-02,          1.00000000e+00,   1.01063830e-01,   2.67492710e-01".strip()
    #X = text.strip()
    X = X.split(",")
    X = map(float,X)
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
    #p = model.predict_proba([2.37000000e+03,   2.16300000e+03,   3.47400000e+03,
    #     1.29850000e+04,   1.08010000e+04,   1.00000000e+00,
    #     0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
    #     0.00000000e+00,   1.00000000e+00,   0.00000000e+00,
    #     0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
    #     4.00000000e+00,   5.00000000e+00,   1.90000000e+01,
    #     9.20000000e+01,   4.34782609e-02,   2.65957447e-02,
    #     1.00000000e+00,   1.01063830e-01,   2.67492710e-01])
    # only show top 3 results

    #join the Xs
    X_fm = ([
    blackelo,
    whiteelo,
    age,
    diff,
    white_enc,
    white_level_Expert,
    white_level_GM,
    white_level_IM,
    white_level_Master,
    white_level_Super,
    black_level_Expert,
    black_level_GM,
    black_level_IM,
    black_level_Master,
    black_level_Super,
    black_enc,
    p_wfm_given_white
    ])
    
    X_eco = ([blackelo,
    whiteelo,
    age,
    diff,
    white_enc,
    white_level_Expert,
    white_level_GM,
    white_level_IM,
    white_level_Master,
    white_level_Super,
    black_level_Expert,
    black_level_GM,
    black_level_IM,
    black_level_Master,
    black_level_Super,
    black_enc,
    p_opening_given_white,
    p_wfm_given_white
    ])

    #X_fm = map(float,X_fm)
    #testp =  model_x_fm.predict_proba([2882,2772,100,100,754,0,0,0,0,1,0,0,0,0,1,40024,.9])
    #testp =  model_x_fm.predict_proba([X_fm])
    #testp2 =  model_x_eco.predict_proba([X_eco])
    #print testp2
    
    #p = model.predict_proba(X)
    p =  model_x_fm.predict_proba([X_fm])
    probs= sorted(zip(p[0],model.classes_),reverse=True)[:3]
    #classes

    #p2 = model_eco.predict_proba([2.37000000e+03,   2.16300000e+03,   3.47400000e+03,
    #     1.29850000e+04,   1.08010000e+04,   1.00000000e+00,
    #     0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
    #     0.00000000e+00,   1.00000000e+00,   0.00000000e+00,
    #     0.00000000e+00,   0.00000000e+00,   0.00000000e+00,
    #     4.00000000e+00,   5.00000000e+00,   1.90000000e+01,
    #     9.20000000e+01,   4.34782609e-02,   2.65957447e-02,
    #     1.00000000e+00,   1.01063830e-01,   2.67492710e-01])
    # only show top 3 results
    # 
    #p2 = model_eco.predict_proba(X)
    #probs_2= sorted(zip(p[0],model_eco.classes_),reverse=True)[:3]

    p2 =  model_x_eco.predict_proba([X_eco])
    #caclulate probabillities of wining for black
    probs_2= sorted(zip(p2[0],model_x_eco.classes_),reverse=True)[:3]
    # whites first move advantage is less at beginner level but since this dataset is mainly more experienced players 
#will simplify and adjust all white as 32. 
    import math
    def estimate_black_success(whiteelo,blackelo,adj=32):
        """input is two ratings ratingA (white), ratingB (black)
        and an optional adjustment factor (adj) which will be added
        to ratingA (white). Usually white has a small advantage which
        has been observed to be about +32 to +50"""
        white_adj = int(whiteelo)+adj
        diff = int(blackelo)-white_adj
        ex = diff/400.
    	return str(round((1/(1+math.pow(10,ex)) *100),2))+"%"
    prob_black = estimate_black_success(whiteelo,blackelo,32)

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
                    <li class="active"><a href="http://chesspro.tech/capstone/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu">
                        <li><a href="/tree.html">tree</a></li>
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
        <h1>Predictions:</h1>
        <h3>First Move:{0} </h1>
        <h3>Openings:<a href='http://chessopenings.com/eco/{1}'>{1}</a></h3>
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
                <td>{8}</td>
              </tr>
              <tr>
                <td>2</td>
                <td>{4}</td>
                <td>{5}</td>
                <td>{8}</td>
              </tr>
              <tr>
                <td>3</td>
                <td>{6}</td>
                <td>{7}</td>
                <td>{8}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="engine">
        <h2><a href="http://www.apronus.com/chess/puzzle/editor.php?playcomputer=1&fen=1rnbqkbnrXppppppppX8X8X4P3X8XPPPP1PPPXRNBQKBNR_b_KQkq_e3_0_1">Practice Against Engine Below</a></h2>
        </div>

        <div id="board" style="width: 400px"></div>


        </body>
        </html>
        '''.format(probs[0][1],probs_2[0][1][0:3],probs[0][1],str(round(probs[0][0]*100,2))+'%',probs[1][1],str(round(probs[1][0]*100,2))+'%',probs[2][1],str(round(probs[2][0]*100,2))+'%',prob_black)

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
                    <li><a href="http://chesspro.tech/capstone/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li class="active"><a href="/contact">Contact</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu">
                        <li><a href="/tree.html">tree</a></li>
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
        <div class="container theme-showcase" role="main">

        <div class="jumbotron">
        <h1>Predictions: Nf3 </h1>
        <h3>Openings: A10 English </h3>
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
                <td>Nf3</td>
                <td>73.21%</td>
                <td>50%</td>
              </tr>
              <tr>
                <td>2</td>
                <td>g3</td>
                <td>12.58%</td>
                <td>50%</td>
              </tr>
              <tr>
                <td>3</td>
                <td>c4</td>
                <td>3.34%</td>
                <td>50%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="engine">
        <h2><a href="http://www.apronus.com/chess/puzzle/editor.php?playcomputer=1&fen=1rnbqkbnrXppppppppX8X8X8X5N2XPPPPPPPPXRNBQKB1R_b_KQkq_-_1_1">Practice Against Engine Below</a></h2>
        </div>

        </body>
        </div>
        </html>
        '''
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
                    <li><a href="http://chesspro.tech/capstone/">Home</a></li>
                    <li class="active"><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu">
                        <li><a href="/tree.html">tree</a></li>
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

            <p>The goal of my project is to predict white chess openings and first moves for white player.  As white has 
            the first move advantage this tool can be used by players to prepare to play the black pieces by narrowing 
	    what particular openings they should study.   

            <p>I learned chess from my father as a young boy but at that time was more interested in comic books, science 
            fiction and playing with my Commodore 64!  I re-discovered chess as a college student at University of Washington 
            Fueled by the desire to avoid studying Kirchhoff's Voltage Law, Fourier transforms, and other Electrical Engineering            subjects I soon grew to love the game.  I began playing tournament chess and achieved an expert chess rating.</p>

            <p>Dataset: I gathered archives of pgn files from KingBase2016-03. PGN is in an ascii format easibly readible 
	    parsable and importable into pandas.</p>

            <p>Models:
            For my modeling I utilized XGBoost which is a form of Gradient Boosting Machine popular in Kaggle competitions. 
            XGboost is an open-source, effective, efficient model and was developed by graduate students at my former alma 
            matter.  XGBoost's abilitiy to parallelize building each decision tree helped during the training and tuning due to             my large dataset, high number of classes and high dimensionality of features. </p> 

            <p>Well I am not sure about whether data science will one day make me a Grand Master, but I
            can say my capstone has helped as a platform to exercise many of the concepts and tools that the
            Galvanize Instructors who are all tremendous scientists, teachers and people by the way
            taught me.</p>



        </body>
        </div>
        </html>
        '''

@app.route('/tree.html', methods=['GET'])
def tree():
    return render_template('tree.html') 

#app.route('static/<string:page_name>')
#def static(page_name):
#    return send_static_file(page_name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True, threaded=True)
#Add Comment
