<?php

if(CHESS_USE_DATABASE && CHESS_DB_HOST && CHESS_DB_USERNAME && CHESS_DB_PASSWORD && CHESS_DB_NAME){
    $conn = mysql_connect(CHESS_DB_HOST,CHESS_DB_USERNAME,CHESS_DB_PASSWORD);
    mysql_select_db(CHESS_DB_NAME,$conn);
}


?>