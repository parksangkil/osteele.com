<?php
$file = $_GET['source'];

if (preg_match('/\.js$/', $file))
	$language = 'javascript';
if (preg_match('/\.java$/', $file))
	$language = 'java';
if (preg_match('/\.py$/', $file))
	$language = 'python';

if ($language && $_GET['format']!='plain') {
	exec('enscript --color -E'.$language.' --language=html --output=- '.$file.' --title '.$file, $output);
	$content = join("\n", $output);
	$content = preg_replace('|</h1>|i', ' <span style="font-size: large">(<a href="?format=plain" style="font-size: large">plain text</a><span style="font-size: large">)</span>\0', $content, 1);
	echo $content;
 } else {
	header("Content-type: text/text; charset=utf-8");
	echo(file_get_contents($file));
 }
?>
 