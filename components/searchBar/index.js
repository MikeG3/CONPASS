/* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import {
  View, Keyboard, TouchableOpacity, Text, TouchableHighlight,
  Image
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import i18n from 'i18n-js';
import styles from './styles';
import SetLocaleContext from '../../localization-context';
import burger from './burger.png';

export default class searchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPredictions: true,
      destination: '',
      predictions: [],
      region: {
        latitude: 45.492409,
        longitude: -73.582153,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      isMounted: false
    };
  }

  componentDidMount() {
    SetLocaleContext();
    this.setState({ isMounted: true });
    if (this.props.hideMenu === undefined || this.props.setCampusToggleVisibility === undefined) {
      this.setState({ hideMenu: true });
    } else {
      this.setState({ hideMenu: false });
    }
    if (this.props.urCurentLocation !== undefined) {
      this.setState({ destination: this.props.urCurentLocation });
    }
  }

  /**
  * Retrieves predictions through google's from text entered in searchbar.
  * @param {string} destination - Text input from search bar
  */
  async onChangeDestination(destination) {
    this.setState({ destination });
    const key = 'AIzaSyCqNODizSqMIWbKbO8Iq3VWdBcK846n_3w';
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${key}&input=${destination}&location=45.492409, -73.582153&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions
      });
    } catch (err) {
      console.error(err);
    }
  }

  /**
  * Gets the latitude and longitude of a chosen prediction.
  * @param {string} prediction - placeid of the prediction to get latitude and longitude.
  */
  async getLatLong(prediction) {
    const key = 'AIzaSyCqNODizSqMIWbKbO8Iq3VWdBcK846n_3w';
    const geoUrl = `https://maps.googleapis.com/maps/api/place/details/json?key=${key}&placeid=${prediction}`;

    try {
      const georesult = await fetch(geoUrl);
      const gjson = await georesult.json();
      const locations = gjson.result.geometry.location;
      this.setState({
        region: {
          latitude: locations ? locations.lat : 45.492409,
          longitude: locations ? locations.lng : -73.582153,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }
      });
      this.props.updateRegion(this.state.region);
    } catch (err) {
      console.error(err);
    }
  }


  render() {
    const placeholder = this.state.isMounted ? i18n.t('search') : 'search';
    // Predictions mapped and formmated from the current state predictions
    const predictions = this.state.predictions.map((prediction) => {
      return (
        <View key={prediction.id} style={styles.view}>
          <TouchableOpacity
            style={styles.Touch}
            onPress={() => {
              console.log(prediction.description);
              this.setState({ destination: prediction.description });
              this.props.getDestinationIfSet ? this.props.getDestinationIfSet(prediction.description) : '';
              this.getLatLong(prediction.place_id);
              this.setState({ showPredictions: false });
              Keyboard.dismiss();
            }}
          >
            <Text key={prediction.id}>{prediction.description}</Text>
          </TouchableOpacity>
        </View>
      );
    });

    const searchIcon = this.state.hideMenu && <Icon navigation={this.props.navigation} />;

    /**
     *
     * @param {*} destination
     * Controller function for searchBar component
     * manages contextual text entry
     */
    const onChangeText = (destination) => {
      return this.onChangeDestination(destination);
    };

    /**
     * Controller function for searchBar component
     * sets state when search bar is cleared
     */
    const onClear = () => {
      this.setState({ showPredictions: true });
    };

    /**
     * Controller function for searchBar component
     * Defines UI behaviour of component when triggered by touch event
     */
    const onTouchStart = () => {
      this.props.setCampusToggleVisibility(true);
    };

    /**
     * Controller function for searchBar component
     */
    const onBlur = () => {
      this.props.setCampusToggleVisibility(false);
    };

    const containerStyle = {
      borderRadius: 10,
      borderWidth: 1,
      height: 45,
      justifyContent: 'center'
    };

    return (
      <View style={styles.container}>
        <View>
          <SearchBar
            platform="android"
            autoCorrect={false}
            padding={5}
            returnKeyType="search"
            lightTheme
            containerStyle={containerStyle}
            searchIcon={searchIcon}
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={this.state.destination}
            style={styles.SearchBar}
            onClear={onClear}
            onTouchStart={onTouchStart}
            onBlur={onBlur}
            blurOnSubmit
          />
        </View>
        {
          this.state.showPredictions
            ? predictions : null
        }
      </View>
    );
  }
}

const Icon = (props) => {
  return (
    <TouchableHighlight onPress={() => { return props.navigation.navigate('Menu'); }}>
      <Image style={styles.burger} source={burger} />
    </TouchableHighlight>
  );
};
