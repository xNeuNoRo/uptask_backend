import { Registry, collectDefaultMetrics } from "prom-client";

// Create a single Prometheus registry instance
const prometheusRegistry = new Registry();
// Collect default metrics and register them to the registry
collectDefaultMetrics({ register: prometheusRegistry });

// Export the registry for use in other parts of the application
export default prometheusRegistry;
