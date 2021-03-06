<?php $title='JavaScript Beziers'; ?>
<?php include('../../../includes/header.php'); ?>
<h1><?php echo $title; ?></h1>
<table>
<tr><td valign="top">Author:</td><td><a href="http://osteele.com">Oliver Steele</a>

</td></tr>
<tr><td valign="top">Copyright:</td><td>Copyright 2006 Oliver Steele. All rights reserved.

</td></tr>
<tr><td valign="top">License:</td><td>MIT License (Open Source)

</td></tr>
<tr><td valign="top">Homepage:</td><td><a
href="http://osteele.com/sources/javascript">http://osteele.com/sources/javascript</a>/

</td></tr>
<tr><td valign="top">Docs:</td><td><a
href="http://osteele.com/sources/javascript/docs/bezier">http://osteele.com/sources/javascript/docs/bezier</a>

</td></tr>
<tr><td valign="top">Download:</td><td><a
href="http://osteele.com/sources/javascript/bezier.js">http://osteele.com/sources/javascript/bezier.js</a>

</td></tr>
<tr><td valign="top">Example:</td><td><a
href="http://osteele.com/sources/javascript/bezier-demo.html">http://osteele.com/sources/javascript/bezier-demo.html</a>

</td></tr>
<tr><td valign="top">Created:</td><td>2006-02-20

</td></tr>
<tr><td valign="top">Modified:</td><td>2006-03-21

</td></tr>
</table>
<p>
<tt>bezier.js</tt> is a library for measuring and subdividing
arbitrary-order Bezier curves.
</p>
<p>
Points are represented as <tt>{x: x, y: y}</tt>.
</p>
<h2>Usage</h2>
<pre>
  var bezier = new Bezier[({x:0,y:0}, {x:50,y:50}, {x:100,y:25}]);
  bezier.draw(context);
  var order = bezier.order;
  var left = bezier.split()[0];
  var right = bezier.split()[1];
  var length = bezier.measureLength(bezier);
  var midpoint = bezier.atT(0.5);
</pre>
<h2>Notes</h2>
<p>
<tt>Bezier</tt> aliases its argument and caches its metrics. It won&#8217;t
work to modify a point within a <tt>Bezier</tt>; create a new
<tt>Bezier</tt> instead.
</p>
<h2>Related</h2>
<p>
Also see <a
href="http://osteele.com/sources/javascript/docs/path">path.js</a>.
</p>
<?php include('../../../includes/footer.php'); ?>
