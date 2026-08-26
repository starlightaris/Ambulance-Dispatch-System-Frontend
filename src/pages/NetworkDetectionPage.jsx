import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/network-detection/Sidebar.jsx';
import MapView from '../components/network-detection/MapView.jsx';
import {
  fetchNodes,
  fetchEdges,
  fetchAmbulances,
  fetchBlindSpots,
  fetchCoverageCurve
} from '../api/networkDetection.api.js';
import '../styles/network-detection.css';

const CURVE_THRESHOLDS = [5, 10, 15, 20, 25, 30, 35, 40];

export default function NetworkDetectionPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [blindSpots, setBlindSpots] = useState([]);
  const [coverageCurve, setCoverageCurve] = useState([]);
  const [threshold, setThreshold] = useState(10.0);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [flyToTarget, setFlyToTarget] = useState(null);

  const loadGraph = useCallback(async () => {
    const [n, e, a] = await Promise.all([fetchNodes(), fetchEdges(), fetchAmbulances()]);
    setNodes(n);
    setEdges(e);
    setAmbulances(a);
    return n;
  }, []);

  const loadBlindSpots = useCallback(async (currentThreshold) => {
    const spots = await fetchBlindSpots(currentThreshold);
    setBlindSpots(spots);
  }, []);

  const loadCoverageCurve = useCallback(async () => {
    const curve = await fetchCoverageCurve(CURVE_THRESHOLDS);
    setCoverageCurve(curve);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadGraph();
        await Promise.all([loadBlindSpots(threshold), loadCoverageCurve()]);
        setConnected(true);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error(err);
        setConnected(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(async () => {
      try {
        await loadBlindSpots(threshold);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error(err);
        setConnected(false);
      }
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold]);

  const availableAmbulances = ambulances.filter((a) => a.status === 'AVAILABLE').length;

  return (
    <div className="app">
      <Sidebar
        connected={connected}
        threshold={threshold}
        onThresholdChange={setThreshold}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        availableAmbulances={availableAmbulances}
        blindSpots={blindSpots}
        onSelectBlindSpot={setFlyToTarget}
        coverageCurve={coverageCurve}
      />
      <MapView
        nodes={nodes}
        edges={edges}
        ambulances={ambulances}
        blindSpots={blindSpots}
        threshold={threshold}
        lastUpdated={lastUpdated}
        flyToTarget={flyToTarget}
      />
    </div>
  );
}
