/*** IMPORTS ***/
// Module imports
import React, { Component, Fragment } from "react"

// Local JS Utilities
import Database from "../resources/Database"
import { getUrlPiece } from "../resources/Util"

// Header
import Header from "../components/Header"
import NavMenu from "../components/NavMenu"
import Profile from "../components/Profile"

// Main
import Main from "../components/Main"
import HeaderTabs from "../components/HeaderTabs"
import ScenarioFeed from "../components/ScenarioFeed"
import Scenario from "../components/Scenario"
import ScenarioContent from "../components/ScenarioContent"
import Loader from "../components/Loader"
import Form from "../components/Form"
import FormInput from "../components/FormInput"

// Footer
import GoogleMaps from "../components/GoogleMaps"
import Footer from "../components/Footer"
/*** [end of imports] ***/

export default class Page extends Component {
	constructor(props) {
		super(props)

		this.state = {
			scenarioData: null,
			mapPickerIsOpen: false,
			lastClickedLat: null,
			lastClickedLon: null,
			pageStyle: "",
			title: "",
			navMenu: true,
			scenarioId: 1,
			userId: 1,
			lastUrlSegment: getUrlPiece(),
			wrapperClass: ""
		}
		this.inputs = []

		// Bindings
		this.openMapPicker = this.openMapPicker.bind(this)
		this.closeMapPicker = this.closeMapPicker.bind(this)
	}

	componentDidMount = () => {
		const { pageStyle, scenarioId, userId } = this.state

		if (pageStyle === "home-tab") {
			this.homeTabComponentMount()
		} else {
			if (scenarioId) {
				this.setScenarioData()
			} else if (userId) {
				this.userComponentMount()
			} else {
				this.setState({
					scenarioData: null
				})
			}
		}
	}
	homeTabComponentMount = () => {
		Database.scenarioFeed()
			.then(result => {
				// console.info("Database call complete:", result.body.data)
				this.setState({
					scenarioData: result.body.data.slice(0, 3) // Shouldn't need this. Page limit doesn't seem to be working
				})
			})
			.catch(error => {
				// console.error("Error getting scenarios:", error)
				this.setState({
					scenarioData: null
				})
			})
	}
	setScenarioData = () => {
		Database.getScenario({ id: this.state.scenarioId })
			.then(result => {
				// console.info("Database call complete:", result.body.data)
				this.setState({
					scenarioData: result.body.data
				})
			})
			.catch(error => {
				// console.error("Error getting scenarios:", error)
				this.setState({
					scenarioData: null
				})
			})
	}
	userComponentMount = () => {
		Database.getUserById({ id: this.state.userId })
			.then(result => {
				// console.info("Database call complete:", result.body.data)
				this.setState({
					scenarioData: result.body.data
				})
			})
			.catch(error => {
				// console.error("Error getting user:", error)
				this.setState({
					scenarioData: null
				})
			})
	}

	openMapPicker = () => {
		this.setState({ mapPickerIsOpen: true })
	}
	closeMapPicker = (lat, lon) => {
		this.setState({
			mapPickerIsOpen: false,
			lastClickedLat: lat,
			lastClickedLon: lon
		})
	}
	dismissScenario = params => {
		const { lastUrlSegment } = this.state
		let ad_type

		if (lastUrlSegment === "doer") ad_type = "1"
		else if (lastUrlSegment === "requester") ad_type = "2"
		else if (lastUrlSegment === "donator") ad_type = "3"
		else if (lastUrlSegment === "verifier") ad_type = "4"

		let json = {
			data: {
				type: "user_ad_interactions",
				attributes: {},
				relationships: {
					user: {
						data: {
							type: "users",
							id: "1"
						}
					},
					scenario: {
						data: {
							id: params.scenarioId,
							type: "scenarios"
						}
					},
					ad_type: {
						data: {
							id: ad_type,
							type: "ad_types"
						}
					},
					interaction_type: {
						data: {
							id: "2",
							type: "interaction_types"
						}
					}
				}
			}
		}

		Database.createUserAdInteraction(json)
			.then(result => {
				// console.log("User ad interaction successfully created:", result)
			})
			.catch(error => {
				// console.error("Error creating user ad interaction:", error)
			})
	}
	acceptScenario = params => {
		const { lastUrlSegment } = this.state
		let ad_type

		if (lastUrlSegment === "doer") ad_type = "1"
		else if (lastUrlSegment === "requester") ad_type = "2"
		else if (lastUrlSegment === "donator") ad_type = "3"
		else if (lastUrlSegment === "verifier") ad_type = "4"

		let json = {
			data: {
				type: "user_ad_interactions",
				attributes: {},
				relationships: {
					user: {
						data: {
							type: "users",
							id: "1"
						}
					},
					scenario: {
						data: {
							id: params.scenarioId,
							type: "scenarios"
						}
					},
					ad_type: {
						data: {
							id: ad_type,
							type: "ad_types"
						}
					},
					interaction_type: {
						data: {
							id: "1",
							type: "interaction_types"
						}
					}
				}
			}
		}

		Database.createUserAdInteraction(json)
			.then(result => {
				// console.log("User ad interaction successfully created:", result)
			})
			.catch(error => {
				// console.error("Error creating user ad interaction:", error)
			})
	}

	render() {
		const {
			pageStyle,
			title,
			navMenu,
			scenarioId,
			userId,
			lastClickedLat,
			lastClickedLon,
			mapPickerIsOpen
		} = this.state

		return (
			<div className={`page-full-wrapper ${this.state.wrapperClass}`}>
				<Header>
					{navMenu && (
						<NavMenu userId={userId}>
							<Profile userId={userId} />
						</NavMenu>
					)}
					<h1 className="title">{title}</h1>
				</Header>

				{pageStyle === "modal" && (
					<Fragment>
						<Main>
							<Form>
								{this.inputs.map((_input, _index) => (
									<FormInput
										history={this.props.history}
										inputObj={_input}
										openMapPicker={this.openMapPicker}
										lat={lastClickedLat}
										lon={lastClickedLon}
										userId={userId}
										key={_index}
									/>
								))}
							</Form>
						</Main>
						<GoogleMaps
							zoomLevel={14}
							closeMapPicker={this.closeMapPicker}
							mapPickerIsOpen={mapPickerIsOpen}
						/>
					</Fragment>
				)}

				{pageStyle === "home-tab" && (
					<Fragment>
						<Main>
							<HeaderTabs />
							<ScenarioFeed>
								{this.state.scenarioData ? (
									this.state.scenarioData.map(scenario => (
										<Scenario scenario={scenario} key={scenario.id} />
									))
								) : (
									<Loader />
								)}
							</ScenarioFeed>
						</Main>
						<Footer />
					</Fragment>
				)}

				{pageStyle === "flow" && (
					<Fragment>
						<Main>
							{this.state.scenarioData ? (
								<ScenarioContent {...this.state.scenarioData} />
							) : (
								<Loader />
							)}
							<Form>
								{this.inputs.map((_input, _index) => (
									<FormInput
										history={this.props.history}
										inputObj={_input}
										openMapPicker={this.openMapPicker}
										lat={lastClickedLat}
										lon={lastClickedLon}
										scenarioId={scenarioId}
										userId={userId}
										key={_index}
									/>
								))}
							</Form>
						</Main>
						<GoogleMaps
							zoomLevel={14}
							closeMapPicker={this.closeMapPicker}
							mapPickerIsOpen={mapPickerIsOpen}
						/>
					</Fragment>
				)}
			</div>
		)
	}
}