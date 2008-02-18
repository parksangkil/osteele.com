<?php get_header(); ?>

		<div id="main-wrapper">
			<div id="main-content">
				<?php if (have_posts()) : ?>
				<?php while (have_posts()) : the_post(); ?>
				<!-- google_ad_section_start -->
					<div class="post"><h2><?php the_title(); ?></h2>
			<p class="auth">Posted by <?php the_author(); ?> <span class="typo_date"><?php the_time('F d, Y') ?></span>  <?php edit_post_link('Edit this post', '', ''); ?></p>

			<?php the_content("Continue reading '" . the_title('', '', false) . "'"); ?>

<?php if ($_SERVER['HTTP_HOST'] != 'osteele.dev') { ?>
<script src="http://feeds.feedburner.com/~s/osteele?i=<?php the_permalink() ?>" type="text/javascript" charset="utf-8"></script>
<?php } ?>

<p class="meta"><strong>Bookmark this post:</strong> &#183; <a href="http://del.icio.us/post?url=<?php the_permalink() ?>&title=<?php echo htmlentities(the_title()); ?>">Del.icio.us</a> &#183; <a href="http://digg.com/submit?phase=2&url=<?php the_permalink() ?>&title=<?php echo htmlentities(the_title()); ?>">Digg</a> &#183; <a href="http://reddit.com/submit?url=<?php the_permalink() ?>&title=<?php echo htmlentities(the_title()); ?>">Reddit</a> &#183; <a href="http://www.spurl.net/spurl.php?url=<?php the_permalink() ?>&title=<?php echo htmlentities(the_title()); ?>">Spurl</a> &#183; <a href="http://www.furl.net/storeIt.jsp?url=<?php the_permalink() ?>&title=<?php echo htmlentities(the_title()); ?>">Furl</a> &#183; <a href="http://www.technorati.com/search/<?php the_permalink() ?>">Incoming links</a></p>
<!-- google_ad_section_end -->
</div>

<?php comments_template(); ?>
<?php endwhile; else: ?>
	
		<p>Sorry, no posts matched your criteria.</p>
	
<?php endif; ?>

		<p id="pagination">
			<?php next_posts_link('&laquo; Previous Entries') ?> <?php previous_posts_link('Next Entries &raquo;') ?>
		</p>
			</div>
 <?php get_sidebar(); ?>
 <?php get_footer(); ?>