from flask import Flask,render_template, request
import pandas as pd
import cPickle as pickle
import numpy as np
from sklearn import preprocessing
le = preprocessing.LabelEncoder()
app = Flask(__name__)

with open('../data/xgboost_fm.pkl') as f:
    model_x_fm = pickle.load(f)
    print "loading xgboost model"

#if we want to have the opening be consisten with first move prediction we need to train a model on fm and then run fmmodel as an input to the opening.

with open('../data/xgboost_sg_names_final4.pkl') as f:
    model_x_eco = pickle.load(f)
    print "loading xgboost model"

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
                <li class="active"><a href="http://chesspro.tech/">Home</a></li>
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
	    <img width="620px" src="static/Chess-pieces-011.jpg">
            <p>Making you a better chess player through Data Science! This app uses 1.9 million games
            to predict White's first chess move and the most likely opening based on the model.
	<form action="/submit" >
                <input type="submit" align="middle"  class="btn btn-lg btn-primary" value="Click Here To Start Predicting">
            </form>
        </div>
        <div class="page-header">
        <h1>Slide Presentation </h1>
      </div>
      <div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">
          <li data-target="#carousel-example-generic" data-slide-to="0" class="active"></li>
          <li data-target="#carousel-example-generic" data-slide-to="1"></li>
          <li data-target="#carousel-example-generic" data-slide-to="2"></li>
          <li data-target="#carousel-example-generic" data-slide-to="3"></li>
          <li data-target="#carousel-example-generic" data-slide-to="4"></li>
          <li data-target="#carousel-example-generic" data-slide-to="5"></li>
          <li data-target="#carousel-example-generic" data-slide-to="6"></li>
          <li data-target="#carousel-example-generic" data-slide-to="7"></li>
        </ol>
        <div class="carousel-inner" role="listbox">
          <div class="item active">
            <img src="static/DarozaCapstoneFinal.001.jpeg" data-src="holder.js/1140x500/auto/#777:#555/text:First slide" alt="Intro slide">
          </div>
          <div class="item">
          <img src="static/DarozaCapstoneFinal.003.jpeg" align="middle" data-src="holder.js/1140x500/auto/#666:#444/text:Second slide" alt="Objective slide">
          </div>
          <div class="item">
            <img src="static/DarozaCapstoneFinal.004.jpeg" data-src="holder.js/1140x500/auto/#555:#333/text:Third slide" alt="Data Pipeline slide">
          </div>
          <div class="item">
            <img src="static/DarozaCapstoneFinal.005.jpeg" data-src="holder.js/1140x500/auto/#777:#555/text:Fourth slide" alt="Challenges slide">
          </div>
          <div class="item">
            <img src="static/slid7.jpeg" data-src="holder.js/1140x500/auto/#777:#555/text:Fifth slide" alt="Model strategy slide">
          </div>
          <div class="item">
            <img src="static/DarozaCapstoneFinal.006.jpeg" data-src="holder.js/1140x500/auto/#777:#555/text:Sixth slide" alt="Models/Results slide">
          </div>
          <div class="item">
            <img src="static/DarozaCapstoneFinal.008.jpeg" data-src="holder.js/1140x500/auto/#777:#555/text:Seventh slide" alt="Next Steps slide">
          </div>
          <div class="item">
            <img src="static/DarozaCapstoneFinal.009.jpeg" data-src="holder.js/1140x500/auto/#777:#555/text:Eighth slide" alt="Thanks slide">
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
         width:180px;
  	 height:170px;
  	 background-repeat:no-repeat;
  	 background-size:cover;
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
	 function setImage(select){
    	 var image = document.getElementsByName("image-swap")[0];
         image.src = select.options[select.selectedIndex].value;
         }   
	 function setImage2(select){
    	 var image = document.getElementsByName("image-swap2")[0];
         image.src = select.options[select.selectedIndex].value;
         }   
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
                    <li class="active"><a href="http://chesspro.tech/">Home</a></li>
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
	<table style="width:70%">
	<tr> 
	<th BGCOLOR="#FFFFFF" align="center"><b>White:</b><select name="player1" style="width: 180px" onchange="setImage(this);">
                <option value="static/carlsen3.jpeg">Carlsen, Magnus</option>
                <option value="static/nakamura.jpeg">Nakamura, Hikaru</option>
                <option value="static/kosteniuk2.png">Kosteniuk, Alexandra</option>
                <option value="static/karjakin.jpg">Karjakin, Sergey</option>
        </select></td></th>
	<th BGCOLOR="#000000" align="center"><font color="white">Black:</font><select name="player2" style="width: 180px" onchange="setImage2(this);">
		<option value="static/karjakin.jpg">Karjakin, Sergey</option>
                <option value="static/nakamura.jpeg">Nakamura, Hikaru</option>
                <option value="static/kosteniuk2.png" >Kosteniuk, Alexandra</option>
                <option value="static/carlsen3.jpeg">Carlsen, Magnus</option>
        </select></th>
        </tr>
	<tr>
	<td align="center"><img src="static/carlsen3.jpeg" name="image-swap" align="center""></td>
    	<td align="center"><img src="static/karjakin.jpg" name="image-swap2" align="center"></td>
	</tr>
	</table><br>
	<input type="submit"  class="btn btn-lg btn-primary" value="Make predictions"/>
	</form> 
	</body>
        </div>
        </html>
        '''
# parse the input and determine which model to use.  Does the username exist in the dataset.  If not then use generalmodel.
@app.route('/predict', methods=['POST'])
def predict():
	
    player1 = request.form['player1'] 
    if player1 == "static/karjakin.jpg":
        player1 = 607
    elif player1 == "static/nakamura.jpeg":
        player1 = 263
    elif player1 == "static/kosteniuk.jpeg":
        player1 = 2784
    else:
        player1 = 754
    
    player2 = request.form['player2']
    if player2 == "static/karjakin.jpg":
        player2 = 996
    elif player2 == "static/nakamura.jpeg":
        player2 = 323
    elif player2 == "static/kosteniuk.jpeg":
        player2 = 0
    else:
        player2 = 996 
    
    age = 1
    p_wfm_given_white = 0.9 
    p_opening_given_white = 0.9
    p_opening_given_black = 0.9
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
	if player==754:
	    return str(2882)
	elif player==263:
            return str(2779)
	elif player==2784:
            return str(2555)
	elif player==607:
            return str(2772)
	else:
	    return player1_rating

    def get_rating_b(player):
        if player==996:
	    return str(2772)
        elif player==323:
            return str(2779)
        elif player==739:
            return str(2882)
        elif player==0:
            return str(2555)
        else:
            return player2_rating

    whiteelo = int(get_rating_w(player1))
    blackelo = int(get_rating_b(player2))

    diff = (int(whiteelo) - int(blackelo))
    
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
    p_opening_given_white,
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
    #p_opening_given_white,
    #p_opening_given_black,
    p_wfm_given_white
    ])

    p =  model_x_fm.predict_proba([X_fm])
    probs= sorted(zip(p[0],model_x_fm.classes_),reverse=True)[:3]

    p2 =  model_x_eco.predict_proba([X_eco])
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
                    <li class="active"><a href="http://chesspro.tech/">Home</a></li>
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
        <h3>First Move: {0} </h1>
        <h3>Openings: <a href='http://chessopenings.com/eco/{9}'>{1}</a></h3>
	
        <form action="/submit">
	<input type="submit"  class="btn btn-lg btn-primary" value="Make more predictions" />
	</form>

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
                <th>Winning Chances (ELO)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{11}</td>
                <td>{12}</td>
                <td>{8}</td>
              </tr>
              <tr>
                <td>2</td>
                <td>{13}</td>
                <td>{14}</td>
                <td>{8}</td>
              </tr>
              <tr>
                <td>3</td>
                <td>{15}</td>
                <td>{16}</td>
                <td>{8}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="engine">
        <h2><a href="http://www.apronus.com/chess/puzzle/editor.php?playcomputer=1&fen=1r1bqkbnrXpppp1pppX2n5X1B2p3X4P3X5N2XPPPP1PPPXRNBQK2R_b_KQkq_-_3_3">Practice Against Computer</a></h2>
        </div>
        <div id="board" style="width: 400px"></div>
        </body>
        </html>
        '''.format(probs[0][1],probs_2[0][1],probs[0][1],str(round(probs[0][0]*100,2))+'%',probs[1][1],str(round(probs[1][0]*100,2))+'%',probs[2][1],str(round(probs[2][0]*100,2))+'%',prob_black,probs_2[0][1][:3], probs_2,probs_2[0][1],str(round(probs_2[0][0]*100,2))+'%',probs_2[1][1],str(round(probs_2[1][0]*100,2))+'%',probs_2[2][1],str(round(probs_2[2][0]*100,2))+'%')#,probs_2)#str(round(probs_2[0][0]*100,2))+'%')

@app.route('/contact')
def contact():
    return '''
         <!DOCTYPE html>
         <html lang="en">
         <head>
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
                    <li><a href="http://chesspro.tech/">Home</a></li>
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
	<h1>Predictions about Ed Daroza</h1>
	<h3>First Move:1.Nf3 </h1>
        <h3>Openings:<a href='http://chessopenings.com/eco/A10'>A10 English Opening</a><br>Github: github.com/daroza<br>Linked in: linkedin.com/in/daroza<br>Website: daroza.com</h3>
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
                <th>Winning Chances (ELO)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>1.Nf3</td>
                <td>95.98%</td>
                <td>50.00%</td>
              </tr>
              <tr>
                <td>2</td>
                <td>1.c4</td>
                <td>3.75%</td>
                <td>50.00%</td>
              </tr>
              <tr>
                <td>3</td>
                <td>1.g3</td>
                <td>0.26%</td>
                <td>50.00%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="engine">
        <h2><a href="http://www.apronus.com/chess/puzzle/editor.php?playcomputer=1&fen=1rnbqkbnrXppppppppX8X8X8X5N2XPPPPPPPPXRNBQKB1R_b_KQkq_-_1_1">Practice Against Computer</a></h2>
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
                    <li><a href="http://chesspro.tech/">Home</a></li>
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
            <p>My name is Eduardo Daroza.  I am a Data Scientist.  Formerly, I worked as
            a Senior Software Engineer at Intel.</p>

            <p>This is my capstone project for the 12-Week Data Science Immersive program I attended at
            Galvanize in Seattle beginning in September of 2016.</p>

            <p><b>Business understanding</b>: The goal of my project is to predict chess openings and first move of the player with the white pieces
	    .  There are many openings in chess (over 3600+ named variations and subvariations) and it is difficult to be an expert
	    in them all.  Opening prediction can especially help players 
            by narrowing down particular openings they should study when faced with a particular opponent.  

            <p>I learned chess from my father as a young boy but at that time was more interested in comic books, science 
            fiction and playing with my Commodore 64!  I re-discovered chess as a college student at University of Washington. 
            Fueled by the desire to avoid studying Kirchhoff's Voltage Law, Fourier transforms, and other Electrical Engineering 
            subjects I soon grew to love the game and obtained a rating of Expert.</p>

            <p><b>Dataset:</b> 
	    I gathered archives of pgn files from KingBase game archives online. Games were in Portable game notation which contained 
            the moves as well as meta data about the game such as players, ratings, color, date of game, event name, round.  After loading, cleaning
	    and transforming the data, I did my initial EDA in Pandas and found the distribution of openings to be heavily imbalanced.  As player names were the 
            feature with highest feature importance in the model I also had a challenge with high dimensionality of over 57,700 unique players for both colors. </p>

            <p><b>Models:</b>  
            For my modeling I used XGBoost which stands for Extreme Gradient Boosting. XGboost is an open-source, effective, efficient model developed 
	    by a Postdoc at my former alma matter.  XGBoost's ability to parallelize building each regrssion tree 
            helped during the training and tuning where I utilitized Amazon EC2 instances with 16 and 32 cores.</p> 

	    <p><b>Evaluation:</b>
            For my metric I was minimizing the logloss which penalizes for absurd misclassication with high certainty.   In this way it increases accuracy. 
	    I found in comparison to other models that Boosting did the best achieving a multilogloss of < 0.80.
            I used my model against the recent World Chess Championship match between Magnus Carlsen and Sergey Karjakin and it predicted 1.e4 as the 
            highest probability of occuring when in reality that move was played in 75% of classical games they played.
The model also predicted the Ruy Lopez opening as the top choice by Carlsen which occured in 66% games.
	    <p><b>Deployment:</b> 
	    The model was deployed using Flask and AWS.  I am working on getting the app to work with Amazon's 
	    DynamoDB to enable updates of the model based on new games.  In addition, I will plan to improve the model by
            doing additional feature engineering and tuning. Lastly, I would like to incorporate some recommended chess opening suggestions based on the 
	    success rates of the opening adjusted to reduce the effect of player rating on the outcome of the game by creating models based on players with 
	    approximitely equal levels to understand which openings perform better when ratings does not overpower opening performance. 

	    <p><b>Thanks to the instructors at Galvanize for their support and who are all tremendous data scientists, teachers and people.  And thanks also go 
	    to my cohort whom I also learned alot from and to everyone for enduring my endless anecdotes about chess.</p></b>
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
