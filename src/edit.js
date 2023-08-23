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
		categories,
	} = attributes;

	// Get all Category IDs for use within the getEntityRecords
	const categoryIDs = categories ? categories.map((cat) => cat.id) : [];

	// The _embed parameter is CRUCIAL here. It will allow getEntityRecords to pass through content in an _embedded object for us to use. (EG - featuredImage)
	const args = {
		per_page: numberOfPosts,
		status: 'publish',
		_embed: true,
		order,
		orderby: orderBy,
		categories: categoryIDs,
	};

	// use getEntityRecords from the 'core' data store to retrieve post data specified via the args variable.
	const posts = useSelect(
		(select) => {
			const { getEntityRecords } = select('core');
			return getEntityRecords('postType', 'post', args);
		},
		[numberOfPosts, order, orderBy, categories]
	);

	// Fetch the list of available categories
	const allCategories = useSelect((select) => {
		const { getEntityRecords } = select('core');
		return getEntityRecords('taxonomy', 'category', {
			per_page: -1,
		});
	}, []);

	// TODO - explain this
	const categoriesObjectForCatSuggestions = {};
	if (allCategories) {
		for (let i = 0; i < allCategories.length; i++) {
			const category = allCategories[i];

			categoriesObjectForCatSuggestions[category.name] = category;
		}
	}

	// The Values parameter will take on the categoriesObjectForCatSuggestions variable, as well as any newly added Categories
	const onCategoryChange = (values) => {
		// Loop through each of the updated values, check if any of them are a string AND if they do not already exist - if so then there will be no suggestions and we do not want to add it.
		const hasNoSuggestions = values.some(
			(value) =>
				typeof value === 'string' &&
				!categoriesObjectForCatSuggestions[value]
		);

		if (hasNoSuggestions) return;

		// Else if the string DOES exist as a Category, then we need to convert it to the corresponding object within the array
		const updatedCategories = values.map((value) => {
			return typeof value === 'string'
				? categoriesObjectForCatSuggestions[value]
				: value;
		});

		setAttributes({ categories: updatedCategories });
	};

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

					{/* This updates the posts absolutely fine, but the Select Value does not update... weird. */}
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
						categorySuggestions={categoriesObjectForCatSuggestions}
						selectedCategories={categories}
						onCategoryChange={onCategoryChange}
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
