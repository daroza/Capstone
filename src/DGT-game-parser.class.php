<?php

include_once("PgnParser.class.php");


class DGTGameParser
{

    private $pgnParser;
    private $remoteUrl;

    public function __construct()
    {
        $this->pgnParser = new PgnParser();
    }

    public function createPgnFromDGTData($remoteUrl, $toLocalPgnFile, $eventId = null)
    {
        $toLocalPgnFile = $this->tagsInFolderToValues($toLocalPgnFile);

        $ret = array('success' => true, 'message' => '', 'finished_round' => false);
        $this->remoteUrl = $this->getCorrectUrl($remoteUrl);

        $gameIds = $this->getGameIds();

        if (!count($gameIds)) {
            return array(
                'success' => false,
                'message' => 'Unable to load data from url ' . $this->remoteUrl
            );

        }
        $contents = '';
        foreach ($gameIds as $gameId) {
            $urlPropertyData = $this->remoteUrl . 'game' . $gameId . '.txt';
            if (!$dgtGameData = $this->readRemoteFile($urlPropertyData)) {
                $ret['success'] = false;
                $ret['message'] = 'Cannot find remote file ' . $urlPropertyData;
                $this->logToFile('Cannot find remote file ' . $urlPropertyData);
                return $ret;
            }
            $urlPositionData = $this->remoteUrl . 'pos' . $gameId . '.txt';
            if (!$dgtMoveData = $this->readRemoteFile($urlPositionData)) {
                $ret['success'] = false;
                $ret['message'] = 'Cannot find remote file ' . $urlPositionData;
                $this->logToFile('Cannot find remote file ' . $urlPositionData);

                return $ret;
            }


            $contents .= $this->toPgn($dgtGameData, $dgtMoveData);
        }

        #if($this->pgnParser->hasPgnChanged($contents, $toLocalPgnFile)){
        $localPath = $this->pgnParser->getPgnFolder() . '/' . $toLocalPgnFile;
        $fh = fopen($localPath, 'w');
        fwrite($fh, $contents);
        fclose($fh);

        if (!file_exists($localPath)) {
            $ret['success'] = false;
            $ret['message'] = 'Unable to write remote file to local folder(' . $localPath . '). Check permissions';
        }
        ##}

        $ret['finished_round'] = $this->pgnParser->areAllGameFinished($contents);

        return $ret;
    }

    private function getCorrectUrl($url)
    {
        $posQueryString = strpos($url, '?');
        if ($posQueryString > 0) {
            $url = substr($url, 0, $posQueryString);
        }
        return $url . "/";

    }

    private function tagsInFolderToValues($folder)
    {
        $folder = str_replace("/", "", $folder);
        $folder = str_replace("[D]", date("d"), $folder);
        $folder = str_replace("[M]", date("m"), $folder);
        $folder = str_replace("[Y]", date("Y"), $folder);
        return $folder;


    }

    private function getGameIds()
    {
        $ret = array();
        $i = 1;

        $content = $this->readRemoteFile($this->remoteUrl . 'tocks.txt');
        preg_match_all("/<(.*?)>/s", $content, $matches, PREG_SET_ORDER);


        for ($i = 0, $count = count($matches); $i < $count; $i += 2) {
            if ($matches[$i][1] != '.') {
                $ret[] = $matches[$i][1];
            } else {
                return $ret;
            }

        }

        return $ret;


    }

    private function http_request(
        $verb = 'GET', /* HTTP Request Method (GET and POST supported) */
        $ip, /* Target IP/Hostname */
        $port = 80, /* Target TCP port */
        $uri = '/', /* Target URI */
        $getdata = array(), /* HTTP GET Data ie. array('var1' => 'val1', 'var2' => 'val2') */
        $postdata = array(), /* HTTP POST Data ie. array('var1' => 'val1', 'var2' => 'val2') */
        $cookie = array(), /* HTTP Cookie Data ie. array('var1' => 'val1', 'var2' => 'val2') */
        $custom_headers = array(), /* Custom HTTP headers ie. array('Referer: http://localhost/ */
        $timeout = 2, /* Socket timeout in seconds */
        $req_hdr = false, /* Include HTTP request headers */
        $res_hdr = false /* Include HTTP response headers */
    )
    {

        $ret = '';
        $verb = strtoupper($verb);
        $cookie_str = '';
        $getdata_str = count($getdata) ? '?' : '';
        $postdata_str = '';

        foreach ($getdata as $k => $v)
            $getdata_str .= urlencode($k) . '=' . urlencode($v) . '&';

        foreach ($postdata as $k => $v)
            $postdata_str .= urlencode($k) . '=' . urlencode($v) . '&';

        foreach ($cookie as $k => $v)
            $cookie_str .= urlencode($k) . '=' . urlencode($v) . '; ';

        $crlf = "\r\n";
        $req = $verb . ' ' . $uri . $getdata_str . ' HTTP/1.1' . $crlf;
        $req .= 'Host: ' . $ip . $crlf;
        $req .= 'User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0.1' . $crlf;
        $req .= 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' . $crlf;
        $req .= 'Accept-Language: en-us,en;q=0.5' . $crlf;
        $req .= 'Accept-Encoding: deflate' . $crlf;
        $req .= 'Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7' . $crlf;

        foreach ($custom_headers as $k => $v)
            $req .= $k . ': ' . $v . $crlf;

        if (!empty($cookie_str))
            $req .= 'Cookie: ' . substr($cookie_str, 0, -2) . $crlf;

        if ($verb == 'POST' && !empty($postdata_str)) {
            $postdata_str = substr($postdata_str, 0, -1);
            $req .= 'Content-Type: application/x-www-form-urlencoded' . $crlf;
            $req .= 'Content-Length: ' . strlen($postdata_str) . $crlf . $crlf;
            $req .= $postdata_str;
        } else $req .= $crlf;

        if ($req_hdr)
            $ret .= $req;

        if (($fp = @fsockopen($ip, $port, $errno, $errstr)) == false)
            return "Error $errno: $errstr\n";

        stream_set_timeout($fp, 0, $timeout * 1000);

        fputs($fp, $req);
        while ($line = fgets($fp)) $ret .= $line;
        fclose($fp);

        if (!$res_hdr)
            $ret = substr($ret, strpos($ret, "\r\n\r\n") + 4);

        return $ret;
    }

    private $useFSocket = false;

    private function readRemoteFile($url)
    {

        $urlParts = parse_url($url);
        if (!isset($urlParts['port']) || !$urlParts['port']) {
            $urlParts['port'] = 80;
        }
        $contents = '';
        if($this->useFSocket){
            $contents = $this->http_request('GET', $urlParts['host'], $urlParts['port'], $urlParts['path']);
        }
        if ($contents && strpos($contents, 'Error') == 0) {
            $this->logToFile($contents);
            $contents = '';
        }

        if (!$contents) {
            if($this->useFSocket)$this->logToFile('Could not read from ' . $urlParts['host'] . '/' . $urlParts['path']);
            $i=0;
            $success = false;
            while(!$success && $i<5){
                $contents = $this->readRemoteCURL($url);
                if($contents){
                    $this->logToFile('Successfully used CURL to read from ' . $url);
                    $success = true;
                }else{
                    $this->logToFile('CURL unsuccessful: ' . $url);
                    usleep(50000); // Wait 0.5 seconds
                }
                $i++;
            }
        } else {
            $this->logToFile('Successfully read from ' . $urlParts['host'] . '/' . $urlParts['path']);
        }


        if (preg_match("/<html/si", $contents) || preg_match("/<h1>/si", $contents) || preg_match("/<body>/si", $contents) || preg_match("/ timed out/si", $contents)) {
            $this->logToFile($url);
            $this->logToFile('HOST: ' . $urlParts['host']);
            $this->logToFile('PATH: ' . $urlParts['path']);
            $this->logToFile($contents);
            return '';
        }




        return $contents;
    }

    private function readRemoteCURL($url)
    {
        $contents = '';
        if (function_exists('curl_init')) {
            $this->logToFile('CURL connection to  ' . $url);
            $ch = curl_init();
            // set the url to fetch
            curl_setopt($ch, CURLOPT_URL, $url);

            // don't give me the headers just the content
            curl_setopt($ch, CURLOPT_HEADER, 0);

            // return the value instead of printing the response to browser
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
            curl_setopt($ch, CURLOPT_LOW_SPEED_LIMIT, 1);
            // use a user agent to mimic a browser
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.7.5) Gecko/20041107 Firefox/1.0');

            $contents = curl_exec($ch);

            // remember to always close the session and free all resources
            curl_close($ch);
        }else{
            $this->logToFile('CURL is not installed. Could not use it to read remote file');
        }
        return $contents;
    }

    private function readRemoteFileFopen($url)
    {
        $contents = '';
        $handle = fopen($url, 'r');
        if ($handle) {
            while (!feof($handle)) {
                $contents .= fread($handle, 8192);
            }
        } else {
            return false;
        }
        fclose($handle);

        return $contents;

    }

    private $loggingEnabled = false;
    private function logToFile($txt)
    {
        if($this->loggingEnabled){
            $fh = fopen('dg-logger.txt', 'a');
            fwrite($fh, date("Y-m-d H:i:s") . ": " . $txt . "\n");
            fclose($fh);
        }
    }

    private function toPgn($gameData, $moveData)
    {
        return (
            $this->getGameProperties($gameData) .
                $this->getFenProperty($moveData) .
                "\n" .
                $this->getMoves($moveData)) .
            "\n\n";
    }

    private function getGameProperties($dgtData)
    {
        $ret = '';
        $mappingKeys = array(
            'u' => 'Event',
            'w' => 'White',
            'b' => 'Black',
            'm' => 'LastMoves'
        );
        $indexKeys = array(
            array('index' => 4, 'property' => 'Result'),
            array('index' => 5, 'property' => 'ClockWhite'),
            array('index' => 6, 'property' => 'ClockBlack'),
        );
        foreach ($mappingKeys as $key => $value) {
            $property = preg_replace("/.*?<" . $key . ">(.*?)<.*/si", "$1", $dgtData);
            if ($property) {
                $ret .= '[' . $value . '" ' . $property . '"]' . "\n";
            }
        }

        $items = explode("<", $dgtData);
        foreach ($indexKeys as $indexKey) {
            $ret .= '[' . $indexKey['property'] . ' "' . $this->removeTags($items[$indexKey['index']]) . '"]' . "\n";
        }


        return $ret;
    }

    private function getFenProperty($moveData)
    {
        $items = explode("<", $moveData);
        return '[FEN "' . $this->removeTags($items[2]) . '"]' . "\n";
    }


    private function removeTags($content)
    {
        return preg_replace("/[<>]/", "", $content);
    }

    private function getMoves($dgtData)
    {
        $ret = '';

        preg_match_all("/<([a-hO0RQKBN][^\.]{1,4}|[RNBQK][0-8a-h][^\.]{1,4})>/s", $dgtData, $matches);

        $moves = $matches[1];
        for ($i = 0, $countMoves = count($moves); $i < $countMoves; $i++) {
            if ($i % 2 == 0) {
                $ret .= ceil(($i + 1) / 2) . ". ";
            }
            $ret .= $moves[$i] . " ";
        }

        return trim($ret);
    }

    private function isAMove($move)
    {

    }
}

/*


#$parser = new DGTGameParser();
#$parser->getMoves('<g6qlr8o><rnbqkbnrpppppppp32PPPPPPPPRNBQKBNR><d4><35P15.><Nf6><6.14n><c4><34P15.><g6><14.7p><Nf3><45N16.><Bg7><5.8b><g3><46P7.><c6><10.7p><Bg2><54B6.><d5><11.15p><b3><41P7.><O-O><4.rk.><O-O><60.RK.><dxc4><27.6p><bxc4><34P6.><c5><18.7p><Bb2><49B8.><cxd4><26.8p><Nxd4><35N9.><Qb6><3.13q><Qb3><41Q17.><Ng4><21.16n><e3><44P7.><Nc6><1.16n><Rd1><59R1.><Na5><18.5n><Qxb6><17Q23.><axb6><8.8p><Ba3><40B8.><Nc6><18n5.><Bb2><40.8B><Nge5><28n9.><Nd2><51N5.><Bd7><2.8b><h3><47P7.><Ra4><.31r><Nb5><25N9.><Bf5><11.17b><Nc3><25.16N><Rb4><32.r><Ba3><40B8.><Rxc4><33.r><Nd5><27N14.><Rc2><34.15r><Bxe7><12B27.><Ra8><r4.><Ne4><36N14.><Nd7><11n16.><Bf6><12.8B><Nxf6><11.9n><Nexf6+><21N14.><Bxf6><14.6b><Nxf6+><21N5.><Kg7><6.7k><Ne4><21.14N><Raxa2><.47r><Rxa2><48R7.><Rxa2><48r1.><g4><38P7.><Be6><20b8.><Rb1><57R1.><Ra6><16r31.><Nd6><19N16.><Kf8><5k8.><Bf1><54.6B><Ra2><16.31r><Bc4><34B26.><Bxc4><20.13b><Nxc4><19.14N><Ra4><32r15.><.><73>');




$moves = '<gcwvgng><rnbqkbnrpppppppp32PPPPPPPPRNBQKBNR><e4><36P15.><e5><12.15p><Nf3><45N16.><Nc6><1.16n><Bb5><25B35.><a6><8.7p><Ba4><25.6B><Nf6><6.14n><O-O><60.RK.><Be7><5.6b><Re1><60R.><b5><9.15p><Bb3><32.8B><O-O><4.rk.><c3><42P7.><d6><11.7p><h3><47P7.><Nb8><1n16.><d4><35P15.><Nbd7><1.9n><c4><34P7.><c6><10.7p><Nc3><42N14.><b4><25.7p><Na4><32N9.><c5><18.7p><d5><27P7.><Re8><4r.><Bc2><41.8B><Nf8><5n5.><a3><40P7.><a5><16.7p><b3><41P7.><Ng6><5.16n><Nb2><32.16N><Bd7><2.8b><Nh2><45.9N><h6><15.7p><Nf1><55.5N><Nh7><15n5.><Ne3><44N16.><Bg5><12.17b><axb4><33P6.><axb4><24.8p><Rxa8><R55.><Qxa8><q2.><Nf5><29N14.><Bxc1><30.27b><Qxc1><58Q.><.><52>';
$dgtParser = new DGTGameParser();
echo($dgtParser->getMoves($moves));



$moves = '<1><rnbqkbnrpppppppp32PPPPPPPPRNBQKBNR><c4><34P15.><Nf6><6.14n><Nc3><42N14.><e6><12.7p><e4><36P15.><d5><11.15p><e5><28P7.><d4><27.7p><exf6><21P6.><dxc3><35.6p><bxc3><42P6.><Qxf6><3.17q><Nf3><45N16.><b6><9.7p><d4><35P15.><Bb7><2.6b><Bd3><43B17.><h6><15.7p><O-O><60.RK.><Nd7><1.9n><Nd2><45.5N><Bd6><5.13b><Qg4><38Q20.><Qg5><21.8q><Qh3><38.8Q><Bf4><19.17b><Be4><36B6.><Bxe4><9.26b><Nxe4><36N14.><Qg6><22q7.><Bxf4><37B20.><Qxe4><22.13q><Qg3><46Q.><Nf6><11.9n><Rfe1><60R.><Qf5><29q6.><Bxc7><10B26.><O-O><4.rk.><Re5><28R31.><Qc2><29.20q><Re3><28.15R><Ne4><21.14n><Qf3><45Q.><Rac8><.1r><Be5><10.17B><Ng5><30n5.><Qg3><45.Q><f6><13.7p><Bd6><19B8.><Rfd8><3r1.><Rae1><56.3R><Kh7><6.8k><c5><26P7.><bxc5><17.8p><Bxc5><19.6B><e5><20.7p><R3e2><44.7R><Qa4><32q17.><h4><39P15.><Ne6><20n9.><Be7><12B13.><Rd5><3.23r><dxe5><28P6.><f5><21.7p><Bb4><12.20B><Rc4><2.31r><Qf3><45Q.><Nf4><20.16n><Re3><44R7.><Qc6><18q13.><e6><20P7.><Qe8><4q13.><g3><46P7.><Qg6><4.17q><e7><12P7.><Nh3+><37.9n><Kh2><55K6.><Re4><34.1r><Rxe4><36R7.><fxe4><29.6p><Qxe4><36Q8.><Rf5><27.1r><Kxh3><47K7.><.><87>';
$gamestats = '<u>Swedish Chess Federation<3419><1><1-0><1h:06min><0h:59min><w>GM Anish Giri<b>GM Nils Grandelius<m>... Rf5 42. Kxh3<87><47K7.><Kxh3><.><586>';

*/