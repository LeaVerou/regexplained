<?php
error_reporting(E_ALL);

include 'credentials.php';

$endpoint = 'https://api.twitter.com/1.1/search/tweets.json';

ksort($_GET);
$querystring = http_build_query($_GET, '', '&', PHP_QUERY_RFC3986);

$url = $endpoint . '?' . $querystring;
$time = time();
$oauth = array(
	'oauth_consumer_key' => $consumer_key,
	'oauth_nonce' => $time,
	'oauth_signature_method' => 'HMAC-SHA1',
	'oauth_timestamp' => $time,
	'oauth_token' => $access_token,
	'oauth_version' => "1.0"
);

$params = array_merge($_GET, $oauth);
ksort($params);
$parameter_string = http_build_query($params, '', '&', PHP_QUERY_RFC3986);
$signature_base = 'GET&' . urlencode($endpoint) . '&' . urlencode($parameter_string);
$signature_key = urlencode($consumer_secret) . '&' . urlencode($access_token_secret);
$signature = base64_encode(hash_hmac("sha1", $signature_base, $signature_key, true));

$oauth['oauth_signature'] = $signature;

$oauth_quoted = array_map(function($value) {
	return '"' . urlencode($value) . '"';
}, $oauth);

$oauth_header = 'OAuth ' . urldecode(http_build_query($oauth_quoted, '', ', ', PHP_QUERY_RFC3986));

$ch = curl_init($url);

curl_setopt_array($ch, array(
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_HTTPHEADER => array(
		'Authorization: ' . $oauth_header
	)
));

$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');

echo $response;

?>
