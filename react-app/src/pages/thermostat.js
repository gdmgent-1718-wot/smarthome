// @flow
import React, { Component } from "react";
import styled from "styled-components";
import Sensor from "../components/sensor";
import Weather from "../components/weather";
import Slider from "../components/slider";

import type { DeviceType } from "../types";

type PropTypes = {
  sensors: Array<DeviceType>,
  sensorRef: any
};

type StateTypes = {
  weather?: any
};

const SensorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
`;

const SliderContainer = styled.div`
  padding: 40px 0;
`;

const SliderLabel = styled.h3`
  font-size: 1.8rem;
  padding-bottom: 30px;
  text-align: center;
`;

export default class Thermostat extends Component<PropTypes, StateTypes> {
  state = {
    weather: null
  };

  steps = 14;
  startValue = 14;

  componentDidMount() {
    this.getWeather();

    this.props.sensorRef.child("thermostat").once("value", snapshot => {
      if (snapshot.val() && snapshot.val().value) {
        this.setState({ thermostat: snapshot.val().value });
      } else {
        this.createThermostatInFirebase();
      }
    });
  }

  createThermostatInFirebase = () => {
    this.props.sensorRef.child("thermostat").set({
      platform: "thermostat",
      topic: "thermostat",
      value: this.startValue
    });

    this.setState({ thermostat: this.startValue });
  };

  getWeather = () => {
    this.fetchWeather("Ghent,BE").then(weather => {
      this.setState({ weather });
    });
  };

  fetchWeather = location => {
    const api = "6af9fb53041ac3817dbf1cd43c57636a";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${
      location
    }&appid=${api}&units=metric`;

    return fetch(url, {
      accept: "application/json"
    })
      .then(resp => resp.json())
      .then(respons => {
        return respons;
      })
      .catch(function(error) {
        return false;
      });
  };

  renderThermostatTab = (sensors, sensorRef) => {
    return sensors.map(sensor => {
      if (sensor.platform === "thermostat") {
        return null;
      } else {
        return (
          <Sensor sensor={sensor} sensorRef={sensorRef} key={sensor.key} />
        );
      }
    });
  };

  changeStep = step => {
    const thermostat = step + this.startValue;
    this.props.sensorRef.child("thermostat").update({
      value: thermostat
    });
    this.setState({ thermostat });
  };

  render() {
    const { sensors, sensorRef } = this.props;
    const { weather, thermostat } = this.state;

    return (
      <div>
        <Weather weather={weather} />
        <SensorContainer>
          {this.renderThermostatTab(sensors, sensorRef)}
        </SensorContainer>
        <SliderContainer>
          <SliderLabel>Control inside temperature</SliderLabel>
          <Slider
            step={thermostat - this.startValue}
            sensorRef={sensorRef}
            changeStep={this.changeStep}
            steps={this.steps}
            startValue={this.startValue}
          />
        </SliderContainer>
      </div>
    );
  }
}