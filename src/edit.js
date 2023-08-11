import './editor.scss';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	QueryControls,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// RawHTML allows the passing of HTML content within the data.
import { RawHTML } from '@wordpress/element';

// Importing relevant date formatting options
import {
	format,
	dateI18n,
	getSettings as getDateSettings,
} from '@wordpress/date';

export default function Edit({ attributes, setAttributes }) {
	const {
		numberOfPosts,
		displayFeaturedImage,
		numberOfColumns,
		order,
		orderBy,
	} = attributes;

	// The _embed parameter is CRUCIAL here. It will allow getEntityRecords to pass through content in an _embedded object for us to use. (EG - featuredImage)
	const args = {
		per_page: numberOfPosts,
		status: 'publish',
		_embed: true,
		order,
		orderby: orderBy,
	};

	// use getEntityRecords from the 'core' data store to retrieve post data specified via the args variable.
	const posts = useSelect(
		(select) => {
			const { getEntityRecords } = select('core');
			return getEntityRecords('postType', 'post', args);
		},
		[numberOfPosts, order, orderBy]
	);

	console.log(order);
	console.log(orderBy);

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody
					title={__('Settings', 'first-dynamic-gutenberg-block')}
				>
					<RangeControl
						label={__('Columns', 'first-dynamic-gutenberg-block')}
						value={numberOfColumns}
						onChange={(value) =>
							setAttributes({ numberOfColumns: value })
						}
						min={1}
						max={4}
					/>
					<ToggleControl
						label={__(
							'Display Featured Image',
							'first-dynamic-gutenberg-block'
						)}
						checked={displayFeaturedImage}
						onChange={() =>
							setAttributes({
								displayFeaturedImage: !displayFeaturedImage,
							})
						}
					/>

					{/* This updates the posts absolutely fine, but the wording does not update... weird. */}
					<QueryControls
						numberOfItems={numberOfPosts}
						onNumberOfItemsChange={(newNumber) =>
							setAttributes({ numberOfPosts: newNumber })
						}
						minItems={2}
						maxItems={12}
						orderby={orderBy}
						onOrderByChange={(newOrderBy) =>
							setAttributes({ orderBy: newOrderBy })
						}
						order={order}
						onOrderChange={(newOrder) =>
							setAttributes({ order: newOrder })
						}
					/>
				</PanelBody>
			</InspectorControls>

			{posts && (
				<ul
					className={`wp-block-custom-block-first-dynamic-gutenberg-block__list has-column-layout-${numberOfColumns}`}
				>
					{posts.map((post) => {
						// Get the featured image object
						const featuredImg =
							post._embedded &&
							post._embedded['wp:featuredmedia'] &&
							post._embedded['wp:featuredmedia'][0];

						return (
							<li
								key={post.id}
								className="wp-block-custom-block-first-dynamic-gutenberg-block__post"
							>
								<a href={post.link}>
									{displayFeaturedImage && featuredImg && (
										<div className="post-thumbnail">
											<p>asdas fasfa sfasfa</p>
											<img
												src={
													featuredImg.media_details
														.sizes.full.source_url
												}
												alt={featuredImg.alt_text}
											/>
										</div>
									)}
									<div className="post-content">
										{post.title && (
											<h3>
												<RawHTML>
													{post.title.rendered}
												</RawHTML>
											</h3>
										)}
										{post.date_gmt && (
											<p className="post-date">
												<time
													dateTime={format(
														'c',
														post.date_gmt
													)}
												>
													{/* getDateSettings gets the date and time formats, set in the admin, for us to use */}
													{dateI18n(
														getDateSettings()
															.formats.date,
														post.date_gmt
													)}
												</time>
											</p>
										)}
										{post.excerpt && (
											<div className="post-excerpt">
												<RawHTML>
													{post.excerpt.rendered}
												</RawHTML>
											</div>
										)}
									</div>
								</a>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
