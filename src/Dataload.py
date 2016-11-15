# Converts the millionbase chess PGN database (http://www.top-5000.nl/pgn.htm) to json
# with one json dictionary per row. (That is, the resulting file is contain multiple json objects,
# not just one large).

import json
import chess.pgn # From python-chess https://github.com/niklasf/python-chess

#concatenate pgn files to one output file combined.pgn
filenames = [
'/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-A00-A39.pgn', '/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-C60-C99.pgn',
'/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-A40-A79.pgn', '/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-D00-D29.pgn',
'/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-A80-A99.pgn', '/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-D30-D69.pgn',
'/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-B00-B19.pgn', '/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-D70-D99.pgn',
'/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-B20-B49.pgn', '/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-E00-E19.pgn',
'/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-B50-B99.pgn', '/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-E20-E59.pgn',
'/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-C00-C19.pgn', '/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-E60-E99.pgn',
'/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/KingBase2016-03-C20-C59.pgn']
with open('/Users/eduardodaroza/Downloads/KingBase2016-03-pgn/combined.pgn', 'w') as outfile:
    for fname in filenames:
        with open(fname) as infile:
            for line in infile:
                outfile.write(line)

pgn = open("combined.pgn") # Or where you have put it
fout = open('combined.json', 'w') # Or where you want it

count = 0
node = chess.pgn.read_game(pgn)
while node != None:
  info =  node.headers
  info["fen"] = []
  while node.variations:
    next_node = node.variation(0)
    info["fen"].append(node.board().fen())
    node = next_node
  info["fen"].append(node.board().fen())
  node = chess.pgn.read_game(pgn)
  json.dump(info, fout, encoding='latin1')
  fout.write('\n')
  count += 1
  if(count % 10000 == 0):
    print(count)

fout.close()
