import React, { useState } from 'react';
import Spaceship from './components/Spaceship';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { DOMAIN, SITE_ID } from './constants';

function App({
	configuration
}) {
	const {contentKey, siteId = SITE_ID } = configuration.portletInstance;

	const [spaceship, setSpaceship] = useState();

	const processContent = (data) => {
		const structuredContentByKey = data.structuredContentByKey;

		const spaceship = {
			name: structuredContentByKey.title,
			parts: []
		};

		structuredContentByKey.contentFields.forEach(field => {

			if (!field.nestedContentFields.length > 0) {
				spaceship[field.label.toLowerCase()] = field.contentFieldValue.data ||
				(field.contentFieldValue.image &&
					`${DOMAIN}${field.contentFieldValue.image.contentUrl}`
				)
			} else {
				const spaceshipPart = {
					name: field.contentFieldValue.data
				};

				field.nestedContentFields.forEach(nestedField => {
					spaceshipPart[nestedField.label.toLowerCase()] = nestedField.contentFieldValue.data;
				})

				spaceship.parts.push(spaceshipPart);
			}
		});

		setSpaceship(spaceship);
	};

	const {loading} = useQuery(
		gql`
			query getSpaceship($contentKey: String!, $siteId: String!) {
				structuredContentByKey(key: $contentKey, siteKey: $siteId) {
					title
					contentStructureId
					contentFields {
						label
						nestedContentFields {
							label
							contentFieldValue {
								data
							}
						}
						contentFieldValue {
							data
							image {
								contentUrl
								encodingFormat
							}
						}
					}
				}
			}
		`,
		{
			onCompleted: data => { processContent(data)},
			variables: {
				contentKey: contentKey,
				siteId: siteId
			},
		}
	);

	return (
		<React.Fragment>
			{spaceship && (
				<Spaceship
					spaceshipName={spaceship.name}
					spaceshipDescription={spaceship.description}
					spaceshipPicture={spaceship.image}
					spaceshipParts={spaceship.parts}
					pointsColor={configuration.system.pointsColor}
				/>
			)}

			{!spaceship && (!contentKey || !siteId) && (
				<div className="text-center">
					{Liferay.Language.get('please-configure-the-widget')}
				</div>
			)}

			{!loading && !spaceship && contentKey && siteId && (
				<div className="text-center">
                    <p>contentKey: {contentKey}</p>
                    <p>siteId: {siteId}</p>
					{Liferay.Language.get('the-selected-content-key-does-not-exist')}
				</div>
			)}
		</React.Fragment>
	);
}

export default App;