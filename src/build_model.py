from sklearn.ensemble import GradientBoostingClassifier

def load_pgn_2_dataframe(filename):
    #take pgn input file and convert it into dataframe
    #returns a dataframe object
    pass

def clean_data():
    #clean up data
    #look for duplicate games and remove
    df = df.drop_duplicates()
    #white_enc
    catenc = pd.factorize(df['white'])
    df['white_enc'] = catenc[0]
    #black_enc
    catenc_b = pd.factorize(df['black'])
    df['black_enc'] = catenc_b[0]
    # get count of all of games played by the same player as white and black
    df['white_game_count'] = df.groupby('white')['white'].transform('count')
    df['black_game_count'] = df.groupby('black')['black'].transform('count')

    #create some additional columsn to be used in probabilities...can refactor some dummy df later
    #count of how many times white/black played same ECO
    temp = df.groupby(['white','eco']).size().reset_index().rename(columns={0:'white_opening_count'})
    temp2 = df.groupby(['black','eco']).size().reset_index().rename(columns={0:'black_opening_count'})
    df = df.join(temp.set_index(['white','eco']), on=('white','eco'))
    df = df.join(temp2.set_index(['black','eco']), on=('black','eco'))

    #count of how many time white/black played the same first move
    temp_m = df.groupby(['white','white_first_move']).size().reset_index().rename(columns={0:'white_fm_count'})
    temp2_m = df.groupby(['black','black_first_move']).size().reset_index().rename(columns={0:'black_fm_count'})
    df = df.join(temp2_m.set_index(['black','black_first_move']), on=('black','black_first_move'))
    df = df.join(temp_m.set_index(['white','white_first_move']), on=('white','white_first_move'))

    #calculate p(opening|color)
    df['p_opening_given_white']=df['white_opening_count']/df['white_game_count']
    df['p_opening_given_black']=df['black_opening_count']/df['black_game_count']

    #calc p(fm|color)
    df['p_wfm_given_white']=df['white_fm_count']/df['white_game_count']
    df['p_bfm_given_black']=df['black_fm_count']/df['black_game_count']

    #overall probability of opening occuring for either color
    opening_count = df.groupby(['eco']).size().reset_index().rename(columns={0:'opening_count'})
    df = df.join(opening_count.set_index(['eco']), on=('eco'))
    df['p_opening'] = df.opening_count/df['black'].count()

    # sum up the results for white/opening by opening and join these back to the table
    white_eco_result_agg=df.groupby(['white','eco'])['result'].sum().reset_index().rename(columns={'result':'w_eco_result_sum'})
    black_eco_result_agg=df.groupby(['black','eco'])['result'].sum().reset_index().rename(columns={'result':'b_eco_result_sum'})
    df = df.join(white_eco_result_agg.set_index(['white','eco']), on=('white','eco'))
    df = df.join(black_eco_result_agg.set_index(['black','eco']), on=('black','eco'))
    #meant to measure success of opening at player levels
    df['white_eco_sucess']=df.w_eco_result_sum*df.p_opening_given_white
    df['black_eco_sucess']=df.b_eco_result_sum*df.p_opening_given_black

    #do the same thing for overall player groups
    eco_result_agg=df.groupby(['eco'])['result'].sum().reset_index().rename(columns={'result':'eco_result_sum'})
    df = df.join(eco_result_agg.set_index(['eco']), on=('eco'))
    #meant to measure success of opening at player levels
    df['eco_sucess']=df.eco_result_sum*df.p_opening

    #do the same process for first move as above.
    # sum up the results for white/black by fm and join these back to the table
    white_fm_result_agg=df.groupby(['white','white_first_move'])['result'].sum().reset_index().rename(columns={'result':'w_fm_result_sum'})
    black_fm_result_agg=df.groupby(['black','black_first_move'])['result'].sum().reset_index().rename(columns={'result':'b_fm_result_sum'})
    df = df.join(white_fm_result_agg.set_index(['white','white_first_move']), on=('white','white_first_move'))
    df = df.join(black_fm_result_agg.set_index(['black','black_first_move']), on=('black','black_first_move'))
    #meant to measure success of opening at player levels
    df['white_fm_success']=df.w_fm_result_sum*df.p_wfm_given_white
    df['black_fm_success']=df.b_fm_result_sum*df.p_bfm_given_black


    #overall probability of opening occuring for either color
    wfm_count = df.groupby(['white_first_move']).size().reset_index().rename(columns={0:'wfm_count'})
    df = df.join(wfm_count.set_index(['white_first_move']), on=('white_first_move'))
    df['p_wfm'] = df.wfm_count/df['white_first_move'].count()

    bfm_count = df.groupby(['black_first_move']).size().reset_index().rename(columns={0:'bfm_count'})
    df = df.join(bfm_count.set_index(['black_first_move']), on=('black_first_move'))
    df['p_bfm'] = df.bfm_count/df['black_first_move'].count()

    #do the same thing for overall player groups for white and black first moves
    wfm_result_agg=df.groupby(['white_first_move'])['result'].sum().reset_index().rename(columns={'result':'wfm_result_sum'})
    df = df.join(wfm_result_agg.set_index(['white_first_move']), on=('white_first_move'))
    #meant to measure success of fm at player levels
    df['wfm_success']=df.wfm_result_sum*df.p_wfm

    bfm_result_agg=df.groupby(['black_first_move'])['result'].sum().reset_index().rename(columns={'result':'bfm_result_sum'})
    df = df.join(bfm_result_agg.set_index(['black_first_move']), on=('black_first_move'))
    #meant to measure success of fm at player levels
    df['bfm_success']=df.bfm_result_sum*df.p_bfm




    #clean bad records
    #change columns
    #remove unneeded columns
    pass

def feature_engineer_data():
    #take dataframe and
    #prep data for modeling remove all Nans
    #calculate the number of games played by white with same opening per player:
    temp = df.groupby(['white','eco']).size().reset_index().rename(columns={0:'white_opening_count'})
    temp2 = df.groupby(['black','eco']).size().reset_index().rename(columns={0:'black_opening_count'})

def load_dataframe_2_db():
    pass

def dump_dataframe_2_json():
    pass

def split_data():
    #cross train split into train,test,validate
    pass

#in the case of naive bayes i could query the database for the white player name

def build_model(data):
    #takes dictionary of Xtrain,y_train to train
    #for my purposes I could
    est2 = GradientBoostingClassifier(n_estimators=100, max_depth=4, learning_rate=0.1) #learning rate went way down with , max_features=5, subsample=0.9
    est2.fit(X_train, y_train)

    # predict class labels
    pred = est2.predict(X_test)

    # score on test data (accuracy)
    acc = est2.score(X_test, y_test)
    print('ACC: %.4f' % acc)

    # predict class probabilities
    est2.predict_proba(X_test)[0]

#can use chess-db/public/explorer.jsp?fen=
# or lichess to show the games and allow players to explore
# example game: only game I played the entire time I has in the datascience class.
#https://en.lichess.org/3L2fVvst/black#62  quick game that illustrates at move 15
#black has connected rooks and this is now in the middlegame...however at move 3 the position was classified so no transpositions after That
#the earlier the number of moves to label the game may help improve the model.  chess opening transposition.

#            <script src="//cdn.sstatic.net/js/chess.js?v=1.0"></script>
# code to load the position into lichess and play ai is here
# https://en.lichess.org/?fen=r1bqkbnr/ppp1pppp/2n5/3p4/8/3PPN2/PPP2PPP/RNBQKB1R_w_KQkq_-#ai
