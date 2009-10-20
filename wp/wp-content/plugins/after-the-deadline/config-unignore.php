<?php
/* 
 *  Called by the TinyMCE plugin when Ignore Always is clicked (setup as an action through admin-ajax.php)
 */
function AtD_ignore_call() {

	$user = wp_get_current_user();

	if ( ! $user || $user->ID == 0 )
		return;

	$ignores = explode( ',', get_usermeta( $user->ID, 'AtD_ignored_phrases') );
	array_push( $ignores, $_GET['phrase'] );

	update_usermeta( $user->ID, 'AtD_ignored_phrases', implode( ',', $ignores ) );

	header( 'Content-Type: text/xml' );
	echo '<success></success>';
	die();
}

/* 
 *  Called when a POST occurs, used to save AtD ignored phrases
 */
function AtD_process_unignore_update() {

        $user = wp_get_current_user();

        if ( ! $user || $user->ID == 0 )
                return;

        update_usermeta( $user->ID, 'AtD_ignored_phrases', $_POST['AtD_ignored_phrases'] );
}

/*
 *  Display the AtD unignore form on a page
 */
function AtD_display_unignore_form() {

	$user = wp_get_current_user();

	if ( ! $user || $user->ID == 0 )
		return;

	$ignores = get_usermeta( $user->ID, 'AtD_ignored_phrases');
?>
<script>
function atd_show_phrases( ignored )
{
	var element = jq_handle( '#atd_ignores' ).get( 0 );
	var items   = new Array();

	ignored.sort();

	for ( var i = 0; i < ignored.length; i++ ) {
		if ( ignored[i].length > 0 )
			items.push( '<span id="atd_' + i + '"><a class="ntdelbutton" href="javascript:atd_unignore(\'' + ignored[i].replace("'", "\\'") + '\')">X</a>&nbsp;' + ignored[i] + '</span>' );
	}

	element.innerHTML = items.length >= 1 ? items.join("<br>") : ''; 
}

function atd_unignore( phrase, eid ) {
	/* get the ignored values and remove the unwanted phrase */
	var ignored = jq_handle( '#AtD_ignored_phrases' ).val().split( /,/g );
        ignored = jQuery.map(ignored, function(value, index) { return value == phrase ? null : value; });
        jq_handle( '#AtD_ignored_phrases' ).val( ignored.join(',') );

	/* update the UI */
	atd_show_phrases( ignored );

	/* show a nifty message to the user */
        jq_handle( '#AtD_message' ).show();
}

function atd_ignore () {
	/* get the ignored values and update the hidden field */
	var ignored = jq_handle( '#AtD_ignored_phrases' ).val().split( /,/g );

        jQuery.map(jq_handle( '#AtD_add_ignore' ).val().split(/,\s*/g), function(value, index) { ignored.push(value); });

        jq_handle( '#AtD_ignored_phrases' ).val( ignored.join(',') );

	/* update the UI */
	atd_show_phrases( ignored );
	jq_handle( '#AtD_add_ignore' ).val('');             

	/* show that nifteroo messaroo to the useroo */
        jq_handle( '#AtD_message' ).show(); 
}

var jq_handle = undefined;

jQuery(function(jq) {
	jq_handle = jq;

	jq_handle( document ).ready(
		function() {
			jq_handle( '#AtD_message' ).hide();
			atd_show_phrases( jq_handle( '#AtD_ignored_phrases' ).val().split( /,/g ) );
		}
	);
});
</script>

   <input type="hidden" name="AtD_ignored_phrases" id="AtD_ignored_phrases" value="<?php echo $ignores; ?>">

          <p style="font-weight: bold">Ignored Phrases</font>
     
          <p>Identify words and phrases to ignore while proofreading your posts and pages:</p>

          <p><input type="text" id="AtD_add_ignore" name="AtD_add_ignore"> <input type="button" value="Add" onclick="javascript:atd_ignore()"></p>

          <div class="tagchecklist" id="atd_ignores"></div>

          <div class="plugin-update-tr" id="AtD_message" style="display: none">
          <div class="update-message"><strong>Be sure to click "Update Profile" at the bottom of the screen to save your changes.</strong></div>
          </div>

         </td>
      </tr>
   </table>

<?php
}
