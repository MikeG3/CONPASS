/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { View } from 'react-native';
import MapView, {
  Polygon, Polyline, PROVIDER_GOOGLE, Marker
} from 'react-native-maps';
import buildings from '../../assets/polygons/polygons';
import styles from './styles';

export default class TheMap extends Component {
  /**
 * Represents a map.
 * @constructor
 */
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      coordinate: {
        latitude: 45.492409,
        longitude: -73.582153,
      },
    };
  }

  componentDidMount() {
    this.setState({ mapRef: this.mapRef },
      () => { this.fitScreenToPath(this.props.updatedCoordinates); });
  }

  componentDidUpdate(prevProps) {
    const coordinates = this.props.updatedCoordinates;
    if (prevProps.updatedCoordinates !== coordinates) {
      this.fitScreenToPath(coordinates);
    }
  }

  fitScreenToPath(coordinates) {
    this.state.mapRef.fitToCoordinates(coordinates, {
      edgePadding: {
        top: 180, right: 20, bottom: 10, left: 20
      }
    });
  }


  render() {
    const currRef = (ref) => { this.mapRef = ref; };
    return (
      <View style={styles.container}>
        <MapView
          showsUserLocation
          ref={currRef}
          provider={PROVIDER_GOOGLE}
          region={this.props.updatedRegion}
          style={styles.mapStyle}
        >
          <Polyline
            coordinates={this.props.updatedCoordinates}
            strokeWidth={4}
            strokeColor="black"
          />
          {buildings.map((building) => {
            return (
              building.polygons.map((polygon) => {
                return (
                  <CustomPolygon
                    key={polygon.name}
                    coordinates={polygon.coordinates}
                    fillColor="rgba(255,135,135,0.5)"
                  />
                );
              })
            );
          })}

          <Marker
            coordinate={{
              latitude: this.props.updatedRegion.latitude,
              longitude: this.props.updatedRegion.longitude
            }}
            title="title"
            description="description"
          />
        </MapView>
      </View>
    );
  }
}

function CustomPolygon({ onLayout, ...props }) {
  const ref = React.useRef();

  function onLayoutPolygon() {
    if (ref.current) {
      ref.current.setNativeProps({ fillColor: props.fillColor });
    }
    // call onLayout() from the props if you need it
  }
  return <Polygon ref={ref} onLayout={onLayoutPolygon} {...props} />;
}
