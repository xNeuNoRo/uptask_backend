import { credentials, Metadata } from "@grpc/grpc-js";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";

const metadata = new Metadata();
metadata.set(
  "authorization",
  "Basic " +
    Buffer.from(
      `${process.env.GRAFANA_TEMPO_STACK_ID}:${process.env.GRAFANA_TOKEN}`,
    ).toString("base64"),
);

const traceExporter = new OTLPTraceExporter({
  url: "tempo-prod-26-prod-us-east-2.grafana.net:443",
  credentials: credentials.createSsl(),
  metadata,
});

const resource = resourceFromAttributes({
  "service.name": "p10-uptask-server",
  "deployment.environment": process.env.NODE_ENV || "development",
});

const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on("SIGTERM", () => {
  sdk.shutdown().catch(console.error);
});
