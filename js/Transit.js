import React, {Component} from 'react';
import * as RL from 'react-leaflet';

export function mapAllStationsSorted(stationsObj, fn) {
  var stationsArr = [];
  for (var key in stationsObj) {
    stationsArr.push(stationsObj[key]);
  }

  stationsArr.sort((sa, sb) => sa.edges.length - sb.edges.length);

  return stationsArr.map(fn);
}

export function buildTransitData(json) {
  var stations = json.stations;

  for (var stationName in stations) {
    var station = stations[stationName];
    station.name = stationName;
    station.edges = [];
  }

  json.edges.map(edge => {
    if (edge.from && !stations[edge.from])
      return console.error('unknown "from" station in edge', edge);
    if (edge.to && !stations[edge.to])
      return console.error('unknown "to" station in edge', edge);

    if (edge.from)
      stations[edge.from].edges.push(edge);
    if (edge.to)
      stations[edge.to].edges.push(edge);
  });

  for (var stationName in stations) {
    var station = stations[stationName];
    if (station.edges.length <= 0) {
      console.error("unused station", station);
    }
  }

  return json;
}

function getEdgeStyle(edge) {
  var style = {color: "#f0f"};

  if (edge.type == "planned")
    style.dashArray = [10];

  if (edge.type == "ground")
    style.dashArray = [0,5];

  if (edge.tracks)
    style.color = '#00f';
  else
    style.color = '#f00';

  if (edge.type == "planned")
    style.color = '#ff0';
  if (edge.type == "ice")
    style.color = '#0ff';

  return style;
}

export class TransitEdge extends Component {
  render() {
    var edge = this.props.edge;
    var style = getEdgeStyle(edge);

    // TODO list stops in popup
    return <RL.Polyline
      title={edge.name}
      positions={edge.positions.map(p => [p[2] + .5, p[0] + .5])}
      weight={5}
      {...style}
    >
        <RL.Popup><span>
          {edge.type} rail with {
            edge.tracks ? edge.tracks : 'no'
          } {edge.tracks != 1 ? 'tracks' : 'track'}
          <br />
          {edge.from || '?'} &mdash; {edge.to || '?'}
        </span></RL.Popup>
      }
    </RL.Polyline>;
  }
}

export class TransitStation extends Component {
  render() {
    var station = this.props.station;
    var [x, y, z] = station.pos;

    var style = {color: 'black', fillColor: 'white', radius: 7};
    var firstEdge = station.edges[0];
    if (station.edges.length == 2) {
      var edgeStyle = getEdgeStyle(firstEdge);
      // just a stop
      style = {color: edgeStyle.color, fillColor: 'white', radius: 7};
    }

    return <RL.CircleMarker
      title={station.name}
      center={[z + .5, x + .5]}
      weight={2}
      fillOpacity={1}
      {...style}
    >
      <RL.Popup><span>
        {station.name} station
        <br />
        {x} {y} {z}
      </span></RL.Popup>
    </RL.CircleMarker>
  }
}
