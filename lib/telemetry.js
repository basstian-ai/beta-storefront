import appInsights from 'applicationinsights';

export function setupTelemetry() {
  if (!process.env.APPINSIGHTS_INSTRUMENTATIONKEY) return;

  appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
    .setAutoCollectConsole(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectDependencies(true)
    .start();

  console.log('[Telemetry] Application Insights initialized.');
}
