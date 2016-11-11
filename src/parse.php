<?php

require("PgnParser.class.php");

$parser = new PgnParser("../games/twic1148.pgn");

$total = $parser->getNumberOfGames();
for ($i=0; $i<$total; $i++) {
    echo $parser->getGameDetailsAsJson($i)."\n";
}

?>
