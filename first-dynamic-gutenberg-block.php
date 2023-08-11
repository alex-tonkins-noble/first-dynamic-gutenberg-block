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

    $output = '<div ' . get_block_wrapper_attributes() . '>';

    if ($posts) {
		$output .= '<ul class="wp-block-custom-block-first-dynamic-gutenberg-block__list has-column-layout-2">';

		foreach ($posts as $key => $post) {
			$id = $post->ID;
			$title = $post->post_title;
			$excerpt = get_the_excerpt($post);
			$permalink = get_permalink($id);
			$date = get_the_date(get_option('date_format'), $id); // Get the post date
			$thumbnail = get_the_post_thumbnail($id, 'full'); // Get the post thumbnail (image)
		
			$output .= '<li class="wp-block-custom-block-first-dynamic-gutenberg-block__post">';
			$output .= '<a href="' . esc_url($permalink) . '">';
			
				if ($thumbnail && $display_image) {
					$output .= '<div class="post-thumbnail">' . $thumbnail . '</div>'; // Display the thumbnail
				}
				
				$output .= '<div class="post-content">';
					if ($title) {
						$output .= '<h3>' . $title . '</h3>';
					}
					
					if ($date) {
						$output .= '<p class="post-date"><time datetime="'. esc_attr(get_the_date('c', $post)) .'">'. esc_attr(get_the_date('', $post)) .'</time></p>'; // Display the post date
					}
					
					if ($excerpt) {
						$output .= '<div class="post-excerpt">' . $excerpt . '</div>'; // Display the post excerpt
					}
				
				$output .= '</div>';
			$output .= '</a>';
			$output .= '</li>';
		}
		
		$output .= '</ul>';
		
    }
	$output .= '</div>';

    return $output;
};

function create_first_dynamic_gutenberg_block_block_init() {
	register_block_type_from_metadata(__DIR__ . '/build', array(
		'render_callback' => 'blocks_course_render_frontend'
	));
}
add_action('init', 'create_first_dynamic_gutenberg_block_block_init');
