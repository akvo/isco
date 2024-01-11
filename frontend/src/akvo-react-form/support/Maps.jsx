import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { Row, Col, InputNumber, Form, Button, message } from "antd";
import ds from "../lib/db";
import GlobalStore from "../lib/store";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const DraggableMarker = ({ changePos, position }) => {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      // eslint-disable-next-line
      dragend() {
        const marker = markerRef.current;
        if (marker !== null) {
          const newPos = marker.getLatLng();
          changePos(newPos);
        }
      },
    }),
    [changePos]
  );

  // eslint-disable-next-line
  useMapEvents({
    // eslint-disable-next-line
    click(e) {
      const newPos = e.latlng;
      changePos(newPos);
    },
  });

  if (position?.lat === null && position?.lng === null) {
    return "";
  }

  return (
    <Marker
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      draggable
    />
  );
};

const showGeolocationError = (error) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message.info("User denied the request for Geolocation.");
      console.error("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      message.info("Location information is unavailable.");
      console.error("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      message.info("The request to get user location timed out.");
      console.error("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      message.info("An unknown error occurred.");
      console.error("An unknown error occurred.");
      break;
  }
};

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const Maps = ({ id, center, initialValue, meta, uiText }) => {
  const form = Form.useFormInstance();
  const formConfig = GlobalStore.useState((s) => s.formConfig);
  const { autoSave } = formConfig;
  const [position, setPosition] = useState({ lat: null, lng: null });

  const updateMetaGeo = useCallback(
    (geo) => {
      if (meta) {
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: geo,
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  const changePos = (newPos) => {
    setPosition(newPos);
    if (newPos?.lat !== null && newPos?.lng !== null) {
      form.setFieldsValue({ [id]: newPos });
      updateMetaGeo(newPos);
      if (autoSave?.name) {
        ds.value.update({ value: { [id]: newPos } });
        GlobalStore.update((s) => {
          s.current = { ...s.current, [id]: newPos };
        });
      }
    }
  };

  const onChange = (cname, e) => {
    changePos({ ...position, [cname]: e === null ? null : parseFloat(e) });
  };

  const setPositionByBrowserGPS = (position) => {
    const { coords } = position;
    const geoValue = { lat: coords?.latitude, lng: coords?.longitude };
    changePos(geoValue);
  };

  const onUseMyLocation = () => {
    // use browser Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        setPositionByBrowserGPS,
        showGeolocationError
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    if (initialValue?.lat && initialValue?.lng) {
      setPosition(initialValue);
      form.setFieldsValue({ [id]: initialValue });
      updateMetaGeo(initialValue);
    } else {
      setPosition({ lat: null, lng: null });
    }
  }, [initialValue, id, form, updateMetaGeo]);

  const mapCenter =
    position.lat !== null && position.lng !== null
      ? position
      : center || defaultCenter;

  return (
    <div className="arf-field arf-field-map">
      <Row
        justify="space-between"
        style={{ marginBottom: "10px" }}
        gutter={[20, 12]}
      >
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Button type="default" onClick={onUseMyLocation}>
            {uiText.useMyLocation}
          </Button>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item name={[id, "lat"]} noStyle>
            <InputNumber
              placeholder="Latitude"
              inputMode="numeric"
              style={{ width: "100%" }}
              value={position?.lat === null ? null : position?.lat}
              min="-90"
              max="90"
              onChange={(e) => onChange("lat", e)}
              stringMode
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item name={[id, "lng"]} noStyle>
            <InputNumber
              placeholder="Longitude"
              inputMode="numeric"
              className="site-input-right"
              style={{ width: "100%" }}
              value={position?.lng === null ? null : position?.lng}
              min="-180"
              max="180"
              onChange={(e) => onChange("lng", e)}
              stringMode
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={false}
            className="arf-leaflet"
          >
            <ChangeView center={mapCenter} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker
              form={form}
              id={id}
              changePos={changePos}
              position={position}
            />
          </MapContainer>
        </Col>
      </Row>
    </div>
  );
};

export default Maps;
