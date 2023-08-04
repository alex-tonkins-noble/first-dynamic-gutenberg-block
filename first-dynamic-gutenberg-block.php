<?php

/**
 * Plugin Name:       First Dynamic Gutenberg Block
 * Description:       That sweet first dynamic block.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Alex Tonkins
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       first-dynamic-gutenberg-block
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

function blocks_course_render_frontend($attributes) {
	$display_image = $attributes['displayFeaturedImage'];

	$query_args = [
		'posts_per_page' => $attributes['numberOfPosts'],
		'post_status' => 'publish'
	];

	$query = new WP_Query($query_args);
	$posts = $query->posts;

	// print_r(($posts));

    $output = '';

    if ($posts) {
		$output .= '<ul ' . get_block_wrapper_attributes() . '>';

		foreach ($posts as $key => $post) {
			$id = $post->ID;
			$title = $post->post_title;
			$excerpt = $post->post_excerpt;
			$permalink = get_permalink($id);
			$date = get_the_date('F j, Y', $id); // Get the post date
			$thumbnail = get_the_post_thumbnail($id, 'full'); // Get the post thumbnail (image)
		
			$output .= '<li>';
			$output .= '<a href="' . esc_url($permalink) . '">';
			
			if ($thumbnail && $display_image) {
				$output .= '<div class="post-thumbnail">' . $thumbnail . '</div>'; // Display the thumbnail
			}
			
			if ($title) {
				$output .= '<h5>' . $title . '</h5>';
			}
			
			if ($date) {
				$output .= '<p class="post-date">' . $date . '</p>'; // Display the post date
			}
			
			if ($excerpt) {
				$output .= '<div class="post-excerpt">' . $excerpt . '</div>'; // Display the post excerpt
			}
			
			$output .= '</a>';
			$output .= '</li>';
		}
		
		$output .= '</ul>';
		
    }

    return $output;
};

function create_first_dynamic_gutenberg_block_block_init() {
	register_block_type_from_metadata(__DIR__ . '/build', array(
		'render_callback' => 'blocks_course_render_frontend'
	));
}
add_action('init', 'create_first_dynamic_gutenberg_block_block_init');
